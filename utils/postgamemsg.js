const createPostGameMessage = (json) => {

    let players = json.map(json => {
        const player = {};
        player.name = json.NAME;
        player.role = json.INDIVIDUAL_POSITION;
        player.team = json.TEAM;
        player.champion = json.SKIN;
        player.kills = json.CHAMPIONS_KILLED;
        player.assists = json.ASSISTS;
        player.deaths = json.NUM_DEATHS;
        return player
    })
    players.sort((a, b) => (a.team < b.team) ? 1 : 0);
    let message = '';

    players.forEach(player => {
        message += '\n' + player.role + ' ' + player.name + ' ' + player.champion + ' ' + player.kills + '/' + player.deaths + '/' + player.assists
    })
    return message;
}

module.exports = { createPostGameMessage };