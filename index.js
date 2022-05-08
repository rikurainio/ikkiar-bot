require('dotenv').config()
const fs = require('node:fs');
const mongoose = require('mongoose')
const axios = require('axios')

const { MessageActionRow, MessageButton, } = require('discord.js');

const { getUpdatedQueueStatusText, queueSummoner, unqueueSummoner,
		summonerCanAcceptGame, unqueueAFKs,
		 enoughSummoners, find10Accepts, removeMatchedSummonersFromQueue, 
		 getLobbySummonerNamesToTag, setEveryDuplicateAccepted,
		  saveReplayFileMatch, checkIfReplayAlreadySaved} = require('./utils/matchtools')

const { matchParser, matchParserKEKW } = require('./utils/matchparser');
const{createPostGameMessage} = require('./utils/postgamemsg');


// QUEUE SYSTEM BUTTON CONSTS ( COMP ROWS )
const row = new MessageActionRow()
.addComponents(
	new MessageButton()
		.setCustomId('topbutton')
		.setLabel('top')
		.setStyle('SECONDARY')
		.setEmoji('851440899144548352')
		.setDisabled(true),

	new MessageButton()
		.setCustomId('junglebutton')
		.setLabel('jungle')
		.setStyle('SECONDARY')
		.setEmoji('851440898989359174')
		.setDisabled(true),

	new MessageButton()
		.setCustomId('midbutton')
		.setLabel('mid')
		.setStyle('SECONDARY')
		.setEmoji('851440898729836595')
		.setDisabled(true),

	new MessageButton()
		.setCustomId('adcbutton')
		.setLabel('adc')
		.setStyle('SECONDARY')
		.setEmoji('851440927146770492')
		.setDisabled(true),

	new MessageButton()
		.setCustomId('supportbutton')
		.setLabel('support')
		.setStyle('SECONDARY')
		.setEmoji('851440898948071494')
		.setDisabled(true),
);
const row2 = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('cancelbutton')
				.setLabel('leave')
				.setStyle('SECONDARY')
				.setEmoji('✖')
				.setDisabled(true)
		)

//RECREATE ENABLED ROWS BECAUSE MONKE
const row3 = new MessageActionRow()
.addComponents(
	new MessageButton()
		.setCustomId('topbutton')
		.setLabel('top')
		.setStyle('SECONDARY')
		.setEmoji('851440899144548352')
		.setDisabled(false),

	new MessageButton()
		.setCustomId('junglebutton')
		.setLabel('jungle')
		.setStyle('SECONDARY')
		.setEmoji('851440898989359174')
		.setDisabled(false),

	new MessageButton()
		.setCustomId('midbutton')
		.setLabel('mid')
		.setStyle('SECONDARY')
		.setEmoji('851440898729836595')
		.setDisabled(false),

	new MessageButton()
		.setCustomId('adcbutton')
		.setLabel('adc')
		.setStyle('SECONDARY')
		.setEmoji('851440927146770492')
		.setDisabled(false),

	new MessageButton()
		.setCustomId('supportbutton')
		.setLabel('support')
		.setStyle('SECONDARY')
		.setEmoji('851440898948071494')
		.setDisabled(false),
);
const row4 = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('cancelbutton')
				.setLabel('leave')
				.setStyle('SECONDARY')
				.setEmoji('✖')
				.setDisabled(false)
		)

//CONNECT TO DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// DISCORD.JS CLASSES
const { Client, Collection, Intents} = require('discord.js');
const { scorePlayers } = require('./utils/summonertools');

// CREATE NEW CLIENT
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
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


// WHEN CLIENT IS READY
client.once('ready', () => {
	console.log('Ready!');
});

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
			//console.log('res:', response.data)
			const json = matchParserKEKW(response.data)
			console.log('type of axios get res data:', typeof(json))
	
			if(json){
				let matchData = json
				matchData['statsJson'] = JSON.parse(json['statsJson'])
				matchData['createdAt'] = Date.now()
				matchData['matchId'] = fileNameParsed
	
				await saveReplayFileMatch(matchData)
				await scorePlayers(matchData)

				message.channel.send('🐵 Match saved!')
				message.channel.send(createPostGameMessage(matchData.statsJson));
			}
		}
		catch (err) { console.log('err in file handling' , err) }
	}
})


