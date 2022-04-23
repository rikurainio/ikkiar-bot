const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Shows LoL inhouse leaderboard'),
	async execute(interaction) {
		await interaction.reply('leaderboard placeholder.');
	},
};