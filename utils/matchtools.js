const { TimestampStyles } = require('@discordjs/builders')
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

const selectFastestTenSummoners = async () => {
    const summonersByQueueTime = await getPriorities2()
    let top = 0; let jungle = 0; let mid = 0; let adc = 0; let support = 0;
    const selected = []

    summonersByQueueTime.forEach((summoner, idx) => {
        if(selected.length < 10){
            if(summoner.role === 'top'){
                if(top < 2){
                    selected.push(summoner)
                }
                top += 1
            }
            if(summoner.role === 'jungle'){
                if(jungle < 2){
                    selected.push(summoner)
                }
                jungle += 1
            }
            if(summoner.role === 'mid'){
                if(mid < 2){
                    selected.push(summoner)
                }
                mid += 1
            }
            if(summoner.role === 'adc'){
                if(adc < 2){
                    selected.push(summoner)
                }
                adc += 1
            }
            if(summoner.role === 'support' ){
                if(support < 2){
                    selected.push(summoner)
                }
                support += 1
            }
        }
        
    })
    if(selected.length === 10){
        return selected
    }
    else {
        return []
    }
}

const matchMake = async () => {
    const summonerLobby = await selectFastestTenSummoners()

    if(summonerLobby.length == 10){
        let answer = ''
        console.log('matchMake lobby:', summonerLobby)
    
        let teams = []
        let blueTeam = []
        let redTeam = []
    
        teams.push(blueTeam, redTeam)
    
        summonerLobby.forEach((summoner, idx) => {
            answer += "\n" + summoner.discordName + ' (' + summoner.role + ')'
        })
    
        let title = "\nCURRENT LOBBY:\n"
        let wrapAnswer = "\n" + title + answer + "\n"
        return wrapAnswer
    }
    else {
        return 'LOBBY HAS NOT BEEN FORMED YET'
    }
}

// RETURNS QUEUE SIZE
const checkQueueSize = async () => {
    const queuers = await Queuer.find({})
    const queueSize = queuers.length
    return queueSize ? queueSize : 0
}

const queueSummoner = async (user) => {
    // IF QUEUE IS FULL
    if(await checkQueueSize() === 40){
        console.log('queue is full')
    }
    else{

        // IF DISCORD USER IS ALREADY ACTIVE IN QUEUE
        const foundUser = await Queuer.findOne({ discordId: user.discordId})
        if(foundUser){

            const temp = Queuer(user)
            await temp.save()

            /*
            // IF HE WANTED TO CHANGE THE ROLE
            if(user.role !== foundUser.role){
                foundUser.role = user.role
                foundUser.queuedAt = Date.now()
                await foundUser.save()
            }
            */
        }
        else {
            // IF DISCORD USER IS NOT IN ACTIVE QUEUE ALREADY
            const newQueuer = new Queuer(user)
            await newQueuer.save()
        }
    }
}

const unqueueSummoner = async (user) => {
    // FIND THE USER TO UNQUEUE FROM DB
    const foundUser = await Queuer.findOne({ discordId: user.discordId })
    if(foundUser){
        await foundUser.remove()
    }
}

const getTimeStamp = () => {
    const time = new Date()
    let month = time.getMonth() + 1
    let day = time.getDate()
    let hour = time.getHours()
    let minute = time.getMinutes()
    let second = time.getSeconds()
    
    day = day.toString().length < 2 ? "0" + day.toString() : day.toString()
    month = month.toString().length < 2 ? "0" + month.toString() : month.toString()
    hour = hour.toString().length < 2 ? "0" + hour.toString() : hour.toString()
    minute = minute.toString().length < 2 ? "0" + minute.toString() : minute.toString()
    second = second.toString().length < 2 ? "0" + second.toString() : second.toString()

    const timeStamp = month + '/' + day + ' ' + hour + ':' + minute + ':' + second
    const returnText = timeStamp.toString()
    return returnText
}

// GIVES QUICK REPRESENTABLE FORM
const getPriorities = async () => {
    const queuers = await Queuer.find({})
    queuers.sort((a,b) => (a.queuedAt > b.queuedAt) ? 1 : ((b.queuedAt > a.queuedAt) ? -1 : 0))
    console.log('after sort', queuers)
    const queuersSortedByQueuedAt = queuers.map((queuer, idx) =>  idx + '. ' + queuer.discordName)
    console.log('after map', queuersSortedByQueuedAt)
    return queuersSortedByQueuedAt
}

