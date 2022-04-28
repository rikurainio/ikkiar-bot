const { getPriorities } = require('../utils/matchtools')
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queuedats')
		.setDescription('check who has priority in the queue'),
	async execute(interaction) {
        const queuersPriorities = await getPriorities()
        let answer = ''

        queuersPriorities.forEach(line => {
            answer += line.toString() + '\n'
        })

		await interaction.reply("Queued the longest (0. sat in queue the most): \n" + answer);
	},
};