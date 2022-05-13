
const assignRoleOnButtonClick = (interaction) => {
    let newQueueUserRole = ''
    if(interaction.customId === 'topbutton'){
        role = 'top'
        newQueueUserRole = 'top'
    }
    if(interaction.customId === 'junglebutton'){
        role = 'jungle'
        newQueueUserRole = 'jungle'
    }
    if(interaction.customId === 'midbutton'){
        role = 'mid'
        newQueueUserRole = 'mid'
    }
    if(interaction.customId === 'adcbutton'){
        role = 'adc'
        newQueueUserRole = 'adc'
    }
    if(interaction.customId === 'supportbutton'){
        role = 'support'
        newQueueUserRole = 'support'
    }
    return newQueueUserRole
}

module.exports = { assignRoleOnButtonClick }