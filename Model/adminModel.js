const mongoose = require('mongoose')


const adminschema = mongoose.Schema({
    email:{
        type:String,
        required : true
    },
    password:{
        type:String,
        required : true
    }
})

const Admin = mongoose.model('admin',adminschema)
module.exports = Admin