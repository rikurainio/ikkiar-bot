const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('decide')
		.setDescription('Ikkiar will decide anything for you :)'),
        
	async execute(interaction) {

        const answer = await axios.get('https://yesno.wtf/api')
        console.log('answer: ', answer.data)
        await interaction.reply(answer.data.image)
	},
};