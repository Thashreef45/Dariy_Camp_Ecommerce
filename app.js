require('./config/dbconnect')()
const express = require('express')
const hbs = require('express-handlebars')
const session = require('express-session')
const handlebars = require('handlebars')
require('dotenv').config()
const logger = require('morgan')
const nocache = require('nocache')
const cors = require('cors')
const app = express()
const adminRoute = require('./routes/adminRoute')  
const userRoute = require('./routes/userRoute')


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
app.use('/admin',adminRoute) 

//For user routes
app.use('/', userRoute)


//Layout 
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
    layoutsDir: __dirname + '/Views/layout/',
    // partialsDir: __dirname + '/views/partials'
}));


handlebars.registerHelper('ifeq', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
});

handlebars.registerHelper('ifnoteq', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
});

app.listen(process.env.PORT || 3000)





