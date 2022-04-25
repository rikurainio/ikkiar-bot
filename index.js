require('dotenv').config()
const fs = require('node:fs');
const mongoose = require('mongoose')

const { getUpdatedQueueStatusText, queueSummoner, unqueueSummoner,
		summonerCanAcceptGame, setAccepted, setEveryAccepted, unqueueAFKs,
		 enoughSummoners, unqueueAFKsDuplicates, find10Accepts } = require('./utils/matchtools')

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
const { error } = require('node:console');

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
		
			// KEEP THE BALL ROLLING IF THERE ARE LOBBIES TO MAKE
			const queueResponse = await queueSummoner(newQueueUser)
			const newMessageContent = await getUpdatedQueueStatusText(name, 'queued ' + role)
			await message.edit(newMessageContent)

			const handleRunning = async () => {
				
				if(await enoughSummoners()){
					const popMsg = await interaction.channel.send('```\nAccept | Decline\n```')
					await popMsg.react('✅')
					await popMsg.react('❌')

					
					/////////////////////////////////////////////////////////////////////////////////////////////////
					// COLLECTOR //////////////////////////////////////////////////////////////////////////////////
					const filter = (reaction, user) => {
						return ['✅', '❌'].includes(reaction.emoji.name) && summonerCanAcceptGame(user.id)
					};
					const collector = popMsg.createReactionCollector({ filter, time: 10000 });

					collector.on('collect', async (reaction, user) => {
						// HANDLE ACCEPT MATCH/GAME
						if(reaction.emoji.name == '✅'){
							//console.log('user accepts')
							await setAccepted({ discordId: user.id}, true)

							// ONLY WHILE DEV
							await setEveryAccepted(true)


							const newMessageContent = await getUpdatedQueueStatusText(name, 'accepted match')
							await message.edit(newMessageContent)
						}
						// HANDLE DECLINE LOBBY
						if(reaction.emoji.name == '❌'){
							//console.log('user cancels')
							await unqueueSummoner({ discordId: user.id })
							const newMessageContent = await getUpdatedQueueStatusText(name, 'declined match')
							await message.edit(newMessageContent)
							await popMsg.delete()
							return
						}});


					// COLLECTOR END ///////////////////////////////////////////////////////////////////////////////
					collector.on('end', async (collected) => {
						if(popMsg){
							try {
								await popMsg.delete()
							} catch(err){ console.log('error deleting popmsg', error )}
						}

						// WAIT A BIT IF ALL 10 SUMMONERS ACTUALLY ACCEPTED
						if(await find10Accepts()){


							// SHOW GAME INFORMATION FOR 15 minutes.
							setTimeout(async () => {
								await unqueueAFKsDuplicates()
								const newMessageContent = await getUpdatedQueueStatusText('Ikkiar', 'is thinking...')
								await message.edit(newMessageContent)
								if(enoughSummoners()){
									handleRunning()
								}
							}, 900000)
						}
					});
				}
				else{
					return
				}
				
			}
			await handleRunning()
			try{
				if(interaction){
					await interaction.deferUpdate()
				}
				else{
					return
				}
			}
			catch (err){
				console.log('last row err', err)
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