const { SlashCommandBuilder } = require('@discordjs/builders');
const { updateLeaderBoard } = require('../utils/matchhistorytools')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Show your inhouse leaderboard'),
	async execute(interaction) {

		await updateLeaderBoard()
		await interaction.reply('👑 Leaderboard');
	},
};