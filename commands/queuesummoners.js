const { SlashCommandBuilder } = require('@discordjs/builders');

// MONGO
//const User = require('../models/user')
const Queuer = require('../models/queuer')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queuesummoners')
		.setDescription('Check who is in queue'),



	async execute(interaction) {
        const queuers = await Queuer.find({})
        console.log(queuers)
		await interaction.reply(queuers.length + ' people in queue');
	},
};