const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('history')
		.setDescription('show ikkiar match history'),
	async execute(interaction) {

        
		await interaction.reply({ content: 'nothing here yet' });
	},
};