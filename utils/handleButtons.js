
const assignRoleOnButtonClick = (interaction) => {
    let newQueueUserRole = ''
    if(interaction.customId === 'topbutton' || interaction.customId === 'protopbutton'){
        role = 'top'
        newQueueUserRole = 'top'
    }
    if(interaction.customId === 'junglebutton' || interaction.customId === 'projunglebutton'){
        role = 'jungle'
        newQueueUserRole = 'jungle'
    }
    if(interaction.customId === 'midbutton' || interaction.customId === 'promidbutton'){
        role = 'mid'
        newQueueUserRole = 'mid'
    }
    if(interaction.customId === 'adcbutton' || interaction.customId === 'proadcbutton'){
        role = 'adc'
        newQueueUserRole = 'adc'
    }
    if(interaction.customId === 'supportbutton' || interaction.customId === 'prosupportbutton'){
        role = 'support'
        newQueueUserRole = 'support'
    }
    return newQueueUserRole
}

module.exports = { assignRoleOnButtonClick }