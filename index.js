require('dotenv').config()
const Discord = require('discord.js')
const bot = new Discord.Client({intents: ['GUILDS', 'GUILD_MESSAGES']})
const fs = require('fs')

bot.on('ready', () => {
    console.log('the bot is running!')
})

bot.on('messageCreate', message => {
    if(message.content === 'hi'){
        message.reply('hi :)')
    }
})

bot.on('typingStart', message => {
    message.reply('dont you try to type anything! 😡')
})

bot.login(process.env.BOT_TOKEN)