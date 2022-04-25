require('dotenv').config()
const fs = require('node:fs');
const mongoose = require('mongoose')

const { getUpdatedQueueStatusText, queueSummoner, unqueueSummoner, summonerCanAcceptGame, setAccepted } = require('./utils/matchtools')

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
const { ButtonBuilder } = require('@discordjs/builders');

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

client.on('message', message => {
	//console.log(message)
	// if (!message.content.startsWith(prefix) || message.author.bot) return;
	//const args = message.content.slice(prefix.length).trim().split(' ');
	// const command = args.shift().toLowerCase();
});

// GETS CALLED WHEN THE CLIENT INTERACTS
client.on('interactionCreate', async interaction => {

	
	// TODO: MOVE THESE BUTTON HANDLERS TO THEIR OWN MODULES
	if (interaction.isButton()){

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
			queuedAt: timeNow
		}
		
		if(interaction.customId === 'cancelbutton'){
			await unqueueSummoner(newQueueUser)
			const newMessageContent = await getUpdatedQueueStatusText(name, 'left')
			await message.edit(newMessageContent)
			await interaction.deferUpdate(newQueueUser)
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
			const queueResponse = await queueSummoner(newQueueUser)
			const newMessageContent = await getUpdatedQueueStatusText(name, 'queued ' + role)
			

			// VER 1
			// BASICALLY CHECK IF IKKIAR RENDERED MATCH FOUND TEXTBOX
			if(!newMessageContent.includes('MATCH FOUND')){
				await message.edit(newMessageContent)
				await interaction.deferUpdate()
			}
			else{
				await message.edit(newMessageContent)

				const popMsg = await interaction.channel.send('```\nAccept | Decline\n```')
				await popMsg.react('✅')
				await popMsg.react('❌')

				//console.log(popMsg)

				// COLLECTOR 
				const filter = (reaction, user) => {
					return ['✅', '❌'].includes(reaction.emoji.name) && summonerCanAcceptGame(user.id)
				};
				const filter2 = (reactin, user) => {
					return true
				}

				const collector = popMsg.createReactionCollector({ filter, time: 120000 });

				// COLLECTOR
				collector.on('collect', async (reaction, user) => {

					// HANDLE ACCEPT MATCH/GAME
					if(reaction.emoji.name == '✅'){
						console.log('user accepts')
						await setAccepted({ discordId: user.id}, true)
					}

					// HANDLE DECLINE LOBBY
					if(reaction.emoji.name == '❌'){
						console.log('user cancels')
						await unqueueSummoner({ discordId: user.id })
						await setAccepted({ discordId: user.id}, false)
						const newMessageContent = await getUpdatedQueueStatusText(name, 'declined')
						await message.edit(newMessageContent)
					}

					console.log('user: ', user.username, 'reacted with:', reaction.emoji.name)
				});

				// AFTER 2 MINUTES
				collector.on('end', collected => {
					console.log(collected.size + '/ 10 accepted in time.')
				});

				await interaction.deferUpdate()
				/*
				message.awaitReactions({ filter, max: 1, time: 60000, errors: ['time']})
					.then(collected => {
						const reaction = collected.first()
						console.log('collected:', collected)
						if(reaction.emoji.name === '✅'){
							message.reply('You accepted')
						}
						else{
							message.reply('You cancelled')
						}
					})
					.catch(collected => {
						message.reply('You did not react or there was an error')
					})
				*/
			}
	
		}
	}


	// IF INTERACTION WAS NOT A BUTTON INTERACTION ==>
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

client.login(process.env.BOT_TOKEN);