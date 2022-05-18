const Match = require('../models/match')
const Queuer = require('../models/queuer')

const saveReplayFileMatch = async (match) => {
    const newMatch = new Match({gameData: match})
    await newMatch.save()
}

const checkIfReplayAlreadySaved = async (matchId) => {
    const foundMatch = await Match.findOne({ 'gameData.matchId': matchId })
    console.log(await foundMatch)
    if(await foundMatch){
        console.log('already saved')
        return true
    }
    console.log('not a duplicate')
    return false
}

const getMatches = () => {
    return ""
}

const getMatchHistoryLength = async () => {
    const response = await Match.find({})
    return response.length
}

const setSingleAccepted = async (id, boolean) => {
    try {
        await Queuer.findOneAndUpdate({ discordId: id}, { accepted: boolean })
    }
    catch (err) {
        console.log('findOneAndUpdate error in setting accepteds: ', err)
    }
}

const setEveryDuplicateAccepted = async (id, boolean) => {
    try {
        const foundSmmoners = await Queuer.find({ discordId: id})
        foundSmmoners.forEach(async (summoner) => {
            summoner.accepted = true
            await summoner.save()
        })
    }
    catch (error){console.log('set every dupliate error',err)}
}

const setEveryAccepted = async (boolean) => {
    try {
        await Queuer.updateMany({}, { accepted: boolean })
    }
    catch (error) {
        console.log('error setting every single documents accepted values')
    }
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
    try {
        await Queuer.updateMany({discordId: user.discordId}, { accepted: boolean })
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
    return can
}

const selectFastestTenSummoners = async () => {
    const summonersByQueueTime = await getPriorities2()
    let top = 0; let jungle = 0; let mid = 0; let adc = 0; let support = 0;
    const selected = []

    // SUMMONERS IN ORDER OF QUEUEDAT. ITERATE AND GET THE FASTEST 10. FILL 2 SUMMONERS TO EACH ROLE
    summonersByQueueTime.forEach(async (summoner, idx) => {
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

            if(idx < 10){
                // GIVE SELECTED SUMMONERS inLobby = TRUE
                try {
                    const foundSummoner = await Queuer.findById(summoner.id)
                    foundSummoner.inLobby = true
                    await foundSummoner.save()
                }
                catch (err) {
                    console.log('error setting 10 summoners in lobby inLobby value to true in matchtools.js.\n', err)
                }
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
    const fastestSummoners = await selectFastestTenSummoners()
    
    fastestSummoners.forEach(summoner => {
        tagMessageContent += '<@'+ summoner.discordId +'> '
    })
    return tagMessageContent
}


// RETURNS A MESSAGE STATUS BASED ON LOBBY/MATCMHAKING STATUS
const matchMake = async () => {
    // GET GUYS IN LOBBY THAT WILL GET MATCHED IF THEY ALL ACCEPT
    const summonerLobby = await selectFastestTenSummoners()

    if(summonerLobby.length === 10){
        let answer = ''
        summonerLobby.forEach((summoner, idx) => {
            answer += "\n" + (summoner.accepted ? '✅' : '⬛') + summoner.discordName + ' (' + summoner.role + ')'
        })
    
        let title = "\nThese summoners have to Accept | Decline:"
        let wrapAnswer = "**Queue pop!**" + "```java" + "\n" + title + answer + "\n" + "```"
        let countAccepteds = 0

        summonerLobby.forEach((lobbySummoner, idx) => {
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

            const bteams = balanceTeams(summonerByRoles)
            const blueTeam = bteams[0]
            const redTeam = bteams[1]

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
                +   '\n\n👥 RED'
                +  redTeamText

                +   '\n\n____________________________________________________'
                +   '\nCreate a custom game and include \'ikkiar\' in the name'
                +   '\nSave the played match by dropping the replay .rofl file to #submitmatch channel'
                +   '\n\n> Match info disappears in 5 minutes to allow Summoners to use the queue'

            wrapAnswer = "```" + "\n" + title + answer + "\n" + "```"
        }   
        return wrapAnswer
    }
}


const teamELO = (team) => {
    return team.reduce((a, b) => ({points:a.points+b.points}), ({points:0})).points
}

//takes list of summoners by roles and returns balanced teams
const balanceTeams = (summonersByRoles) => {
    const blueTeamTemp = []
    const redTeamTemp = []
    const recurseRoles = (blueTT, redTT, i) => {

        const blueTTT1 = [...blueTT, summonersByRoles[i][0]]
        const redTTT1 = [...redTT, summonersByRoles[i][1]]
        const blueTTT2 = [...blueTT, summonersByRoles[i][1]]
        const redTTT2 = [...redTT, summonersByRoles[i][0]]
        if (i==4) {
            const g1diff = Math.abs(teamELO(blueTTT1) - teamELO(redTTT1))
            const g2diff = Math.abs(teamELO(blueTTT2) - teamELO(redTTT2))
            if (g1diff < g2diff) {
                return [blueTTT1, redTTT1, g1diff]
            }
            else {
                return [blueTTT2, redTTT2, g2diff]
            }
        }
        else {
            const r1 = recurseRoles(blueTTT1, redTTT1, i+1)
            const r2 = recurseRoles(blueTTT2, redTTT2, i+1)
            if (r1[2] < r2[2]) {
                return r1
            }
            else {
                return r2
            }
        }
    }
    const solveTeams = recurseRoles(blueTeamTemp, redTeamTemp, 0)
    return solveTeams.slice(0, 2)
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

            //const newQueuer = new Queuer(user)
            //await newQueuer.save()
            // IF HE WANTED TO CHANGE THE ROLE
            if(user.role !== foundUser.role){
                foundUser.role = user.role
                foundUser.queuedAt = Date.now()
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

const unqueueSummoner = async (user) => {
    // AVOID TARGETING SUMMONERS WHO CONFIRMED A MATCH
    if(!user.accepted){
        await Queuer.findOneAndRemove({ discordId: user.discordId })
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
    const deleteCount = await Queuer.deleteMany({ accepted: true })
    console.log('unqueued', deleteCount, 'summoners that accepted the game.')
}

const clearQueue = async () => {
    await Queuer.deleteMany({})
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
    const queuersSortedByQueuedAt = queuers.map((queuer, idx) =>  idx + '. ' + queuer.discordName)
    return queuersSortedByQueuedAt
}

// GIVES FULL OBJECTS
const getPriorities2 = async () => {
    const queuers = await Queuer.find({})
    queuers.sort((a,b) => (a.queuedAt > b.queuedAt) ? 1 : ((b.queuedAt > a.queuedAt) ? -1 : 0))
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

    let topPlayers = ''
    let junglePlayers = ''
    let midPlayers = ''
    let adcPlayers = ''
    let supportPlayers = ''

    queuers.forEach(summoner => {
        if(summoner.role === 'top'){
            top += 1
            topPlayers += summoner.discordName + ' '
        }
        if(summoner.role === 'jungle'){
            jungle += 1
            junglePlayers += summoner.discordName + ' '
        }
        if(summoner.role === 'mid'){
            mid += 1
            midPlayers += summoner.discordName + ' '
        }
        if(summoner.role === 'adc'){
            adc += 1
            adcPlayers += summoner.discordName + ' '
        }
        if(summoner.role === 'support' ){
            support += 1
            supportPlayers += summoner.discordName + ' '
        }
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

        content = "**Press role icon below to queue**" + "```" + "ini\n" + "[" + queuers.length + " Summoners in queue]"
        + "\nstatus: " + readyMessage + '\n'
        + "\n🏝️ top:    " + top + " " + topPlayers
        + "\n🐕‍🦺 jungle: " + jungle + " " + junglePlayers
        + "\n🧙 mid:    " + mid + " " + midPlayers
        + "\n🏹 adc:    " + adc + " " + adcPlayers
        + "\n⚕️ sup:    " + support + " " + supportPlayers
        + "\n"
        + "\n_________________________________________"
        + "\n> [" + name + "] " + actionMessage + '  (' + getTimeStamp() + ')' + "\n```"

        return content
    }
    else{
        content = "**Press role icon below to queue**" + "```" + "ini\n" + "[" + queuers.length + " Summoners in queue]"
        + "\nstatus: " + readyMessage + '\n'
        + "\n🏝️ top:    " + top + " " + topPlayers
        + "\n🐕‍🦺 jungle: " + jungle + " " + junglePlayers
        + "\n🧙 mid:    " + mid + " " + midPlayers
        + "\n🏹 adc:    " + adc + " " + adcPlayers
        + "\n⚕️ sup:    " + support + " " + supportPlayers
        + "\n"
        + "\n_________________________________________"
        + "\n> [" + name + "] " + actionMessage + '  (' + getTimeStamp() + ')' + "\n```"
        
        + '\n\n'
        
        + await matchMake()
        + "\n"
    
        return content
    }
}

module.exports = { 
    getMatches, getMatchHistoryLength, matchFound,
    getUpdatedQueueStatusText, queueSummoner, unqueueSummoner,
    getPriorities, enoughSummoners, matchMake, summonerCanAcceptGame,
    setAccepted, setEveryAccepted, unqueueAFKs, unqueueAFKsDuplicates,
    find10Accepts, removeMatchedSummonersFromQueue, setInitBooleanState,
    getLobbySummonerNamesToTag, setEveryDuplicateAccepted, saveReplayFileMatch,
    checkIfReplayAlreadySaved, setSingleAccepted, clearQueue
}