const Match = require('../models/match')


// RETURNS ALL IKKIAR MATCHES PLAYED
const getMatches = async () => {
    const matches = await Match.find({})
    if(matches){
        return matches
    }
    else{
        return []
    }
}

const matchAlreadySaved = async (matchId) => {
    const matchFound = await Match.find({ gameData: { metadata: { matchId: matchId }} })
    console.log('matchound: ', matchFound)
    if(matchFound && matchFound === []){
        return true
    }
    return false
}

// RETURNS TRUE IF GIVEN OBJECT IS RIOT GAMES STYLE MATCH OBJECT
const isValidMatchObject = (variable) => {
    if(typeof(variable) === 'object'){
        if('any' in variable){
            if('metadata' && 'info' in variable.any){
                return true
            }
        }
        return false
    }
    return false
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////
 
// 

// RETURN MONGODB MATCH OBJECT (CUT OUT UNNECESSARY STUFF)
// TAKES RIOT GAMES SINGLE MATCH OBJECT AS PARAM
const convertRiotMatchToMongoMatch = (match) => {
    let mongoMatch = {}


    //console.log('got match to parse: ', match)
    const metadata = match.metadata
    const info = match.info

    // participants = Array of 10 summoners and their data
        // gameDuration
        // gameCreation = Epoch timestamp I think
        // teams = Array holding two objects of teams:: bans and objectives, sides and which side won
        const { participants, gameDuration, gameCreation, teams,} = info

        let summoners = []
        participants.forEach((p, idx) => {
            let usefulSummoner = {}
            usefulSummoner.puuid = metadata.participants[idx]

            usefulSummoner.summonerName = p.summonerName
            usefulSummoner.championName = p.championName
            usefulSummoner.championLevel = p.champLevel

            usefulSummoner.role = p.teamPosition === "UTILITY" ? "SUPPORT" : p.teamPosition

            usefulSummoner.kills = p.kills
            usefulSummoner.deaths = p.deaths
            usefulSummoner.assists  = p.assists
            usefulSummoner.kda = p.challenges['kda']
            usefulSummoner.kpa = p.challenges['killParticipation']

            usefulSummoner.firstBaron = p.challenges["earliestBaron"] === undefined ? 0 : p.challenges["earliestBaron"]
            usefulSummoner.goldEarned = p.goldEarned
            usefulSummoner.totalDamageDealtToChampions = p.totalDamageDealtToChampions
            usefulSummoner.visionScore = p.visionScore

            usefulSummoner.teamId = p.teamId
            usefulSummoner.win = p.win

            summoners.push(usefulSummoner)
        })

        mongoMatch.metadata = metadata
        mongoMatch.gameCreation = gameCreation        
        mongoMatch.gameDuration = gameDuration
        mongoMatch.teams = teams
        mongoMatch.summoners = summoners

        return mongoMatch
}

/*
const updateMatchHistory = async (mongoMatch) => {

}
*/

// Returns last 20 matches at max
const getMatchHistoryData = async () => {
    const matches = await Match.find({})
    //console.log('mh data: ', matches)
    matches.sort((a,b,) => (a.gameData.gameCreation < b.gameData.gameCreation) ? 1 : -1)

    if(matches.length > 20){
        const lastTwenty = matches.splice(0, 20)
        return lastTwenty
    }
    return matches
}


const updateLeaderBoard = async () => {
    //console.log('update leaderboard called.')
}

module.exports = { getMatches, updateLeaderBoard, convertRiotMatchToMongoMatch,
                    matchAlreadySaved, getMatchHistoryData

}