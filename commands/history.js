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

const fixLength = (word, n) => {
	while(word.toString().length < n){
		word += " "
	}
	return word
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

			let blueTexts = ''
			let redTexts = ''

			
			// SUMMONE TEXTS
			summoners.forEach((summoner, idx) => {

				let summonerText = ''
				let summonerName = ''
				
			
				
				let champion = summoner.championName + ''

				// SECOND LINE
				let kda = '💀KDA:'
				let dmg = '⚔️Dmg:'
				let gold = '💹Gold:'
				let vision = '🎆Vision:'

				let paddedk = fixLength(kda, 10)
				let paddedd = fixLength(dmg, 10)
				let paddedg = fixLength(gold, 10)
				let paddedv = fixLength(vision, 10)

				let kdavalue = summoner.kills + ' / ' + summoner.deaths + ' / ' + summoner.assists
				let dmgvalue = summoner.totalDamageDealtToChampions
				let goldvalue = summoner.goldEarned
				let visionvalue = summoner.visionScore

				let paddedkda = fixLength(kdavalue, 15)
				let paddeddmg = fixLength(dmgvalue, 15)
				let paddedgold = fixLength(goldvalue, 15)
				let paddedvision = fixLength(visionvalue, 15)

				let k = paddedk + paddedkda + ""
				let d = paddedd + paddeddmg
				let g = paddedg + paddedgold + ""
				let v = paddedv + paddedvision

				let summonerLine2 = "```css\n" + k + "\n" + d + "\n" + g + "\n" + v + "\n```"

				if(summoner.teamId === 100){
					summonerName = `\`\`\`ini\n👤[${summoner.summonerName}] `
					let paddedName = fixLength(summonerName, 30)
					let summonerLine1 = paddedName + "\n" + champion + '\n```'
					blueTexts += summonerLine1 + summonerLine2
				}
				if(summoner.teamId === 200){
					summonerName = `\`\`\`scss\n👤[${summoner.summonerName}] `
					let paddedName = fixLength(summonerName, 30)
					let summonerLine1 = paddedName + "\n" + champion + '\n```'
					redTexts += summonerLine1 + summonerLine2
				}


				//summonerText = summonerLine1 + summonerLine2
				//summonersTexts += summonerText

			})

			let dateObj = new Date(created)
			var month = dateObj.getMonth() + 1; //months from 1-12
			var day = dateObj.getDate();
			var year = dateObj.getFullYear();

			newdate =     day + '/' 
						+ month + '/' 
						+ year 


			const historyEmbed = new MessageEmbed()
			.setColor('#38b259')
			.setTitle(newdate.toString())
			.setDescription(findWinnerText(teams) + '\n match id: [' + mid + ']')
			.addFields(
				{ name: 'Red Team', value: blueTexts, inline: true },	
				{ name: 'Blue Team', value: redTexts, inline: true },
				
			)

			//historyEmbed.addField('Summoners', summonersTexts, true)
				
			//historyEmbed.addField(blueTexts, redTexts, true)

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

					let summonerLine1 = summonerName + champion + '\n'
					let summonerLine2 = kda + dmg + gold + vision

					summonerText = summonerLine1 + summonerLine2 + `\n`
					summonersTexts += summonerText
				})

				let matchText = gameHeader + summonersTexts
				historyEmbed.addField('asd', matchText)
				
			})
			*/