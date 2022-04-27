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

const setEveryAccepted = async (boolean) => {
    try {
        await Queuer.updateMany({}, { accepted: boolean })
    }
    catch (error) {
        console.log('error setting every single documents accepted values')
    }
}

const dismissAcceptedsOutsideLobby = async () => {
    const summoners = await Queuer.find({})

    summoners.forEach(async summoner => {
        if(!summoner.inLobby){
            //console.log('summoner was not in lobby? {', summoner.inLobby,'}, his accepted value was:', summoner.accepted)
            summoner.accepted = false
            await summoner.save()
            //console.log('summoner was not in lobby, his accepted value is now disabled:', summoner.accepted)
        }
    })
}

const setInitBooleanState = async (boolean) => {
    try {
        await Queuer.updateMany({}, { accepted: boolean, inLobby: boolean })
    }
    catch (error) {
        console.log('error setting every single documents accepted & inLobby values')
    }
}

const find10Accepts = async () => {
    let acceptCount = 0
    const summoners = await Queuer.find({})

    summoners.forEach(summoner => {
        if(summoner.accepted === true){
            acceptCount += 1
        }
    })

    if(acceptCount === 10){
        return true
    }
    return false
}

const setAccepted = async (user, boolean) => {
    // FIND THE USER TO UNQUEUE FROM DB
    //console.log('[x] setAccepted with boolean and userid:', user.discordId, 'setAccepted:', boolean)

    try {
        const foundUser = await Queuer.findById(user.id)
        if(foundUser){
            // QUEUE CAN STORE MAX 10 ACCEPTERS AT ONCE
            if(!await find10Accepts()){
                foundUser.accepted = boolean
                await foundUser.save()
            }
        }
    }
    catch (error) {
        console.log('could not change boolean of user.', error)
    }
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

const summonerCanAcceptGame = async (checkId) => {
    let can = false;
    const summoners = await selectFastestTenSummoners()

    summoners.forEach(summoner => {
        if(summoner['discordId'].toString() === checkId.toString()){ can = true }
    })
    //console.log('summoner can value:', can)
    return can
}

const selectFastestTenSummoners = async () => {
    const summonersByQueueTime = await getPriorities2()
    let top = 0; let jungle = 0; let mid = 0; let adc = 0; let support = 0;
    const selected = []

    // SUMMONERS IN ORDER OF QUEUEDAT. ITERATE AND GET THE FASTEST 10. FILL 2 SUMMONERS TO EACH ROLE
    summonersByQueueTime.forEach(async (summoner, idx) => {
        if(selected.length < 10){

            //console.log('index is: ', idx)
            //console.log('summoner: ', summoner)

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

            if(idx < 10){
                // GIVE SELECTED SUMMONERS inLOBBY = TRUE
                const foundSummoner = await Queuer.findById(summoner.id)
                foundSummoner.inLobby = true
                await foundSummoner.save()
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

const getLobbySummonerNamesToTag = async () => {
    let tagMessageContent = ''

    fastestSummoners = await selectFastestTenSummoners()
    fastestSummoners.forEach(summoner => {
        tagMessageContent += '<@'+ summoner.discordId +'> '
    })

    return tagMessageContent
}

const matchMake = async () => {
    // GET GUYS IN LOBBY THAT WILL GET MATCHED IF THEY ALL ACCEPT
    const summonerLobby = await selectFastestTenSummoners()
    //console.log('summonerLobby length is -->', summonerLobby)

    if(summonerLobby.length === 10){
        let answer = ''
        summonerLobby.forEach((summoner, idx) => {
            answer += "\n" + (summoner.accepted ? '✅' : '⬛') + summoner.discordName + ' (' + summoner.role + ')'
        })
    
        let title = "\nQueue pop: summoners have to accept match to generate teams:"
        let wrapAnswer = "\n" + title + answer + "\n"
        
        await dismissAcceptedsOutsideLobby()

        console.log('LobbySize: ', summonerLobby.length)

        // CHECK ACCEPTS ( DEV )
        let countAccepteds = 0

        summonerLobby.forEach((lobbySummoner, idx) => {
            console.log('lobbysum ' + idx + ' accepted: ' , lobbySummoner.accepted)
            if(lobbySummoner.accepted){
                countAccepteds += 1
            }
        })

        if(countAccepteds === 10){
            let tops = summonerLobby.filter(summoner => summoner.role === 'top')
            let jungles = summonerLobby.filter(summoner => summoner.role === 'jungle')
            let mids = summonerLobby.filter(summoner => summoner.role === 'mid')
            let adcs = summonerLobby.filter(summoner => summoner.role === 'adc')
            let supports = summonerLobby.filter(summoner => summoner.role === 'support')

            let summonersByRoles = []
            summonersByRoles.push(tops, jungles, mids, adcs, supports)

            // 0 WILL GO TO BLUE TEAM, 1 TO RED
            let blueTeam = []
            let redTeam = []

            summonersByRoles.forEach(roleArray => {
                let teamIndex = Math.floor(Math.random() * 2)
                //console.log('rolearray:', roleArray)

                if(teamIndex === 0){
                    blueTeam.push(roleArray[0].discordName)
                    redTeam.push(roleArray[1].discordName)
                }
                else{
                    redTeam.push(roleArray[0].discordName)
                    blueTeam.push(roleArray[1].discordName)
                }
            })

            let blueTeamText = 
                   '\ntop:     ' + blueTeam[0] 
                +  '\njungle:  ' + blueTeam[1] 
                +  '\nmid:     ' + blueTeam[2] 
                +  '\nadc:     ' + blueTeam[3] 
                +  '\nsupport: ' + blueTeam[4] 

            let redTeamText = 
                '\ntop:     ' + redTeam[0] 
             +  '\njungle:  ' + redTeam[1] 
             +  '\nmid:     ' + redTeam[2] 
             +  '\nadc:     ' + redTeam[3] 
             +  '\nsupport: ' + redTeam[4] 


            title = '🐵 monke formed superteams!\n'
            answer = 
                    '\n👥 BLUE' 
                + blueTeamText
                + '\n\n👥 RED'
                +  redTeamText

                + '\n\n____________________________________________________'
                + '\nRemember to include \'ikkiar\' in Custom Game name ツ.'
                + '\n\n> Match info disappears in 5 minutes to allow Summoners to queue again'
            wrapAnswer = "java\n" + title + answer + "\n"
        }

        return wrapAnswer
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

            // IF HE WANTED TO CHANGE THE ROLE
           
            // DEV CHANGE OUT TO ROW 294 295
            const temp = Queuer(user)
            await temp.save()

            /*

            const temp = Queuer(user)
            await temp.save()

            /*

             if(user.role !== foundUser.role){
            foundUser.role = user.role
            foundUser.queuedAt = Date.now()
            await foundUser.save()
            }
            /*
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

    // AVOID TARGETING SUMMONERS WHO CONFIRMED A MATCH
    if(!user.accepted){
        const foundUser = await Queuer.findOne({ discordId: user.discordId })
        if(foundUser){
            //console.log('removing from queue: ', foundUser.discordName, 'his accepted status is: ', foundUser.accepted, 'gv: ', user.accepted)
            await foundUser.remove()
        }
    }
}

const unqueueAFKsDuplicates = async () => {
    const lobby = await selectFastestTenSummoners()
    lobby.forEach(async summoner => {
        if(summoner.accepted === false){
            await Queuer.deleteMany({ discordId: summoner.discordId })
        }
    })
}

const unqueueAFKs = async () => {
    const lobby = await selectFastestTenSummoners()
    lobby.forEach(async summoner => {
        if(summoner.accepted === false){
            await unqueueSummoner(summoner)
        }
    })
}

const removeMatchedSummonersFromQueue = async () => {
    const matchMade = await find10Accepts()
    if(matchMade){
        await Queuer.deleteMany({ accepted: true })
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
    //console.log('after sort', queuers)
    const queuersSortedByQueuedAt = queuers.map((queuer, idx) =>  idx + '. ' + queuer.discordName)
    //console.log('after map', queuersSortedByQueuedAt)
    return queuersSortedByQueuedAt
}

// GIVES FULL OBJECTS
const getPriorities2 = async () => {
    const queuers = await Queuer.find({})
    queuers.sort((a,b) => (a.queuedAt > b.queuedAt) ? 1 : ((b.queuedAt > a.queuedAt) ? -1 : 0))
    //console.log('after sort', queuers)
    return queuers
}

// RETURNS TRUE IF THERE ARE AT LEAST 2 OF EVERY ROLE
const enoughSummoners = async () => {
    let top = 0; let jungle = 0; let mid = 0; let adc = 0; let support = 0;

    const queuers = await Queuer.find({})
    queuers.forEach(summoner => {
        if(summoner.role === 'top')      { top += 1}
        if(summoner.role === 'jungle')   { jungle += 1 }
        if(summoner.role === 'mid')      { mid += 1 }
        if(summoner.role === 'adc')      { adc += 1 }
        if(summoner.role === 'support' ) { support += 1 }
    })
    
    //console.log('roles amounts in checker: ', top, jungle, mid, support, adc)
    if(top > 1 && jungle > 1 && mid > 1 && adc > 1 && support > 1){
        //console.log('ENOUGH? LOL')
        return true;
    }
    //console.log('NOT ENOUGH OMEGALUL')
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
        await setEveryAccepted(false)

        content = "```" + "ini\n" + "Press wanted role icon below to Queue" + "\n[" + queuers.length + " Summoners in queue]\n"
        + "\nQueue Status: " + readyMessage 
        + "\n🦏 top: " + top 
        + "\n🦥 jungle: " + jungle 
        + "\n🧙 mid: " + mid 
        + "\n🏹 ad: " + adc 
        + "\n🐈 sup: " + support
        + "\n"
        + "\n_________________________________________"
        + "\n> [" + name + "] " + actionMessage + '  (' + getTimeStamp() + ')' + "\n```"

        return content
    }
    else{
        content = "```" + "ini\n" + "Press wanted role icon below to Queue" + "\n[" + queuers.length + " Summoners in queue]\n"
        + "\nQueue Status: " + readyMessage 
        + "\n🦏 top: " + top 
        + "\n🦥 jungle: " + jungle 
        + "\n🧙 mid: " + mid 
        + "\n🏹 ad: " + adc 
        + "\n🐈 sup: " + support
        + "\n"
        + "\n_________________________________________"
        + "\n> [" + name + "] " + actionMessage + '  (' + getTimeStamp() + ')' + "\n```"
    
        + "```"
        + await matchMake()
        + "\n"
        + "```"
    
        return content
    }
}

module.exports = { saveMatch, getMatches, getMatchHistoryLength, matchFound,
                     getUpdatedQueueStatusText, queueSummoner, unqueueSummoner
                    ,getPriorities, enoughSummoners, matchMake, summonerCanAcceptGame,
                    setAccepted, setEveryAccepted, unqueueAFKs, unqueueAFKsDuplicates,
                    find10Accepts, removeMatchedSummonersFromQueue, setInitBooleanState,
                    getLobbySummonerNamesToTag
                    }