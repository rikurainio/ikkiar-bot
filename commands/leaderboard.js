const { SlashCommandBuilder } = require('@discordjs/builders');
const { updateLeaderBoard } = require('../utils/matchhistorytools');
const { getLeaderboardData } = require('../utils/summonertools');

const getSpaces = (name) => {
	while(name.length < 22){
		name += " "
	}
	return name
}

const getPointSpaces = (points) => {
	while(points.length < 11){
		points += " "
	}
	return points
}

const getGamesSpaces = (games) => {
	while(games.length < 10){
		games += " "
	}
	return games
}

const getWRSpaces = (wr) => {
	wr += '%'
	while(wr.length < 3){
		wr += " "
	}
	return wr
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Show your inhouse leaderboard'),
	async execute(interaction) {

		let nav = "```\n"
		let fot = "\n```"
		let title ='                 👑 LEADERBOARD 👑\n\n'
		let header = '🐵 Apes 🐵           Points     Games     W/R     \n'
		let message = ''
		const data = await getLeaderboardData()
		console.log('data: ', data)

		data.forEach((s, idx) => {
			let totalgames = s.wins + s.losses
			let winratio = s.wins/totalgames
			let wr = winratio * 100

			message 
				+= (idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' 
					: (idx > 9 ? '🐒' :'🏅'))))
				+ getSpaces(s.username) + getPointSpaces(s.points.toString())
				+ getGamesSpaces(totalgames.toString()) + getWRSpaces(wr.toString()) + '\n' 
		})

		await updateLeaderBoard()
		await interaction.reply({ content: nav + title + header + message + fot });
	},
};