// MONGO
//const User = require('../models/user')
const Queuer = require('../models/queuer')

const selectTeam = async () => {

    const queuers = await Queuer.find({})
    let participants = [{}]
    
}


module.exports = {}