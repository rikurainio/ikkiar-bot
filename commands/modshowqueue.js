const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
const { getUpdatedQueueStatusText, setEveryAccepted, setInitBooleanState } = require('../utils/matchtools')

// MONGO
//const User = require('../models/user')
const Queuer = require('../models/queuer')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modshowqueue')
		.setDescription('mod tool for showing queue status'),


	async execute(interaction) {
        const queuers = await Queuer.find({})
		let top = 0; let jungle = 0; let mid = 0; let adc = 0; let support = 0;

		queuers.forEach(summoner => {

			if(summoner.role === 'top'){
				top += 1
			}
			if(summoner.role === 'jungle'){
				jungle += 1
			}
			if(summoner.role === 'mid'){
				mid += 1
			}
			if(summoner.role === 'adc'){
				adc += 1
			}
			if(summoner.role === 'support'){
				support += 1
			}
		})

        const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('topbutton')
					.setLabel('top')
					.setStyle('SECONDARY')
					.setEmoji('967566780295950416'),

				new MessageButton()
					.setCustomId('junglebutton')
					.setLabel('jungle')
					.setStyle('SECONDARY')
					.setEmoji('967566779998146660'),

				new MessageButton()
					.setCustomId('midbutton')
					.setLabel('mid')
					.setStyle('SECONDARY')
					.setEmoji('967566780090421288'),

				new MessageButton()
					.setCustomId('adcbutton')
					.setLabel('adc')
					.setStyle('SECONDARY')
					.setEmoji('967566779515826218'),

				new MessageButton()
					.setCustomId('supportbutton')
					.setLabel('support')
					.setStyle('SECONDARY')
					.setEmoji('967566780274999326'),
			);

		const row2 = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('cancelbutton')
						.setLabel('leave')
						.setStyle('SECONDARY')
						.setEmoji('✖')
				)

		// INIT STATE
		await setInitBooleanState(false)
		const newMessageContent = await getUpdatedQueueStatusText('Ikkiar', 'is thinking')
		await interaction.reply({ content: newMessageContent, components: [row, row2] }
		);
	},
};