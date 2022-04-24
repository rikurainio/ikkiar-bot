const axios = require('axios')

// MONGO
//const User = require('../models/user')
const Match = require('../models/match')
const Queuer = require('../models/queuer')

const saveMatch = async (matchId) => {


    // AXIOS GET SETUPS
    const searchParam = 'EUW1_' + matchId
    let config = {
        headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
        }
    }
    const response = await
         axios.get('https://europe.api.riotgames.com/lol/match/v5/matches/' + searchParam, config)


    // REQUIREMENTS AFTER MATCH HAS BEEN FOUND BY ID ===>

    // HAS TO BE OVER 15 MINUTES
    if(response.data.info.gameDuration < 900){
        return '🙊 Ikkiar will not save games under 15 minutes!'
    }
    // NEEDS TO BE A CUSTOM GAME
    if(response.data.info.gameType !== 'CUSTOM_GAME'){
        return '🙊 Ikkiar will only save Custom Games!'
    }
    // MAP NEEDS TO BE SR
    if(response.data.info.mapId !== 11){
        return '🙊 Ikkiar will only save Summoners Rift games!'
    }
    // NEEDS TO BE 5v5
    if(response.data.metadata.participants.length !== 10){
        return '🙊 Ikkiar will only save games that had 10 players!'
    }
    // MATCH HAS TO HAVE 'ikkiar' in its name
    if( ((response.data.info.gameName).toLowerCase()).includes('ikkiar')){
        const newMatch = new Match({ gameData: response.data})
        const savedMatch = await newMatch.save()
        return '🐵 Ikkiar remembers this match now :).'
    }
    else{
        return '🙈 Ikkiar could not save the match. \n \n> The Custom Game must include ikkiar in its name'
    }
}

const getMatches = () => {
    return ""
}

const getMatchHistoryLength = async () => {
    const response = await Match.find({})
    return response.length
}

const matchFound = async () => {
    const queuers = await Queuer.find({})
		let top = 0; let jungle = 0; let mid = 0; let adc = 0; let support = 0;

		queuers.forEach(summoner => {
            if(summoner.role === 'top'){
                top += 1
            }
            if(summoner.role === 'jungle'){
                jungle += 1
            }
            if(summoner.role === 'mid'){
                mid += 1
            }
            if(summoner.role === 'adc'){
                adc += 1
            }
            if(summoner.role === 'support'){
                support += 1
            }
		})

        if(top === 2 && jungle === 2 && mid === 2 && adc === 2 && support === 2){
            return true
        }
        return false
}

// RETURNS QUEUE SIZE
const checkQueueSize = async () => {
    const queuers = await Queuer.find({})
    const queueSize = queuers.length
    return queueSize ? queueSize : 0
}

const queueSummoner = async (user) => {
    // IF QUEUE IS FULL
    if(await checkQueueSize() === 10){
        console.log('queue is full')
    }
    else{

        // IF DISCORD USER IS ALREADY ACTIVE IN QUEUE
        const foundUser = await Queuer.findOne({ discordId: user.discordId})
        if(foundUser){
            
            // IF HE WANTED TO CHANGE THE ROLE
            if(user.role !== foundUser.role){
                foundUser.role = user.role
                await foundUser.save()
            }
        }
        
        else {
            // IF DISCORD USER IS NOT IN ACTIVE QUEUE ALREADY
            const newQueuer = new Queuer(user)
            await newQueuer.save()
        }
    }
}

const getUpdatedQueueStatusText = async () => {
    const queuers = await Queuer.find({})
    let top = 0; let jungle = 0; let mid = 0; let adc = 0; let support = 0;

    queuers.forEach(summoner => {
        if(summoner.role === 'top')      { top += 1}
        if(summoner.role === 'jungle')   { jungle += 1 }
        if(summoner.role === 'mid')      { mid += 1 }
        if(summoner.role === 'adc')      { adc += 1 }
        if(summoner.role === 'support' ) { support += 1 }
    })

    const content = "```" + "ini\n" + "[" + queuers.length + " Summoners in queue]\n" 
    + "\n🦏 top: " + top 
    + "\n🦥 jungle: " + jungle 
    + "\n🧙 mid: " + mid 
    + "\n🏹 ad: " + adc 
    + "\n🐈 sup: " + support + "```"

    return content
}

module.exports = { saveMatch, getMatches, getMatchHistoryLength, matchFound, getUpdatedQueueStatusText, queueSummoner }