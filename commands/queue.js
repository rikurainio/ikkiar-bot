const { SlashCommandBuilder } = require('@discordjs/builders');

// MONGO
//const User = require('../models/user')
const Queuer = require('../models/queuer')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('queue to LoL inhouse')
		.addStringOption(option => option
									.setName('ingame-role')
									.setDescription('Select League role')
									.setRequired(true)
									.addChoices(
										{ name: 'Top', value: 'top' },
										{ name: 'Jungle', value: 'jungle' },
										{ name: 'Mid', value: 'mid' },
										{ name: 'Adc', value: 'adc' },
										{ name: 'Support', value: 'support'}
										)),
        
	async execute(interaction) {
		let reply = ''
		const role = interaction.options._hoistedOptions[0]['value']
		const id = interaction.user.id
		const name = interaction.user.username

		if(role === 'top'){
			reply = 'top'
		}
		if(role === 'jungle'){
			reply = 'jungle'
		}
		if(role === 'mid'){
			reply = 'mid'
		}
		if(role === 'adc'){
			reply = 'adc'
		}
		if(role === 'support'){
			reply = 'support'
		}

		const newQueueUser = {
			discordName: name,
			discordId: id,
			role: reply
		}
		const queuers = await Queuer.find({})
		const queueSize = queuers.length

		// IF DISCORD USER IS ALREADY ACTIVE IN QUEUE
		const foundUser = await Queuer.findOne({ discordId: id})
		if(foundUser){
			console.log('already in queue')
			foundUser.role = reply
			await foundUser.save()
			await interaction.reply(name.toString() + ' queued ' + reply.toString() + '.')
		}
		else{
			// IF THE QUEUE IS FULL ( 10 ) ATM
			if(queueSize < 10){
				try {
					const newQueuer = new Queuer(newQueueUser)
					const savedQueuer = await newQueuer.save()
					console.log('saved queuer: ', savedQueuer)
					console.log('queuesize2: ', queueSize)
					await interaction.reply(name.toString() + ' queued ' + reply.toString() + '.')
				}
				catch (error) {
					console.log('INSIDE', error)
					await interaction.reply('You are in queue already!')
				}
			}
			else{
				await interaction.reply('Queue is full 🥵 (10/10)')
			}
		}
	},
};