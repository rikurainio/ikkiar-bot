require('dotenv').config()
const fs = require('node:fs');
const mongoose = require('mongoose')
const axios = require('axios')
const Summoner = require('./models/summoner')

const { getUpdatedQueueStatusText, queueSummoner, unqueueSummoner,
		summonerCanAcceptGame, unqueueAFKs,
		 enoughSummoners, find10Accepts, removeMatchedSummonersFromQueue, 
		 getLobbySummonerNamesToTag, setEveryDuplicateAccepted,
		  saveReplayFileMatch, checkIfReplayAlreadySaved, setSingleAccepted, clearQueue } = require('./utils/matchtools')

const { matchParserKEKW } = require('./utils/matchparser');
const{ createPostGameMessage } = require('./utils/postgamemsg');
const{ row, row2, row3, row4 } = require('./utils/toggleButtons')

// DISCORD.JS CLASSES
const { Client, Collection, Intents} = require('discord.js');
const { scorePlayers } = require('./utils/summonertools');
const { assignRoleOnButtonClick } = require('./utils/handleButtons');

//CONNECT TO DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// CREATE NEW CLIENT /////////////////////////////////////////////////////////////////////////
const client = new Client({ intents: [	Intents.FLAGS.GUILDS, 
										Intents.FLAGS.GUILD_MESSAGES, 
										Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
client.commands = new Collection();
const commandFiles = fs
					.readdirSync('./commands')
					.filter(file => file.endsWith('.js'))

for(const file of commandFiles){
	const command = require(`./commands/${file}`)
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// WHEN CLIENT IS READY //////////////////////////////////////////////////////////////////////
client.once('ready', () => {
	console.log('Ready!');
});


// GETS CALLED ON EVERY MESSAGE CREATION BY USERS, BOT ///////////////////////////////////////
client.on('messageCreate', async (message) => {
	if(message.author.bot) return;

	const file = message.attachments.first()?.url
	if(!file){return}
	const fileName = message.attachments.first()?.name
	const fileNameParsed = fileName.substring(0, fileName.indexOf('.'))
	
	if(await checkIfReplayAlreadySaved(fileNameParsed)){
		message.channel.send('🙉 This match has already been saved!')
	}
	else if(fileName.includes('EUW1-') && fileName.includes('.rofl')){
		console.log('trying to save euw rofl file')
		try {
			const response = await axios.get(file)
			const json = matchParserKEKW(response.data)
			console.log('type of axios get res data:', typeof(json))
	
			if(json){
				let matchData = json
				matchData['statsJson'] = JSON.parse(json['statsJson'])
				matchData['createdAt'] = Date.now()
				matchData['matchId'] = fileNameParsed
	
				await saveReplayFileMatch(matchData)
				await scorePlayers(matchData)

				message.channel.send('🐵 Match saved! \n More details at: https://www.ikkiar.club/history')
				message.channel.send(createPostGameMessage(matchData.statsJson));
			}
		}
		catch (err) { console.log('err in file handling' , err) }
	}
})


// GETS CALLED WHEN THE CLIENT INTERACTS ///////////////////////////////////////////////////////
client.on('interactionCreate', async interaction => {
	if (interaction.isButton()){
		if(interaction === undefined){ return }

		const message = interaction.message
		let cmdn = message.interaction.commandName

		// GET PRESSER DISCORD USER DETAILS
		const id = interaction.user.id
		const name = interaction.user.username
		const timeNow = Date.now()
		const newQueueUser = {
			discordName: name,
			discordId: id,
			queuedAt: timeNow,
			inLobby: false,
			accepted: false
		}
		
		if(interaction.customId === 'readyverifybutton'){
			// GET SUMMONER ICON ID FROM RIOT API
			const config = {
				headers: {
					"X-Riot-Token": process.env.RIOT_API_KEY
				}
			}

			const response = await axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summonerName, config)
			const summoner = response.data
			const summonerIconIdInUse = summoner.profileIconId

			const msg = interaction.message.content
			const verifyIconId = msg.substring(msg.indexOf('[') + 1, msg.indexOf(']'))

			console.log(verifyIconId)

			if(verifyIconId.toString() === summonerIconIdInUse.toString()){

				foundSummoner = await Summoner.findOne({username:summonerName})
        		if(foundSummoner === null){
					const newSummoner = {
						username: summonerName,
						points: 1000,
						wins: 0,
						losses: 0,
						discordId: interaction.user.id
					}
				summonerDat = new Summoner(newSummoner)
				await summonerDat.save()
        		}
				else {
					await Summoner.findOneAndUpdate({username:summonerName},{discordId:interaction.user.id})
				}
				await interaction.reply({ content: 'Verification successful \nYou can dismiss these messages', ephemeral: true })
			}
			else{
				await interaction.reply({ content: 'Could not verify Summoner. \nTry again or dismiss these messages', ephemeral: true })
			}
		}

		if(interaction.customId === 'cancelverifybutton'){
			await interaction.reply({ content: 'Verification cancelled \nYou can dismiss these messages', ephemeral: true })
		}

		if(interaction.customId === 'cancelbutton' || interaction.customId === 'procancelbutton'){
			try { await interaction.reply({ content: 'Took you out of queue 🐒', ephemeral: true }) }
			catch (err) { console.log('error sending ephemeral remove queue message.', err) }

			await unqueueSummoner(newQueueUser)
			const newMessageContent = await getUpdatedQueueStatusText(name, 'left')
			await message.edit({ content: newMessageContent, components: [row3, row4]})
		}

		let role = assignRoleOnButtonClick(interaction)
		if(interaction !== undefined && role.length > 0){
			newQueueUser.role = role

			try { await interaction.reply({ content: 'You are in! 🐵', ephemeral: true }) }
			catch (err) { console.log('error sending with ephemeral message. ', err) }

			// KEEP THE BALL ROLLING IF THERE ARE LOBBIES TO MAKE
			await queueSummoner(newQueueUser)
			const newMessageContent = await getUpdatedQueueStatusText(name, 'queued ' + role)
			await message.edit({ content: newMessageContent, components: [row3, row4]})

			const handleRunning = async () => {
				await message.edit({ components: [row3, row4]})
				let lobbyDeclined = false
				let matchFormed = false

				if(await enoughSummoners()){
					let popMessageExists = false;
					let tagSummonersContent = await getLobbySummonerNamesToTag()

					//DISABLE QUEUE BUTTONS WHILE SITUATION IS RESOLVED
					await message.edit({ components: [row, row2]})
					const popMsg = await interaction.channel.send(tagSummonersContent + '\n**Accept** | **Decline**\n')
					await popMsg.react('✅')
					await popMsg.react('❌')
					popMessageExists = true

					const filter = (reaction, user) => {
						return ['✅', '❌'].includes(reaction.emoji.name) && summonerCanAcceptGame(user.id)
					};
					const collector = popMsg.createReactionCollector({ filter, time: 120000 });
					let acceptCounter = 0

					collector.on('collect', async (reaction, user) => {

						if(reaction.emoji.name == '✅'){
							acceptCounter += 1
							await setSingleAccepted(user.id, true)
							//await setEveryDuplicateAccepted(user.id, true)
							const newMessageContent = await getUpdatedQueueStatusText(user.username, 'accepted match')
							await message.edit(newMessageContent)

							if(acceptCounter === 10){
								console.log('match counter 10')

								matchFormed = true
								const newMessageContent = await getUpdatedQueueStatusText('Ikkiar', 'match created:')
								await message.edit({ content: newMessageContent })

								await removeMatchedSummonersFromQueue()
								//await clearQueue()

								try {
									await popMsg.delete()
									popMessageExists = false
								} catch (err) { 
									console.log(err) }

								
								// AFTER 5 MIN UNFREEZE QUEUEING
								setTimeout(async () => {
									const newMessageContent = await getUpdatedQueueStatusText('Ikkiar', 'scouting for new lobbies to form:')

									try {
										await message.edit({ content: newMessageContent, components: [row3, row4] })
									}
									catch (err) {
										console.log('error enabling buttons after waiting 5 minutes on MM', err)
									}

								}, 300000)
							}
						}
						
						if(reaction.emoji.name == '❌'){
							lobbyDeclined = true
							await unqueueSummoner({ discordId: user.id })
							const newMessageContent = await getUpdatedQueueStatusText(user.username, 'declined match')

							try {
								await popMsg.delete() 
								popMessageExists = false
							}
							catch (err) {
								console.log('error deleting popmsg after someone reacted X', err)
							}
							let enough = await enoughSummoners()
							console.log('enough summoners=?', enough)
							if(enough){
								await handleRunning()
							}
							await message.edit({ content: newMessageContent, components: [row3, row4]})
						}
					});

					collector.on('end', async (collected) => {
						if(!lobbyDeclined){
							console.log('c: pop exists?', popMessageExists)
							if(popMessageExists){
								console.log('c: deleting popmsg')
								try {
									await popMsg.delete()
									popMessageExists = false;
								} catch(err){console.log('c: error deleting popmessage on collector end')}
							}
	
							// IF NO REACTION WAS GIVEN JUST UNQUEUE THOSE PPL
							console.log('c: 2 minutes passed, unqueueAFKs called:')
							await unqueueAFKs()
							
							if(!matchFormed){
								await message.edit({ components: [row3, row4]})
								
								if(await enoughSummoners()){
									const newMessageContent = await getUpdatedQueueStatusText('Ikkiar', 'unqueued afks. new lobby:')
									await message.edit({ content: newMessageContent })
									await handleRunning()
								}
								else{
									const newMessageContent = await getUpdatedQueueStatusText('Ikkiar', 'Someone didn\'t react in time')
									await message.edit({ content: newMessageContent })
									await handleRunning()
								}
							}
						}
					});
				}
				else { return }
			}
			await handleRunning()
		}
	}

	// IF INTERACTION WAS NOT A BUTTON INTERACTION ==>
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;
	try {
		if(command) await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.BOT_TOKEN);