// GETS CALLED WHEN THE CLIENT INTERACTS
client.on('interactionCreate', async interaction => {

	// TODO: MOVE THESE BUTTON HANDLERS TO THEIR OWN MODULES MAYBE
	if (interaction.isButton()){
		// ACCESS THE MSG
		// DISABLE BUTTONS FOR A WHILE
		const message = interaction.message
		await message.edit({ components: [row, row2]})

		// GET PRESSER DISCORD USER DETAILS
		const id = interaction.user.id
		const name = interaction.user.username
		const timeNow = Date.now()
		let role = ''


		const newQueueUser = {
			discordName: name,
			discordId: id,
			queuedAt: timeNow,
			inLobby: false,
			accepted: false
		}
		
		if(interaction.customId === 'cancelbutton'){
			await interaction.reply({ content: 'Took you out of queue 🐒', ephemeral: true })
			await unqueueSummoner(newQueueUser)
			const newMessageContent = await getUpdatedQueueStatusText(name, 'left')
			await message.edit({ content: newMessageContent, components: [row3, row4] })
		}
		else {
			await interaction.reply({ content: 'You are in! 🐵', ephemeral: true })
			if(interaction.customId === 'topbutton'){
				role = 'top'
				newQueueUser.role = 'top'
			}
			if(interaction.customId === 'junglebutton'){
				role = 'jungle'
				newQueueUser.role = 'jungle'
			}
			if(interaction.customId === 'midbutton'){
				role = 'mid'
				newQueueUser.role = 'mid'
			}
			if(interaction.customId === 'adcbutton'){
				role = 'adc'
				newQueueUser.role = 'adc'
			}
			if(interaction.customId === 'supportbutton'){
				role = 'support'
				newQueueUser.role = 'support'
			}
			// KEEP THE BALL ROLLING IF THERE ARE LOBBIES TO MAKE
			await queueSummoner(newQueueUser)
			const newMessageContent = await getUpdatedQueueStatusText(name, 'queued ' + role)
			await message.edit({ content: newMessageContent, components: [row3, row4] })

			const handleRunning = async () => {
				let lobbyDeclined = false
				let matchFormed = false

				if(await enoughSummoners()){
					let popMessageExists = false;
					let tagSummonersContent = await getLobbySummonerNamesToTag()

					//DISABLE QUEUE BUTTONS WHILE SITUATION IS RESOLVED
					await message.edit({ components: [row,row2]})
					const popMsg = await interaction.channel.send(tagSummonersContent + '\n**Accept** | **Decline**\n')
					await popMsg.react('✅')
					await popMsg.react('❌')
					popMessageExists = true

					// COLLECTOR
					const filter = (reaction, user) => {
						return ['✅', '❌'].includes(reaction.emoji.name) && summonerCanAcceptGame(user.id)
					};
					const collector = popMsg.createReactionCollector({ filter, time: 120000 });

					collector.on('collect', async (reaction, user) => {

						// HANDLE ACCEPT MATCH/GAME
						if(reaction.emoji.name == '✅'){

							//await setAccepted({ discordId: user.id}, true)
							console.log('user before setting his accepted:', user)
							await setEveryDuplicateAccepted(user.id, true)

							const newMessageContent = await getUpdatedQueueStatusText(user.username, 'accepted match')
							await message.edit(newMessageContent)

							if(await find10Accepts()){
								matchFormed = true

								// REMOVE POPMSG AND DISABLE BUTTONS IF MATCH IS MADE
								await popMsg.delete()
								popMessageExists = false

								const newMessageContent = await getUpdatedQueueStatusText('Ikkiar', 'match created:')
								await message.edit({ content: newMessageContent, compontents: [row, row2]})

								await removeMatchedSummonersFromQueue()
								// AFTER 5 MIN UNREEZE QUEUEING
								setTimeout(async () => {
									const newMessageContent = await getUpdatedQueueStatusText('Ikkiar', 'scouting for new lobbies to form:')
									await message.edit({ content: newMessageContent, components: [row3, row4]})
								}, 300000)
							}
						}

						// HANDLE DECLINE LOBBY
						if(reaction.emoji.name == '❌'){
							let lobbyDeclined = true
							// RESOLVE IN TWO WAYS
							// EITHER WE WENT UNDER 2 SUMMONERS PER EACH ROLE
							// OR THE STACK IS STILL VALID AND LOBBY FORMING CAN CONTINUE
							console.log('user obj before deletion:', user)

							await unqueueSummoner({ discordId: user.id })
							const newMessageContent = await getUpdatedQueueStatusText(user.username, 'declined match')
							await message.edit(newMessageContent)
							await popMsg.delete()
							popMessageExists = false

							let enough = await enoughSummoners()
							if(enough){
								await handleRunning()
							}
							await message.edit({ components: [row3, row4]})	
						}
					});

					collector.on('end', async (collected) => {
						if(!lobbyDeclined){
							console.log('c: pop exists?', popMessageExists)
							if(popMessageExists){
								console.log('c: deleted popmsg')
								await popMsg.delete()
								popMessageExists = false;
							}
	
							// IF NO REACTION WAS GIVEN JUST UNQUEUE THOSE PPL
							console.log('collector 2 minutes passed, unq afk called:')
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