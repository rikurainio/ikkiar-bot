import axios from "axios"

const getSummonerIconId = async (summonerName) => {

    const config = {
        headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY
        }
    }

    const response= await axios.get('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summonerName, config)
    const summoner = response.data
    return summoner.profileIconId

}

const getLeagueIcon = () => {
    // ICON ID FROM 1-27
    const imageId = Math.floor(Math.random() * 27) + 1
    const imageSource = 'https://ddragon.leagueoflegends.com/cdn/12.9.1/img/profileicon/'+ imageId +'.png'

    const leagueIcon = {
        id: imageId,
        src: imageSource
    }

    return leagueIcon
}

module.exports = { getSummonerIconId, getLeagueIcon }