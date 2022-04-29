require('dotenv').config()
const fs = require('node:fs');
const mongoose = require('mongoose')
const { MessageActionRow, MessageButton, } = require('discord.js');

const { getUpdatedQueueStatusText, queueSummoner, unqueueSummoner,
		summonerCanAcceptGame, setAccepted, unqueueAFKs,
		 enoughSummoners, find10Accepts, removeMatchedSummonersFromQueue, getLobbySummonerNamesToTag} = require('./utils/matchtools')

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

// CREATE NEW CLIENT
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
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

// GETS CALLED WHEN THE CLIENT INTERACTS
client.on('interactionCreate', async interaction => {

	// TODO: MOVE THESE BUTTON HANDLERS TO THEIR OWN MODULES
	if (interaction.isButton()){
		let deferred = false;
		let removedMMSFromQueue = false;

		setTimeout(async () => {
			if(!deferred){
				try{
					if(interaction){
						await interaction.deferUpdate()
						deferred = true
					}
				} catch(err){console.log('error ROW 67')}
			}
		}, 0)

		// GET PRESSER DISCORD USER DETAILS
		const id = interaction.user.id
		const name = interaction.user.username
		const timeNow = Date.now()
		let role = ''

		// DEV HELP
		const message = interaction.message

		const newQueueUser = {
			discordName: name,
			discordId: id,
			queuedAt: timeNow,
			inLobby: false,
			accepted: false
		}
		
		if(interaction.customId === 'cancelbutton'){
			await unqueueSummoner(newQueueUser)
			const newMessageContent = await getUpdatedQueueStatusText(name, 'left')
			await message.edit(newMessageContent)
			
			if(!deferred){ 
				deferred = true
				await interaction.deferUpdate()
			}
		}
		else {
			if(interaction.customId === 'topbutton'){
				interaction.component.setStyle('SUCCESS')
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
			
			//RECREATE DISABLED ROWS BECAUSE MONKE
			const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('topbutton')
					.setLabel('top')
					.setStyle('SECONDARY')
					.setEmoji('967566780295950416')
					.setDisabled(true),

				new MessageButton()
					.setCustomId('junglebutton')
					.setLabel('jungle')
					.setStyle('SECONDARY')
					.setEmoji('967566779998146660')
					.setDisabled(true),

				new MessageButton()
					.setCustomId('midbutton')
					.setLabel('mid')
					.setStyle('SECONDARY')
					.setEmoji('967566780090421288')
					.setDisabled(true),

				new MessageButton()
					.setCustomId('adcbutton')
					.setLabel('adc')
					.setStyle('SECONDARY')
					.setEmoji('967566779515826218')
					.setDisabled(true),

				new MessageButton()
					.setCustomId('supportbutton')
					.setLabel('support')
					.setStyle('SECONDARY')
					.setEmoji('967566780274999326')
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
					.setEmoji('967566780295950416')
					.setDisabled(false),

				new MessageButton()
					.setCustomId('junglebutton')
					.setLabel('jungle')
					.setStyle('SECONDARY')
					.setEmoji('967566779998146660')
					.setDisabled(false),

				new MessageButton()
					.setCustomId('midbutton')
					.setLabel('mid')
					.setStyle('SECONDARY')
					.setEmoji('967566780090421288')
					.setDisabled(false),

				new MessageButton()
					.setCustomId('adcbutton')
					.setLabel('adc')
					.setStyle('SECONDARY')
					.setEmoji('967566779515826218')
					.setDisabled(false),

				new MessageButton()
					.setCustomId('supportbutton')
					.setLabel('support')
					.setStyle('SECONDARY')
					.setEmoji('967566780274999326')
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

			let resolvingLobby = false;

			await message.edit({ components: [row, row2]})
			setTimeout(async () => {
				if(!resolvingLobby){
					await message.edit({ components: [row3, row4]})
				}
			}, 4000)

			// KEEP THE BALL ROLLING IF THERE ARE LOBBIES TO MAKE
			await queueSummoner(newQueueUser)
			const newMessageContent = await getUpdatedQueueStatusText(name, 'queued ' + role)

			if(message){
				await message.edit(newMessageContent)
			}

			const handleRunning = async () => {

				if(await enoughSummoners()){
					resolvingLobby = true;
					let tagSummonersContent = await getLobbySummonerNamesToTag()

					//DISABLE QUEUE BUTTONS WHILE SITUATION IS RESOLVED
					await message.edit({ components: [row,row2]})
					const popMsg = await interaction.channel.send(tagSummonersContent + '\n**Accept** | **Decline**\n')
					await popMsg.react('✅')
					await popMsg.react('❌')
					

					// COLLECTOR
					const filter = (reaction, user) => {
						return ['✅', '❌'].includes(reaction.emoji.name) && summonerCanAcceptGame(user.id)
					};
					const collector = popMsg.createReactionCollector({ filter, time: 120000 });

					collector.on('collect', async (reaction, user) => {

						// HANDLE ACCEPT MATCH/GAME
						if(reaction.emoji.name == '✅'){

							await setAccepted({ discordId: user.id}, true)

							const newMessageContent = await getUpdatedQueueStatusText(name, 'accepted match')
							await message.edit(newMessageContent)

							if(await find10Accepts()){
							
								// REMOVE POPMSG AND DISABLE BUTTONS IF MATCH IS MADE
								await popMsg.delete()

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

							// RESOLVE IN TWO WAYS
							// EITHER WE WENT UNDER 2 SUMMONERS PER EACH ROLE
							// OR THE STACK IS STILL VALID AND LOBBY FORMING CAN CONTINUE
							await unqueueSummoner({ discordId: user.id })
							const newMessageContent = await getUpdatedQueueStatusText(name, 'declined match')
							await message.edit(newMessageContent)
							await popMsg.delete()

							let enough = await enoughSummoners()
							if(enough){
								await handleRunning()
							}
							await message.edit({ components: [row3, row4]})	
						}
					});

					collector.on('end', async (collected) => {
						if(!popMsg === undefined){
							await popMsg.delete()
						}

						// IF NO REACTION WAS GIVEN JUST UNQUEUE THOSE PPL
						await unqueueAFKs()
						await message.edit({ components: [row3, row4]})
						if(await enoughSummoners()) {
							handleRunning()
						}
						else {
							if(!resolvingLobby){
								const newMessageContent = await getUpdatedQueueStatusText('someone', 'didn\'t react in time')
								await message.edit({ content: newMessageContent, components: [row3, row4]})
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