const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { getMatchHistoryData } = require('../utils/matchhistorytools');
const { getChampionNameById } = require('../utils/champion')

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
		.setName('history2')
		.setDescription('show ikkiar match history'),

	async execute(interaction) {
		await interaction.reply('🐒🎮')

		matches = await getMatchHistoryData()
				let matchCount = 0;
				const handleRunning = async () => {
					await matches.forEach(async (match, idx) => {
                        console.log(match)
						matchCount += 1
						const temp = JSON.stringify(match)
						const m = JSON.parse(temp)
						const game = m.gameData
						const created = game.gameCreation
						const duration = game.gameDuration
						const durationMinutes = (Math.floor(duration / 60)).toString()
						const teams = game.teams
						const summoners = game.summoners

                        let kda = '💀KDA:'
                        let dmg = '⚔️Dmg:'
                        let gold = '💹Gold:'
                        let vision = '🎆Vision:'
                        
                        let blueSummoners = '```ini\n'
                        let redSummoners = '```scss\n'
                        let allBans = '```\n'
                        let blues = '```css\n'
                        let reds = '```css\n'

                        let RS = '```css\n'
                        let BS = '```css\n'
                        RS += '💀KDA:    🧙‍♂️CS:    ⚔️Dmg:  💹Gold:  🎆Vision: \n'
                        BS += '💀KDA:    🧙‍♂️CS:    ⚔️Dmg:  💹Gold:  🎆Vision: \n'

                        teams.forEach((team, idx) => {

                            //let sortedBans = team.bans.sort((a,b) => (a.pickTurn < b.pickTurn) ? 1 : -1)
                            team.bans.forEach((ban, idx) => {

                                const championId = ban.championId
                                const banName = getChampionNameById(championId)
                                console.log(banName)
                                allBans += (idx > 2 ? '  ➖' : '➖') + banName + '\n'
                            })
                            if(idx === 0){
                            }
                        })

						// SUMMONE TEXTS
						summoners.forEach((summoner, idx) => {
							let summonerName = ''
							let champion = summoner.championName + ''

						
                            // PAD TITLES TO HAVE SAME LEN
							let paddedk = fixLength(kda, 8)
							let paddedd = fixLength(dmg, 8)
							let paddedg = fixLength(gold, 8)
							let paddedv = fixLength(vision, 8)

                            // PAD NUMERICS TO HAVE SAME LEN
							let kdavalue = summoner.kills + '/' + summoner.deaths + '/' + summoner.assists
							let dmgvalue = summoner.totalDamageDealtToChampions
							let goldvalue = summoner.goldEarned
							let visionvalue = summoner.visionScore
							let cs = fixLength(summoner.cs, 3) +' cs'
							let paddedkda = fixLength(kdavalue, 8)
							let paddeddmg = fixLength(dmgvalue, 5)
							let paddedgold = fixLength(goldvalue, 6)
							let paddedvision = fixLength(visionvalue, 3)
                            let paddedcs = fixLength(cs, 7)

                            // COMBINE
							let k = paddedkda + " | "
							let d = paddeddmg + ' | '
							let g = paddedgold + " |     "
							let v = paddedvision
                            let c = paddedcs + " | "

                            let statisticsRow = k + c + d + g + v

							if(summoner.teamId === 100){
								summonerName = `👤[${summoner.summonerName}] `
								let paddedName = fixLength(summonerName, 17)
								let summonerLine1 = paddedName + '\n' + champion + '\n'
                                blueSummoners += summonerLine1

                                RS += statisticsRow + '\n'
							}
							if(summoner.teamId === 200){
								summonerName = `👤[${summoner.summonerName}] `
								let paddedName = fixLength(summonerName, 17)
								let summonerLine1 = paddedName + '\n' + champion + '\n'
                                redSummoners += summonerLine1

                                BS += statisticsRow + '\n'
							}
						})

                        // wrapper
                        blueSummoners += '\n```'
                        redSummoners += '\n```'
                        allBans += '\n```'
                        blues += "\n```"
                        reds += "\n```"
                        RS += "\n```"
                        BS += "\n```"

						let dateObj = new Date(created)
						var month = dateObj.getMonth() + 1; //months from 1-12
						var day = dateObj.getDate();
						var year = dateObj.getFullYear();

						newdate = day + '/' + month + '/' + year 

                        const historyEmbed = new MessageEmbed()
                        .setColor('#38b259')
                        //.setTitle(newdate.toString())
                        .setDescription('**' + newdate.toString() + '**' + ' | ' + durationMinutes + ' minutes | ' + findWinnerText(teams))
                        .addField('𝔅𝔩𝔲𝔢 𝔱𝔢𝔞𝔪', blueSummoners, true)
                        .addField('ℜ𝔢𝔡 𝔱𝔢𝔞𝔪', redSummoners, true)
                        .addField('𝔅𝔞𝔫𝔰', allBans, true)

                        .addField('bluestats', BS)
                        .addField('redstats', RS)

                        await interaction.followUp({ embeds: [historyEmbed] }).then(msg =>{
                            setTimeout(async () => {
                                await msg.delete()
                            }, 43190000)
                        })
					})

					setTimeout(async () => {
						await handleRunning()
					}, 43200000)
				}		
				
				await handleRunning()
	},
};