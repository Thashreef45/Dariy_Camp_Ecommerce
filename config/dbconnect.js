const mongoose = require('mongoose')
mongoose.set('strictQuery', true);
module.exports = function mongoConnect (){
    mongoose.connect('mongodb://127.0.0.1:27017/Week7')
}
