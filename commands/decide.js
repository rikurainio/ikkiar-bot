const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const axios = require('axios');

const ikkiarYesNos =
						[
						'No, Nope, Not this time, No way, Certainly Not, I think not, Ikkiar thinks no', 'OMEGALUL NO', 'Nay',

						'Yes', 'Yep', 'Ye', 'Yuppers', 'Yeppers', 'YASS', 'Of course', 'Yay', 'Ikkiar says yes'
						]

module.exports = {
	data: new SlashCommandBuilder()
		.setName('decide')
		.setDescription('Ikkiar will decide anything for you :)'),
        
	async execute(interaction) {
		const max = ikkiarYesNos.length
		const randomWordIdx = Math.floor(Math.random() * max)
		const answer = ikkiarYesNos[randomWordIdx]

        await interaction.reply(answer)
	},
};