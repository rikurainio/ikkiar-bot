const { SlashCommandBuilder } = require('@discordjs/builders');

// MONGO
//const User = require('../models/user')
const Match = require('../models/match')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('matchesclear')
		.setDescription('developer tool - empty the match history'),
		
	async execute(interaction) {
		const deleteResult = await Match.deleteMany({})
		await interaction.reply('🧹 Match history reset');
	},
};