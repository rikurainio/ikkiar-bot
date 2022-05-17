// QUEUE SYSTEM BUTTON CONSTS ( COMP ROWS )
const { MessageActionRow, MessageButton, } = require('discord.js');

const row = new MessageActionRow()
.addComponents(
	new MessageButton()
		.setCustomId('topbutton')
		.setLabel('top')
		.setStyle('SECONDARY')
		.setEmoji('851440899144548352')
		.setDisabled(true),

	new MessageButton()
		.setCustomId('junglebutton')
		.setLabel('jungle')
		.setStyle('SECONDARY')
		.setEmoji('851440898989359174')
		.setDisabled(true),

	new MessageButton()
		.setCustomId('midbutton')
		.setLabel('mid')
		.setStyle('SECONDARY')
		.setEmoji('851440898729836595')
		.setDisabled(true),

	new MessageButton()
		.setCustomId('adcbutton')
		.setLabel('adc')
		.setStyle('SECONDARY')
		.setEmoji('851440927146770492')
		.setDisabled(true),

	new MessageButton()
		.setCustomId('supportbutton')
		.setLabel('support')
		.setStyle('SECONDARY')
		.setEmoji('851440898948071494')
		.setDisabled(true),
);
const row2 = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('cancelbutton')
				.setLabel('leave')
				.setStyle('SECONDARY')
				.setEmoji('✖')
				.setDisabled(true)
		)

//RECREATE ENABLED ROWS BECAUSE MONKE
const row3 = new MessageActionRow()
.addComponents(
	new MessageButton()
		.setCustomId('topbutton')
		.setLabel('top')
		.setStyle('SECONDARY')
		.setEmoji('851440899144548352')
		.setDisabled(false),

	new MessageButton()
		.setCustomId('junglebutton')
		.setLabel('jungle')
		.setStyle('SECONDARY')
		.setEmoji('851440898989359174')
		.setDisabled(false),

	new MessageButton()
		.setCustomId('midbutton')
		.setLabel('mid')
		.setStyle('SECONDARY')
		.setEmoji('851440898729836595')
		.setDisabled(false),

	new MessageButton()
		.setCustomId('adcbutton')
		.setLabel('adc')
		.setStyle('SECONDARY')
		.setEmoji('851440927146770492')
		.setDisabled(false),

	new MessageButton()
		.setCustomId('supportbutton')
		.setLabel('support')
		.setStyle('SECONDARY')
		.setEmoji('851440898948071494')
		.setDisabled(false),
);
const row4 = new MessageActionRow()
		.addComponents(
			new MessageButton()
				.setCustomId('cancelbutton')
				.setLabel('leave')
				.setStyle('SECONDARY')
				.setEmoji('✖')
				.setDisabled(false)
		)

// METHODS

const toggleButtons = async (message, content, handle) => {
    if(content === undefined){
        if(handle === 'enable') {
            await message.edit({ components: [row3, row4]})
        }
        if(handle === 'disable') {
            await message.edit({ components: [row, row2]})
        }
    }
    else{
        if(handle === 'enable') {
            await message.edit({ content: content, components: [row3, row4]})
        }
        if(handle === 'disable') {
            await message.edit({ content: content, components: [row, row2]})
        }
    }
}

module.exports = { toggleButtons }