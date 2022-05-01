const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('site')
		.setDescription('show site embed    '),
	async execute(interaction) {

        const siteEmbed = new MessageEmbed()
                                .setTitle('🐒 Ikkiar')
                                .setURL('https://www.ikkiar.club/')
                                .setDescription('Statistics, Leaderboard, Info')
                                .setColor('#19b862')
                                .setFooter({ text: 'a 5v5 discord inhouse bot'})

		await interaction.reply({ content: 'for more information about monke, visit:', embeds: [siteEmbed]});
	},
};