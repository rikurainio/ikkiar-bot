// QUEUE SYSTEM BUTTON CONSTS ( COMP ROWS )
const { MessageActionRow, MessageButton, } = require('discord.js');

const proRow = new MessageActionRow()
.addComponents(
    new MessageButton()
        .setCustomId('protopbutton')
        .setLabel('top')
        .setStyle('SECONDARY')
        .setEmoji('851440899144548352')
        .setDisabled(true),

    new MessageButton()
        .setCustomId('projunglebutton')
        .setLabel('jungle')
        .setStyle('SECONDARY')
        .setEmoji('851440898989359174')
        .setDisabled(true),

    new MessageButton()
        .setCustomId('promidbutton')
        .setLabel('mid')
        .setStyle('SECONDARY')
        .setEmoji('851440898729836595')
        .setDisabled(true),

    new MessageButton()
        .setCustomId('proadcbutton')
        .setLabel('adc')
        .setStyle('SECONDARY')
        .setEmoji('851440927146770492')
        .setDisabled(true),

    new MessageButton()
        .setCustomId('prosupportbutton')
        .setLabel('support')
        .setStyle('SECONDARY')
        .setEmoji('851440898948071494')
        .setDisabled(true),
);

const proRow2 = new MessageActionRow()
.addComponents(
new MessageButton()
    .setCustomId('procancelbutton')
    .setLabel('leave')
    .setStyle('SECONDARY')
    .setEmoji('✖')
    .setDisabled(true)
)


const proRow3 = new MessageActionRow()
.addComponents(
new MessageButton()
    .setCustomId('protopbutton')
    .setLabel('top')
    .setStyle('SECONDARY')
    .setEmoji('851440899144548352')
    .setDisabled(false),

new MessageButton()
    .setCustomId('projunglebutton')
    .setLabel('jungle')
    .setStyle('SECONDARY')
    .setEmoji('851440898989359174')
    .setDisabled(false),

new MessageButton()
    .setCustomId('promidbutton')
    .setLabel('mid')
    .setStyle('SECONDARY')
    .setEmoji('851440898729836595')
    .setDisabled(false),

new MessageButton()
    .setCustomId('proadcbutton')
    .setLabel('adc')
    .setStyle('SECONDARY')
    .setEmoji('851440927146770492')
    .setDisabled(false),

new MessageButton()
    .setCustomId('prosupportbutton')
    .setLabel('support')
    .setStyle('SECONDARY')
    .setEmoji('851440898948071494')
    .setDisabled(false),
);

const proRow4 = new MessageActionRow()
.addComponents(
new MessageButton()
.setCustomId('procancelbutton')
.setLabel('leave')
.setStyle('SECONDARY')
.setEmoji('✖')
.setDisabled(false)
)

const toggleButtonsPro = async (message, content, handle) => {
    if(content === undefined){
        if(handle === 'enable') {
            await message.edit({ components: [proRow3, proRow4]})
        }
        if(handle === 'disable') {
            await message.edit({ components: [proRow, proRow2]})
        }
    }
    else{
        if(handle === 'enable') {
            await message.edit({ content: content, components: [proRow3, proRow4]})
        }
        if(handle === 'disable') {
            await message.edit({ content: content, components: [proRow, proRow2]})
        }
    }
}

module.exports = { toggleButtonsPro }