const { SlashCommandBuilder } = require('@discordjs/builders');

// MONGO
//const User = require('../models/user')
const Queuer = require('../models/queuer')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queueclear')
		.setDescription('developer tool - empty the queue'),
		
	async execute(interaction) {
		const deleteResult = await Queuer.deleteMany({})
		await interaction.reply('🧹 Queue reset');
	},
};