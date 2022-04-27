const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('huutista')
		.setDescription('Ikkiar will decide anything for you :)'),
        
	async execute(interaction) {
        let messageContent = ''

        const random = Math.floor(Math.random() * 101)

        if(random >= 0 && random < 45){
            messageContent = '🐵 huutista'   
        }
        if(random >= 45 && random < 90){
            messageContent = '🙈 ei huutista'
        }
        if(random >= 90 && random < 96){
            messageContent = '🙊 karjista'
        }
        if(random >= 96 && random < 98){
            messageContent = '🙈 ei huutista'
        }
        if(random >= 98 && random < 100){
            messageContent = '🙈 ei huutista'
        }
        if(random === 100){
            messageContent = '🐒 loppu se vitun huutistelu'
        }
        await interaction.reply(messageContent)
	},
};