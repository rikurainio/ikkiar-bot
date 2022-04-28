const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Message, DiscordAPIError } = require('discord.js');
const { getMatchHistoryData } = require('../utils/matchhistorytools');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('history')
		.setDescription('show ikkiar match history'),

	async execute(interaction) {
		await interaction.reply('🐒🎮')

		matches = await getMatchHistoryData()
		await matches.forEach(async (match, idx) => {
			const { metadata, gameCreation, gameDuration, teams, summoners } = match
			console.log(metadata)

			const historyEmbed = new MessageEmbed()
			.setColor('#38b259')
			.setTitle('EUW1_12314536')
			.setDescription('blue/red win')
			.addField(
				'gameId', 'matchid'
			)

			await interaction.followUp({ embeds: [historyEmbed] })
		})
	},
};





/*
			matches = await getMatchHistoryData()
			//console.log('matches in history: ', matches)
			console.log(historyEmbed)


			matches.forEach((match, idx) => {
				let gameHeader = ''
				let summonersTexts = ''

				let { metadata, gameDuration, teams, summoners, gameCreation: timeStamp } = match
				
				console.log(metadata, gameDuration, teams, summoners, timeStamp)

				let gameLength = (gameDuration / 60).toString()
				let gameId = metadata.matchId.toString()
				let date = timeStamp.toString()

				gameHeader += gameId + '> ' + date

				summoners.forEach((summoner, idx) => {
					let summonerText = ''
					let summonerName = ''
					
					if(summoner.teamId === 100){
						summonerName = '```ini\n' + '[' + summoner.summonerName + '] '
					}
					if(summoner.teamId === 200){
						summonerName = '```scss\n' + '[' + summoner.summonerName + '] '
					}
					
					let champion = summoner.champion + ' | '

					// SECOND LINE
					let kda = 'KDA: ' + summoner.kills +'/' + summoner.deaths + '/' + summoner.assists + ' | '
					let dmg = 'Dmg: ' + summoner.totalDamageDealtToChampions + ' | '
					let gold = 'Gold : ' + summoner.goldEarned + ' | '
					let vision = 'Vision: ' + summoner.visionScore

					let sumonerLine1 = summonerName + champion + '\n'
					let summonerLine2 = kda + dmg + gold + vision

					summonerText = sumonerLine1 + summonerLine2 + `\n`
					summonersTexts += summonerText
				})

				let matchText = gameHeader + summonersTexts
				historyEmbed.addField('asd', matchText)
				
			})
			*/