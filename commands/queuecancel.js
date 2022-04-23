const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queuecancel')
		.setDescription('Cancels users LoL queue'),
	async execute(interaction) {
		await interaction.reply('queue cancelled.');
	},
};