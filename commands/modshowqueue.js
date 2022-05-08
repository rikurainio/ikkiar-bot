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
					.setEmoji('851440899144548352'),

				new MessageButton()
					.setCustomId('junglebutton')
					.setLabel('jungle')
					.setStyle('SECONDARY')
					.setEmoji('851440898989359174'),

				new MessageButton()
					.setCustomId('midbutton')
					.setLabel('mid')
					.setStyle('SECONDARY')
					.setEmoji('851440898729836595'),

				new MessageButton()
					.setCustomId('adcbutton')
					.setLabel('adc')
					.setStyle('SECONDARY')
					.setEmoji('851440927146770492'),

				new MessageButton()
					.setCustomId('supportbutton')
					.setLabel('support')
					.setStyle('SECONDARY')
					.setEmoji('851440898948071494'),
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