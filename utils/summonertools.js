const Summoner = require("../models/summoner")

// TAKES IN MONGO MATCH AND UPDATES SCORES ETC
const handleSummonerUpdatesAfterMatch = async (mongoMatch) => {
    console.log('got mongomatch: ', mongoMatch)
    const { metadata, teams, summoners } = mongoMatch
    const { participants: puuids } = metadata

    summoners.forEach(async (summoner, idx) => {
        // tie context

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

        }

        // punish loss
        if(!summoner.win){

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

const calculateTeamSkillDifference = async (blueTeam, redTeam) => {

}

const getSummoners = async () => {
    const summoners = await Summoner.find({})
    return summoners
}

const resetSummoners = async () => {
    const deletedSummoners = await Summoner.deleteMany({})
}

const createSummoner = async (summoner) => {
    const newSummoner = new Summoner(summoner)
    await newSummoner.save()
}

const deleteSummoner = async (puuid) => {
    await Summoner.findOneAndRemove({puuid: puuid})
}

const updateSummoner = async (update) => {
    await Summoner.findOneAndUpdate({puuid: puuid}, {update})
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

module.exports = { 
    getSummoners, resetSummoners, createSummoner, deleteSummoner, updateSummoner,
    findSummonerByPuuId, findSummonerByName, findSummonerByDiscordId,
    handleSummonerUpdatesAfterMatch,
}