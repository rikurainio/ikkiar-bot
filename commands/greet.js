const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('greet')
		.setDescription('greets the user'),
	async execute(interaction) {
		await interaction.reply(`Hi, ${interaction.user.username} [ ${interaction.user.id} ]`);
	},
};