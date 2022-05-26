const { SlashCommandBuilder } = require('@discordjs/builders')
const Summoner = require("../models/summoner")
const { MessageActionRow, MessageButton, } = require('discord.js');

const verifyRow = new MessageActionRow()
.addComponents(
	new MessageButton()
		.setCustomId('readyverifybutton')
		.setLabel('verify')
		.setStyle('PRIMARY')
		.setDisabled(false),

	new MessageButton()
		.setCustomId('cancelverifybutton')
		.setLabel('cancel')
		.setStyle('PRIMARY')
		.setDisabled(false))

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

   

        // GET RANDOM ORIGINAL LOL SUMMONER ICON
        const imageId = Math.floor(Math.random() * 27) + 1
        if(imageId === 7 || imageId === 28) imageId = 8

        const imageSource = 'https://ddragon.leagueoflegends.com/cdn/12.9.1/img/profileicon/'+ imageId +'.png'

        const leagueIcon = {
            id: imageId,
            src: imageSource
        }

        await interaction.reply({
            content: `To verify your EUW league account, login and \nchange your icon to [${imageId}]: \n \n`
            + 'Click verify when you have changed the icon in the League client. \n' + imageSource,
            ephemeral: true,
            components: [verifyRow],
        })

        console.log('lol icon:', leagueIcon)

        /*
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
        */
	}
}