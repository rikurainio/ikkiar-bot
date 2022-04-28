const { SlashCommandBuilder } = require('@discordjs/builders');
const Queuer = require('../models/queuer')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queueclear')
		.setDescription('developer tool - empty the queue'),
		
	async execute(interaction) {
		await Queuer.deleteMany({})
		await interaction.reply('🧹 Queue reset');
	},
};