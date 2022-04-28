const { SlashCommandBuilder } = require('@discordjs/builders');
const Match = require('../models/match')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('matchesclear')
		.setDescription('developer tool - empty the match history'),
		
	async execute(interaction) {
		await Match.deleteMany({})
		await interaction.reply('🧹 Match history reset');
	},
};