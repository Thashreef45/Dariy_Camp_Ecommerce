const mongoose = require('mongoose')
mongoose.set('strictQuery', true);


async function mongoConnect (){
    mongoose.connect(process.env.DB_CONNECT)
}

module.exports = mongoConnect