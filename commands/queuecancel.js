const { SlashCommandBuilder } = require('@discordjs/builders');

// MONGO
//const User = require('../models/user')
const Queuer = require('../models/queuer')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queuecancel')
		.setDescription('Cancels users LoL queue'),

	async execute(interaction) {
		const name = interaction.user.username
		const id = interaction.user.id

		const deletedQueuer = await Queuer.deleteOne({ discordId: id })

		if(deletedQueuer.deletedCount === 1){
			await interaction.reply('Queue cancelled for ' + name);
		}
		else{
			await interaction.reply('You are not in a queue')
		}
	},
};