const axios = require('axios')

// MONGO
//const User = require('../models/user')
const Match = require('../models/match')

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
        return '🙈 Ikkiar could not save the match. \nDid you remember to include word ikkiar \nin your Custom Game name?'
    }
}

const getMatches = () => {
    return ""
}

const getMatchHistoryLength = async () => {
    const response = await Match.find({})
    return response.length
}

module.exports = { saveMatch, getMatches, getMatchHistoryLength }