// GIVES FULL OBJECTS
const getPriorities2 = async () => {
    const queuers = await Queuer.find({})
    queuers.sort((a,b) => (a.queuedAt > b.queuedAt) ? 1 : ((b.queuedAt > a.queuedAt) ? -1 : 0))
    console.log('after sort', queuers)
    return queuers
}

// RETURNS TRUE IF THERE ARE AT LEAST 2 OF EVERY ROLE
const enoughSummoners = async () => {
    const querers = await Queuer.find({})
    queuers.forEach(summoner => {
        if(summoner.role === 'top')      { top += 1}
        if(summoner.role === 'jungle')   { jungle += 1 }
        if(summoner.role === 'mid')      { mid += 1 }
        if(summoner.role === 'adc')      { adc += 1 }
        if(summoner.role === 'support' ) { support += 1 }
    })
    if(top > 1 && jungle > 1 && mid > 1 && adc > 1 && support > 1){
        return true;
    }
    return false;
}


const getUpdatedQueueStatusText = async (name, actionMessage) => {
    const queuers = await Queuer.find({})
    let matchReady = false
    let content = ''
    let top = 0; let jungle = 0; let mid = 0; let adc = 0; let support = 0;
    let readyMessage = 'Waiting for more Summoners to queue'

    queuers.forEach(summoner => {
        if(summoner.role === 'top')      { top += 1}
        if(summoner.role === 'jungle')   { jungle += 1 }
        if(summoner.role === 'mid')      { mid += 1 }
        if(summoner.role === 'adc')      { adc += 1 }
        if(summoner.role === 'support' ) { support += 1 }
    })

    if(top > 1 && jungle > 1 && mid > 1 && adc > 1 && support > 1){
        readyMessage = 'Ready to play!'
        matchReady = true
    }
    if(top < 2 && jungle > 1 && mid > 1 && adc > 1 && support > 1){
        if(top === 1){ readyMessage= 'need 1 more top' }
        else { readyMessage= 'need 2 top laners' }
    }
    if(top > 1 && jungle < 2 && mid > 1 && adc > 1 && support > 1){
        if(jungle === 1){ readyMessage='need 1 more jungler' }
        else { readyMessage= 'need 2 junglers' }
    }
    if(top > 1 && jungle > 1 && mid < 2 && adc > 1 && support > 1){
        if(mid === 1){ readyMessage= 'need 1 more mid' }
        else { readyMessage= 'need 2 mid laners' }
    }
    if(top > 1 && jungle > 1 && mid > 1 && adc < 2 && support > 1){
        if(adc === 1){ readyMessage= 'need 1 more adc' }
        else { readyMessage= 'need 2 adcs' }
    }
    if(top > 1 && jungle > 1 && mid > 1 && adc > 1 && support < 2){
        if(support === 1){ readyMessage= 'need 1 more support' }
        else { readyMessage= 'need 2 supports' }
    }


    if(!matchReady){
        content = "```" + "ini\n" + "Press wanted role icon below to Queue" + "\n[" + queuers.length + " Summoners in queue]\n"
        + "\nQueue Status: " + readyMessage 
        + "\n🦏 top: " + top 
        + "\n🦥 jungle: " + jungle 
        + "\n🧙 mid: " + mid 
        + "\n🏹 ad: " + adc 
        + "\n🐈 sup: " + support
        + "\n"
        + "\n______________________________________"
        + "\n> [" + name + "] " + actionMessage + '  (' + getTimeStamp() + ')' + "\n```"

        return content
    }
    content = "```" + "ini\n" + "Press wanted role icon below to Queue" + "\n[" + queuers.length + " Summoners in queue]\n"
    + "\nQueue Status: " + readyMessage 
    + "\n🦏 top: " + top 
    + "\n🦥 jungle: " + jungle 
    + "\n🧙 mid: " + mid 
    + "\n🏹 ad: " + adc 
    + "\n🐈 sup: " + support
    + "\n"
    + "\n______________________________________"
    + "\n> [" + name + "] " + actionMessage + '  (' + getTimeStamp() + ')' + "\n```"

    + "```"
    + "MATCH FOUND"
    + "\n Blue Team"
    + await matchMake()
    + "```"

    return content
}

module.exports = { saveMatch, getMatches, getMatchHistoryLength, matchFound,
                     getUpdatedQueueStatusText, queueSummoner, unqueueSummoner
                    ,getPriorities, enoughSummoners, matchMake
                    }