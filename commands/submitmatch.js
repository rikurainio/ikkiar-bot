const { SlashCommandBuilder } = require('@discordjs/builders');
const { matchAlreadySaved } = require('../utils/matchhistorytools');
const { saveMatch, getMatchHistoryLength } = require('../utils/matchtools')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('submitmatch')
		.setDescription('Save match to Ikkiars memory')
        .addStringOption(option => option
            .setName('gameid')
            .setDescription('played match GameID from match history')
            .setRequired(true)),

	async execute(interaction) {
        const matchId = interaction.options._hoistedOptions[0]['value']
        
        if(await matchAlreadySaved()){
            await interaction.reply({ content: 'Match has already been saved!'})
        }
        else{
            const res = await saveMatch(matchId)
            const amountOfMatchesSaved = await getMatchHistoryLength()
            await interaction.reply(res);
        }
	},
};