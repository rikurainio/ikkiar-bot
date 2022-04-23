const axios = require('axios')

// MONGO
//const User = require('../models/user')
const Match = require('../models/match')

const saveMatch = async (matchId) => {
    const searchParam = 'EUW1_' + matchId

    let config = {
        headers: {
                'X-Riot-Token': process.env.RIOT_API_KEY
        }
    }
    const response = await axios.get('https://europe.api.riotgames.com/lol/match/v5/matches/' + searchParam, config)
    console.log('data: ', response.data)


    const newMatch = new Match({ any: response.data})
    const savedMatch = await newMatch.save()
}

const getMatches = () => {
    return ""
}

module.exports = { saveMatch, getMatches}