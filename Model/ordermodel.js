const { ObjectID } = require('bson')
const mongoose = require('mongoose')
const { product } = require('../Controllers/adminController')

const orderSchema = mongoose.Schema({
    userId: {
        type: ObjectID,
        required: true
    },
    product: [
        {
            id: { type: ObjectID },
            name: { type: String },
            price: { type: Number },
            quantity: { type: Number }
        }
    ],
    orderId: {
        type: String,
        required: true
    },
    date: [
        {
            orderdate: {
                type: Date,
            },
            schedule: {
                type: Date,
            },
        }
    ],
    total: {
        type: Number,
        required: true
    },
    paymentmethod: {
        type: String,
        required: true
    },
    address: { type: Array },
    status: {   // order placed, scheduled , delevered, cancelled
        type: String,
        required: true,
        default: 'Order placed'
    },
    deliverymethod: {
        type: String,
        required: true
    },
    couponused: {
        type: Boolean,
        default: false
    },
    coupon: [{
        name: {
            type: String
        },
        offer: {
            type: Number
        }
    }]
})


module.exports = mongoose.model('order', orderSchema)