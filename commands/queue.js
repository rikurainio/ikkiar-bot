const { SlashCommandBuilder } = require('@discordjs/builders');

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
		await interaction.reply('Queued ' + reply.toString());
	},
};