const createPostGameMessage = (json) => {

    let players = json.map(m => {
        const player = {};
        player.name = json.NAME;
        player.role = json.INDIVIDUAL_POSITION
        player.team = json.TEAM
        player.champion = json.SKIN;
        player.kills = json.CHAMPIONS_KILLED;
        player.assists = json.ASSISTS;
        player.deaths = json.NUM_DEATHS;
        return players
    })
    players.sort(function (a, b) {
        return a.name.localeCompare(b.name);
    });

    let top = players.filter(function (e) {
        return role === "TOP";
    })
    let jungle = players.filter(function (e) {
        return role === "JUNGLE";
    })
    let mid = players.filter(function (e) {
        return role === "MID";
    })
    let bot = players.filter(function (e) {
        return role === "BOTTOM";
    })
    let sup = players.filter(function (e) {
        return role === "UTILITY";
    })


    const message = "" + top[0].name + "  " + top[0].champion + "  " + top[0].kills + "/" + top[0].assists + "/" + top[0].deaths + "  "
        + top[0].role + "  " + top[1].kills + "/" + top[1].assists + "/" + top[1].deaths + "  " + + top[1].champion + "  " + top[1].name + "\n"
        + jungle[0].name + "  " + jungle[0].champion + "  " + jungle[0].kills + "/" + jungle[0].assists + "/" + jungle[0].deaths + "  "
        + jungle[0].role + "  " + jungle[1].kills + "/" + jungle[1].assists + "/" + jungle[1].deaths + "  " + + jungle[1].champion + "  " + jungle[1].name + "\n"
        + mid[0].name + "  " + mid[0].champion + "  " + mid[0].kills + "/" + mid[0].assists + "/" + mid[0].deaths + "  "
        + mid[0].role + "  " + mid[1].kills + "/" + mid[1].assists + "/" + mid[1].deaths + "  " + + mid[1].champion + "  " + mid[1].name + "\n"
        + bot[0].name + "  " + bot[0].champion + "  " + bot[0].kills + "/" + bot[0].assists + "/" + bot[0].deaths + "  "
        + bot[0].role + "  " + bot[1].kills + "/" + bot[1].assists + "/" + bot[1].deaths + "  " + + bot[1].champion + "  " + bot[1].name + "\n"
        + sup[0].name + "  " + sup[0].champion + "  " + sup[0].kills + "/" + sup[0].assists + "/" + sup[0].deaths + "  "
        + sup[0].role + "  " + sup[1].kills + "/" + sup[1].assists + "/" + sup[1].deaths + "  " + + sup[1].champion + "  " + sup[1].name + "\n"

    return message;
}

module.exports = { createPostGameMessage };