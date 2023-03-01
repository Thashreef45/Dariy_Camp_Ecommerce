const { ObjectID } = require('bson')
const mongoose = require('mongoose')

const couponSchema = mongoose.Schema({
    couponcode : {
        type : String,
        required : true
    },
    expiry : {
        type : Date,
        required : true
    },
    offer : {
        type : Number,
        required : true
    },
    isvalid : {
        type : Boolean,
        default : true
    },
    users : [
        {
            userid :  ObjectID
        }
    ]
})

module.exports = mongoose.model('coupon',couponSchema)