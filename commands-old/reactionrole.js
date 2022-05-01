const { SlashCommandBuilder } = require('@discordjs/builders');
const { ReactionRole } = require("discordjs-reaction-role");
// DISCORD.JS CLASSES
const { Client, Collection, Intents} = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('reactionrole')
		.setDescription('set role react to msg')
        .addStringOption(option => option
            .setName('messageid')
            .setDescription('message where the reactions will be added')
            .setRequired(true))
        .addStringOption(option => option
            .setName('roleid')
            .setDescription('role to be given on that reaction press')
            .setRequired(true)),

	async execute(interaction) {
    const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGE_REACTIONS |
        Intents.FLAGS.GUILD_MESSAGES |
        Intents.FLAGS.GUILDS,] });

        const messageId = interaction.options._hoistedOptions[0]['value']
        //const reaction = interaction.options._hoistedOptions[1]['value']
        const roleId = interaction.options._hoistedOptions[1]['value']

        const rr = new ReactionRole(client, [
            { messageId: messageId, reaction: '🐵', roleId: roleId }, // Basic usage
          ])

        console.log(rr)

		await interaction.reply(`reaction set?`);
	},
};