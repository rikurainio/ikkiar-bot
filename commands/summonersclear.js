const { SlashCommandBuilder } = require('@discordjs/builders');
const { clearSummoners } = require('../utils/summonertools');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('summonersclear')
		.setDescription('developer tool - empty summoners db'),
		
	async execute(interaction) {
		await clearSummoners()
		await interaction.reply('🧹 Summoners reset');
	},
};