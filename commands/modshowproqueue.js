const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { getUpdatedQueueStatusText, setInitBooleanState } = require('../utils/matchtools')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('modshowproqueue')
		.setDescription('mod tool for showing pro queue status'),

	async execute(interaction) {

        const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('protopbutton')
					.setLabel('top')
					.setStyle('SECONDARY')
					.setEmoji('851440899144548352'),

				new MessageButton()
					.setCustomId('projunglebutton')
					.setLabel('jungle')
					.setStyle('SECONDARY')
					.setEmoji('851440898989359174'),

				new MessageButton()
					.setCustomId('promidbutton')
					.setLabel('mid')
					.setStyle('SECONDARY')
					.setEmoji('851440898729836595'),

				new MessageButton()
					.setCustomId('proadcbutton')
					.setLabel('adc')
					.setStyle('SECONDARY')
					.setEmoji('851440927146770492'),

				new MessageButton()
					.setCustomId('prosupportbutton')
					.setLabel('support')
					.setStyle('SECONDARY')
					.setEmoji('851440898948071494'),
			);

		const row2 = new MessageActionRow()
				.addComponents(
					new MessageButton()
						.setCustomId('procancelbutton')
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