const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Message, DiscordAPIError } = require('discord.js');
const { getMatchHistoryData } = require('../utils/matchhistorytools');

const findWinnerText = (teams) => {
	var wonTeam = ''

	teams.forEach(team => {
		if(team.win){
			wonTeam = team.teamId === 100 ? 'Blue win' : 'Red win'
		}
	})
	return wonTeam
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('history')
		.setDescription('show ikkiar match history'),

	async execute(interaction) {
		await interaction.reply('🐒🎮')

		matches = await getMatchHistoryData()
		await matches.forEach(async (match, idx) => {
			const temp = JSON.stringify(match)
			const m = JSON.parse(temp)
			//console.log(Object.keys(m))

			const game = m.gameData
			//console.log(game)

			const mid = game.metadata.matchId
			const created = game.gameCreation
			const duration = game.gameDuration
			const teams = game.teams
			const summoners = game.summoners
			//console.log(mid, created, duration, teams, summoners)

			let summonersTexts = ''

			// SUMMONE TEXTS
			summoners.forEach((summoner, idx) => {
				let summonerText = ''
				let summonerName = ''
				
				if(summoner.teamId === 100){
					summonerName = `\`\`\`ini\n[${summoner.summonerName}] `
				}
				if(summoner.teamId === 200){
					summonerName = `\`\`\`scss\n[${summoner.summonerName}] `
				}
				
				let champion = summoner.championName + ''

				// SECOND LINE
				let kda = 'KDA: ' + summoner.kills +'/' + summoner.deaths + '/' + summoner.assists + ' | '
				let dmg = 'Dmg: ' + summoner.totalDamageDealtToChampions + ' | '
				let gold = 'Gold : ' + summoner.goldEarned + ' | '
				let vision = 'Vision: ' + summoner.visionScore

				let sumonerLine1 = summonerName + champion + '\n'
				let summonerLine2 = kda + dmg + gold + vision + "\n```"

				summonerText = sumonerLine1 + summonerLine2
				summonersTexts += summonerText
			})


			const historyEmbed = new MessageEmbed()
			.setColor('#38b259')
			.setTitle(mid)
			.setDescription(findWinnerText(teams))

			historyEmbed.addField('Summoners', summonersTexts, true)
			/*
			historyEmbed.addField(`\`\`\`ini
			'Developer'
\`\`\``,  'Asuka#1290')
*/

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