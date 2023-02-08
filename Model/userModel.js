const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        default: 0000000000
    },
    status: {
        type: Boolean,
        default: true
    },
    address: [
        {
            address : {
                type: String,
                required: true
            },
            pincode: {
                type: Number,
                required: true
            },
            place: {
                type: String,
                required: true
            },
            state : {
                type: String,
                required: true
            },
            default : {
                type : Boolean,
                default : false
            }
        } 
    ]
})

const User = mongoose.model('User', userSchema)
module.exports = User
