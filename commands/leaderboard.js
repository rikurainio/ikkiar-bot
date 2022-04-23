const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Show your inhouse leaderboard'),
	async execute(interaction) {
		await interaction.reply('👑 Leaderboard');
	},
};