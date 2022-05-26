const { SlashCommandBuilder } = require('@discordjs/builders')
const Summoner = require("../models/summoner")
const { MessageActionRow, MessageButton, MessageEmbed, } = require('discord.js');

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
        const imageEmbed = new MessageEmbed().setImage(imageSource)

        await interaction.reply({
            content: `To verify your EUW league account, login to Summoner [${summonerName}]\nand change your icon to [${imageId}]: \n \n`
            + 'Click verify when you have changed the icon in the League client. \n',
            embeds: [imageEmbed],
            ephemeral: true,
            components: [verifyRow],
        })

        console.log('lol icon:', leagueIcon)
	}
}