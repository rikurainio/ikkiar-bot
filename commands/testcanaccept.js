const { SlashCommandBuilder } = require('@discordjs/builders');
const { summonerCanAcceptGame } = require ('../utils/matchtools')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('testcanaccept')
		.setDescription('Test if certain discordId can accept the game')
        .addStringOption(option => option
            .setName('discordid')
            .setDescription('discord users id')
            .setRequired(true)),

	async execute(interaction) {
        const userId = interaction.options._hoistedOptions[0]['value']
		const canAccept = await summonerCanAcceptGame(userId)

		await interaction.reply({ content: canAccept ? userId + ' can accept the match' : ' cannot accept the match'});
	},
};