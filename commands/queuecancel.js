const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queuecancel')
		.setDescription('Cancels users LoL queue'),

	async execute(interaction) {
		const name = interaction.user.username
		const id = interaction.user.id
		await interaction.reply('Queue cancelled for ' + name);
	},
};