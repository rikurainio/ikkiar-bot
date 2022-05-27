const Summoner = require("../models/summoner")

const eloUpdate = (redTeamElo, blueTeamElo, redTeamWin, kfactor) => {
    const qred = Math.pow(10, redTeamElo/400)
    const qblue = Math.pow(10, blueTeamElo/400)
    const expectedScoreRed = qred / (qred + qblue)
    const expectedScoreBlue = qblue / (qred + qblue)
    const redEloChange = kfactor * (Number(redTeamWin) - expectedScoreRed)
    const blueEloChange = kfactor * (Number(!redTeamWin) - expectedScoreBlue)
    return {red:redEloChange, blue:blueEloChange}
}

const scorePlayers = async (match) => {
    console.log(Object.keys(match))
    const { statsJson: summoners } = match

    

    const summonerPromises = summoners.map(async summoner => {

        const foundSummoner = await findSummonerByRID2(summoner.ID)
        console.log('foundsummoner: ', foundSummoner)

        if(foundSummoner === null){
            const newSummoner = {
                username: summoner.NAME,
                points: 1000,
                wins: 0,
                losses: 0,
                RID: summoner.ID
            }
            await createSummoner(newSummoner)
            return { points: newSummoner.points, team: summoner.TEAM }
        }
        else {
            const foundSummonerScore = foundSummoner.points
            console.log('score:', typeof parseFloat(foundSummonerScore.toString()))
            return { points: parseFloat(foundSummonerScore.toString()), team: summoner.TEAM }
        }
    })

    const readySummoners = await Promise.all(summonerPromises)
    let blueTeamElos = readySummoners.filter((s) => s.team === '100').map((s) => s.points)
    let redTeamElos = readySummoners.filter((s) => s.team === '200').map((s) => s.points)

    console.log('elos pre', blueTeamElos, redTeamElos)

    const redTeamWin = getRedTeam(summoners)[0].WIN === 'Win'
    const avgEloBlue = blueTeamElos.reduce((a,b) => a + b, 0) / 5
    const avgEloRed = redTeamElos.reduce((a,b) => a + b, 0) / 5
    const eloChange = eloUpdate(avgEloRed, avgEloBlue, redTeamWin, 40)

    console.log('red team win:', redTeamWin)
    console.log('elo avgs:', avgEloBlue, '\n', avgEloRed)

    summoners.forEach(async summoner => {

        const RID = summoner.ID

        console.log('elo changes:', eloChange)
        const summonerEloUpdate = summoner.TEAM === '100' ? eloChange.blue : eloChange.red
        console.log('elo update:', summonerEloUpdate)

        if(summoner.WIN === 'Win'){
            await updateSummonerStats(summoner.NAME, summonerEloUpdate, true)
        }
        if(summoner.WIN === 'Fail'){
            await updateSummonerStats(summoner.NAME, summonerEloUpdate, false)
        }
    })
}

//RID = id of a summoner in the replay file 
const findSummonerByRID = async (RID) => {
    const foundSummoner = await Summoner.findOne({ RID: RID})
    if(foundSummoner){
        return true
    }
    return false
}

const findSummonerByRID2 = async (RID) => {
    const foundSummoner = await Summoner.findOne({ RID: RID})
    if(foundSummoner){
        return foundSummoner
    }
    return null
}

const getBlueTeam = (summoners) => {
    const blueTeam = summoners.filter(summoner => summoner.TEAM === '100')
    return blueTeam
}

const getRedTeam = (summoners) => {
    const redTeam = summoners.filter(summoner => summoner.TEAM === '200')
    return redTeam
}


// returns which team was better
const calculateTeamSkillDifference = async (blueTeam, redTeam) => {
    let bluePoints = 0
    let redPoints = 0

    blueTeam.forEach(async blueSummoner => {
        let bluePoint = await getPointsByPuuId(blueSummoner.puuid)
        console.log('bluepoint: ', bluePoint)
        bluePoints += bluePoint
    })
    redTeam.forEach(async redSummoner => {
        let redPoint = await getPointsByPuuId(redSummoner.puuid)
        console.log('redpoint:', redPoint)
        redPoints += redPoint
    })

    // blue was "better team" points wise
    if(bluePoints > redPoints){
        return 100
    }
    // red was "better"
    else{
        return 200
    }
}

const getSummoners = async () => {
    const summoners = await Summoner.find({})
    return summoners
}

const updateSummonerStats = async (username, pointsAmount, win) => {
    if(win){
        await Summoner.findOneAndUpdate({ username: username}, {$inc : { points: pointsAmount, wins: 1 }})
    }
    else{
        await Summoner.findOneAndUpdate({ username: username}, {$inc : { points: pointsAmount, losses: 1 }})
    }
}

const getPointsByPuuId = async (puuid) => {
    const summoner = await Summoner.findOne({ puuid: puuid })
    if(!summoner){
        return 1000
    }
    return summoner.points
}

const resetSummoners = async () => {
    await Summoner.deleteMany({})
}

const createSummoner = async (summoner) => {
    const newSummoner = new Summoner(summoner)
    await newSummoner.save()
}

const deleteSummoner = async (puuid) => {
    await Summoner.findOneAndRemove({puuid: puuid})
}

const clearSummoners = async () => {
    await Summoner.deleteMany({})
}

const updateSummoner = async (puuid, update) => {
    await Summoner.findOneAndUpdate({puuid: puuid}, update)
}

const findSummonerByPuuId = async (puuid) => {
    const foundSummoner = await Summoner.findOne({ puuid: puuid })
    return foundSummoner
}

const findSummonerByName = async (name) => {
    const foundSummoner = await Summoner.findOne({ username: name })
    return foundSummoner
}

const findSummonerByDiscordId = async (discordId) => {
    const foundSummoner = await Summoner.findOne({ discordId: discordId })
    return foundSummoner
}

const getLeaderboardData = async () => {
    const summoners = await Summoner.find({})
    const formattedSummoners = summoners.map(({ username, points, wins, losses }) => ({ username, points, wins, losses }))
    formattedSummoners.sort((a, b) => (a.points < b.points) ? 1 : -1)
    if(formattedSummoners.length > 30){
        return formattedSummoners.slice(0, 30)
    }
    return formattedSummoners
}

module.exports = { 
    getSummoners, resetSummoners, createSummoner, deleteSummoner, updateSummoner,
    findSummonerByPuuId, findSummonerByName, findSummonerByDiscordId,
    clearSummoners, getLeaderboardData,
    scorePlayers
}