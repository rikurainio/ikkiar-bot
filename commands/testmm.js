const { SlashCommandBuilder } = require('@discordjs/builders');
const { matchMake } = require ('../utils/matchtools')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('testmm')
		.setDescription('Test Ikkiar match making'),
	async execute(interaction) {
		const mmAnswer = await matchMake()
		await interaction.reply({ content: mmAnswer });
	},
};