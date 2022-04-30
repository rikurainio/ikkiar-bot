const Summoner = require("../models/summoner")


// TAKES IN MONGO MATCH AND UPDATES SCORES ETC
const handleSummonerUpdatesAfterMatch = async (mongoMatch) => {

    console.log('MATCH', mongoMatch)
    const participants = mongoMatch.info.participants
    const { metadata } = mongoMatch
    const { participants: puuids } = metadata

    // COMPARE TEAMS THAT PLAYED
    const blueTeam = getBlueTeam(participants)
    const redTeam = getRedTeam(participants)
    const betterTeam = calculateTeamSkillDifference(blueTeam, redTeam)

    participants.forEach(async (summoner, idx) => {
        // we need to create a new summoner document if its his/her first game in ikkiar
        // puuids and summoners are in same order so their indexes SHOULD match
        const found = await findSummonerByPuuId(puuids[idx])
        if(!found){

            const newSummoner = {
                username: summoner.summonerName,
                points: 1000,
                wins: 0,
                losses: 0,
                elo: 0,
                puuid: puuids[idx]
            }
            await createSummoner(newSummoner)
        }

        // reward wins
        if(summoner.win){
            if(summoner.teamId == betterTeam){
                updateSummonerStats(summoner.puuid, 20, true)
            }
            else{
                updateSummonerStats(summoner.puuid, 21, true)
            }
        }

        // punish loss
        if(!summoner.win){
            if(summoner.teamId == betterTeam){
                updateSummonerStats(summoner.puuid, 21, false)
            }
            else{
                updateSummonerStats(summoner.puuid, 20, false)
            }
        }
    })
}

const getBlueTeam = (summoners) => {
    const blueTeam = summoners.filter(summoner => summoner.teamId == 100)
    return blueTeam
}

const getRedTeam = (summoners) => {
    const redTeam = summoners.filter(summoner => summoner.teamId == 200)
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

const updateSummonerStats = async (puuid, pointsAmount, win) => {
    if(win){
        await Summoner.findOneAndUpdate({puuid: puuid}, {$inc : { points: pointsAmount, wins: 1 }})
    }
    else{
        await Summoner.findOneAndUpdate({puuid: puuid}, {$inc : { points: -pointsAmount, losses: 1 }})
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

// get first 20 summoners by score
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
    handleSummonerUpdatesAfterMatch, clearSummoners, getLeaderboardData
}