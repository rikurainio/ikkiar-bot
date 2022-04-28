const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { getUpdatedQueueStatusText, setInitBooleanState } = require('../utils/matchtools')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modshowqueue')
		.setDescription('mod tool for showing queue status'),

	async execute(interaction) {

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