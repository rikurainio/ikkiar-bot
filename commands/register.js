
const { SlashCommandBuilder } = require('@discordjs/builders')
const Summoner = require("../models/summoner")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('ikkiar register your lol account')
        .addStringOption(option =>
		option.setName('summonername')
			.setDescription('give your exact summonername')
			.setRequired(true)),
        
	async execute(interaction) {
        summonerName = interaction.options.getString('summonername')

        foundSummoner = await Summoner.findOne({username:summonerName})
        if(foundSummoner === null){
            const newSummoner = {
                username: summonerName,
                points: 1000,
                wins: 0,
                losses: 0,
                discordId: interaction.user.id
            }
            summonerDat = new Summoner(newSummoner)
            await summonerDat.save()
        }
        else {
            await Summoner.findOneAndUpdate({username:summonerName},{discordId:interaction.user.id})
        }
        await interaction.reply('Summoner ' + summonerName +  ' registered')
	}
}