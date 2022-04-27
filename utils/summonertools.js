const Summoner = require("../models/summoner")

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
    await findOneAndRemove({puuid: puuid})
}

const updateSummoner = async (update) => {
    await findOneAndUpdate({puuid: puuid}, {update})
}

const findSummonerByPuuId = async (puuid) => {
    const foundSummoner = await findOne({ puuid: puuid })
    return foundSummoner
}

const findSummonerByName = async (name) => {
    const foundSummoner = await findOne({ username: name })
    return foundSummoner
}

const findSummonerByDiscordId = async (discordId) => {
    const foundSummoner = await findOne({ discordId: discordId })
    return foundSummoner
}

module.exports = { 
    getSummoners, resetSummoners, createSummoner, deleteSummoner, updateSummoner,
    findSummonerByPuuId, findSummonerByName, findSummonerByDiscordId
}