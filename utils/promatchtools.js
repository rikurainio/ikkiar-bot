const ProQueuer = require('../models/proqueuer')
const ProMatch = require('../models/promatch')


const getMatchHistoryLengthPro = async () => {
    const response = await ProMatch.find({})
    return response.length
}

const setEveryDuplicateAcceptedPro = async (id, boolean) => {
    try {
        const foundSmmoners = await ProQueuer.find({ discordId: id})
        foundSmmoners.forEach(async (summoner) => {
            summoner.accepted = true
            await summoner.save()
        })
    }
    catch (error){console.log('[PRO VER] set every dupliate error',err)}
}

const setEveryAcceptedPro = async (boolean) => {
    try {
        await ProQueuer.updateMany({}, { accepted: boolean })
    }
    catch (error) {
        console.log('error setting every single documents accepted values')
    }
}

const setInitBooleanStatePro = async (boolean) => {
    try {
        await ProQueuer.updateMany({}, { accepted: boolean, inLobby: boolean })
    }
    catch (error) {
        console.log('error setting every single documents accepted & inLobby values')
    }
}

const find10AcceptsPro = async () => {
    let acceptCount = 0
    const summoners = await ProQueuer.find({})

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

const setAcceptedPro = async (user, boolean) => {
    try {
        await ProQueuer.updateMany({discordId: user.discordId}, { accepted: boolean })
    }
    catch (error) {
        console.log('could not change boolean of user.', error)
    }
}

const matchFoundPro = async () => {
    const queuers = await ProQueuer.find({})
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

const summonerCanAcceptGamePro = async (checkId) => {
    let can = false;
    const summoners = await selectFastestTenSummonersPro()

    summoners.forEach(summoner => {
        if(summoner['discordId'].toString() === checkId.toString()){ can = true }
    })
    return can
}



const selectFastestTenSummonersPro = async () => {
    const summonersByQueueTime = await getPriorities2Pro()
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
                    const foundSummoner = await ProQueuer.findById(summoner.id)
                    foundSummoner.inLobby = true
                    await foundSummoner.save()
                }
                catch (err) {
                    console.log('[PRO VER] error setting 10 summoners in lobby inLobby value to true in matchtools.js.\n', err)
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

const getLobbySummonerNamesToTagPro = async () => {
    let tagMessageContent = ''
    const fastestSummoners = await selectFastestTenSummonersPro()
    
    fastestSummoners.forEach(summoner => {
        tagMessageContent += '<@'+ summoner.discordId +'> '
    })
    return tagMessageContent
}


const matchMakePro = async () => {
    // GET GUYS IN LOBBY THAT WILL GET MATCHED IF THEY ALL ACCEPT
    const summonerLobby = await selectFastestTenSummonersPro()

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

        if(countAccepteds === 10){t
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
                +   '\n\n👥 RED'
                +  redTeamText

                +   '\n\n____________________________________________________'
                +   '\nCreate a custom game and include \'ikkiar\' in the name ツ.'
                +   '\nSubmit the match with its\' match id by using /submitmatch after the match.'
                +   '\n\n> Match info disappears in 5 minutes to allow Summoners to use the queue'

            wrapAnswer = "```" + "java\n" + title + answer + "\n" + "```"
        }   
        return wrapAnswer
    }
}

const checkQueueSizePro = async () => {
    const queuers = await ProQueuer.find({})
    const queueSize = queuers.length
    return queueSize ? queueSize : 0
}

const queueSummonerPro = async (user) => {
    // IF QUEUE IS FULL
    if(await checkQueueSizePro() === 40){
        console.log('queue is full')
    }
    else{

        // IF DISCORD USER IS ALREADY ACTIVE IN QUEUE
        const foundUser = await ProQueuer.findOne({ discordId: user.discordId})
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
            const newQueuer = new ProQueuer(user)
            await newQueuer.save()
            }
    }
}

const unqueueSummonerPro = async (user) => {
    // AVOID TARGETING SUMMONERS WHO CONFIRMED A MATCH
    if(!user.accepted){
        const foundUser = await ProQueuer.findOne({ discordId: user.discordId })
        if(foundUser){
            await foundUser.remove()
        }
    }
}

const unqueueAFKsDuplicatesPro = async () => {
    const lobby = await selectFastestTenSummonersPro()
    lobby.forEach(async summoner => {
        if(summoner.accepted === false){
            await ProQueuer.deleteMany({ discordId: summoner.discordId })
        }
    })
}

const unqueueAFKsPro = async () => {
    const lobby = await selectFastestTenSummonersPro()
    lobby.forEach(async summoner => {
        if(summoner.accepted === false){
            await unqueueSummonerPro(summoner)
        }
    })
}

const removeMatchedSummonersFromQueuePro = async () => {
    const matchMade = await find10AcceptsPro()
    if(matchMade){
        await ProQueuer.deleteMany({ accepted: true })
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

const getPriorities2Pro = async () => {
    const queuers = await ProQueuer.find({})
    queuers.sort((a,b) => (a.queuedAt > b.queuedAt) ? 1 : ((b.queuedAt > a.queuedAt) ? -1 : 0))
    return queuers
}

const enoughSummonersPro = async () => {
    let top = 0; let jungle = 0; let mid = 0; let adc = 0; let support = 0;

    const queuers = await ProQueuer.find({})
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

const getUpdatedQueueStatusTextPro = async (name, actionMessage) => {
    const queuers = await ProQueuer.find({})
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
            console.log('top', summoner)
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
        await setEveryAcceptedPro(false)

        content = "**Press wanted role icon below to Queue**" + "```" + "ini\n" + "[" + queuers.length + " Summoners in queue]"
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
        content = "**Press wanted role icon below to Queue**" + "```" + "ini\n" + "[" + queuers.length + " Summoners in queue]"
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
        
        + await matchMakePro()
        + "\n"
    
        return content
    }
}

module.exports = {

    getMatchHistoryLengthPro,
    setEveryDuplicateAcceptedPro,
    setEveryAcceptedPro,
    setInitBooleanStatePro,
    find10AcceptsPro,
    setAcceptedPro,
    matchFoundPro,
    summonerCanAcceptGamePro,
    selectFastestTenSummonersPro,
    getLobbySummonerNamesToTagPro,
    matchMakePro,
    checkQueueSizePro,
    queueSummonerPro,
    unqueueSummonerPro,
    unqueueAFKsDuplicatesPro,
    unqueueAFKsPro,
    removeMatchedSummonersFromQueuePro,
    getPriorities2Pro,
    getUpdatedQueueStatusTextPro,

}