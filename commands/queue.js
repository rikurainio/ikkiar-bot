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

		const newQueuer = new Queuer(newQueueUser)

		try {
			const savedQueuer = await newQueuer.save()
			console.log('saved queuer: ', savedQueuer)
			await interaction.reply('Queued ' + reply.toString());
		}
		catch (error) {
			await interaction.reply('You are in queue already!')
		}

	},
};