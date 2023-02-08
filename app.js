const db = require('./config/dbconnect')
const express = require('express')
const hbs = require('express-handlebars')
const session = require('express-session')
const app = express()

const logger = require('morgan')
// const bodyParser = require('body-parser')

const nocache = require('nocache')
const cors = require('cors')
require('dotenv').config()
db();

app.use(cors())
app.use(nocache())
app.use(express.static(__dirname ))
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret: 'sessionkey',
    secret: process.env.SESSION_KEY,
    saveUninitialized: true,
    cookie: { maxAge: 600000 },
    resave: false
}))



// For admin
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)

//For user routes
const userRoute = require('./routes/userRoute')
app.use('/', userRoute)


// //Testin for ..fetch
// const User = require('./Model/userModel')
// const arryf = []

// app.post('/hey',async(req,res)=>{
// let {id,name} = req.body
// console.log(req.body,'<--body');
// arryf.unshift(name)
// console.log(arryf,'array updated');
// var da = await User.findOne({name:name},{email:1,_id:0})
// console.log(da,'----');
// })
// /////

//Layout 
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    layoutsDir: __dirname + '/views/layout/',
    // partialsDir: __dirname + '/views/partials'
}));

app.listen(3000, () => console.log('Server Started'))




