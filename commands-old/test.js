const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Big tester command'),
	async execute(interaction) {
		await interaction.reply(`test: ${JSON.stringify(interaction.user)}`);
	},
};