const User = require('../Model/userModel')
const categoryModel = require('../Model/categoryModel')
const productModel = require('../Model/productModel')
const bcrypt = require('../helpers/bcrypt')
const otpGenerator = require('../helpers/otp')
const mailer = require('../helpers/nodemailer')
const { product } = require('./adminController')
const { updateOne } = require('../Model/userModel')


let userId // used to store signup user email
let tempUser // used to store user data from signup , (line num 68 ,Maybe changed)
let errMsg
let otpVal
let scsMsg
let productArray
let encPassword
let categoryArray
let Searchdata
let searched = false
let categoryId
let loginData // userd to store user data when success login done 
// let productName // Use to store product details when clicking product on product page
let filtered = false // when Category(in product page) clicked then it will become true
let isLogin = false //setting 'true' while success login linenum:116


async function setProductArray() {
    productArray = await productModel.find({ status: true })
}

async function categoryarray() {
    return categoryArray = await categoryModel.find()
}


const loadSignup = async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        }
        else {
            res.render('signup', { errMsg })
            errMsg = ''
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadHome = async (req, res) => {
    try {
        res.render('home', { isLogin })

    } catch (error) {
        console.log(error.message)
    }
}

const insertUser = async (req, res) => {
    // encPassword = await securePassword(req.body.password)
    encPassword = await bcrypt.securePassword(req.body.password)
    otpVal = otpGenerator()
    // sending mail function calling here
    mailer(req.body.name, req.body.email, req.body._id, otpVal)

    userId = req.body.email
    const emailCheck = await User.findOne({ email: req.body.email })
    try {
        if (emailCheck) {
            //Email already exist
            errMsg = 'User already exist'
            res.redirect('/signup')
        }
        else {
            tempUser = req.body
            if (tempUser) {
                res.redirect('/signupOtp')
            }
            else {
                // 
            }
        }
    } catch (error) {
        console.log(error)
    }
}

// signupverify through otp
const singupOtp = async (req, res) => {
    res.render('signupotp', { errMsg })
    errMsg = ''
}
const signupverify = async (req, res) => {
    try {
        if (req.body.signupotp == otpVal) {
            console.log('!!Congratualations ..otp shariyaayi')
            const user = new User({
                name: tempUser.name,
                email: tempUser.email,
                password: encPassword,
            })
            const userData = await user.save()


            scsMsg = 'Account Created . Please Login'
            res.redirect('/login')
        }
        else {
            errMsg = 'Entered OTP is wrong'
            res.redirect('/signupOtp')
            tempUser = ''
        }

    } catch (error) {
        console.log(error)
    }
}

const loadLogin = async (req, res) => {
    if (req.session.user) {
        res.redirect('/')
    }
    else {
        try {
            res.render('login', { errMsg, scsMsg })
            errMsg = ''
            scsMsg = ''

        } catch (error) {
            console.log(error.message)
        }
    }
}


// Login data checking with database data
const loginCheck = async (req, res) => {
    loginData = await User.findOne({ email: req.body.email })
    try {
        if (!loginData) {
            res.redirect('/login')
            errMsg = 'Wrong Password or Email'
            //Email not found
        }
        else if (req.body.email == loginData.email) {
            if (await bcrypt.checkPassword(req.body.password, loginData.password)) {
                if (loginData.status) {
                    req.session.user = true
                    console.log(loginData, '155');
                    res.redirect('/')
                    isLogin = true
                }
                else {
                    errMsg = 'You are Temporarly blocked by admin'
                    res.redirect('/login')
                }
            }
            else {
                //Password wrong 
                res.redirect('/login')
                errMsg = 'Wrong Password or Email'
            }
        }
    } catch (error) {
        console.log(error);
    }
}

//Product page
const loadproducts = async (req, res) => {
    try {
        if (filtered) {
            categoryArray = await categoryarray()
            productArray = await productModel.find({ category: categoryId })
            console.log(productArray, '--169---', categoryId);
            res.render('products', { isLogin, productArray, categoryArray })
            filtered = false
            setProductArray()
        }
        else if (searched) {
            categoryArray = await categoryarray()
            res.render('products', { isLogin, productArray, categoryArray })
            searched = false
        }
        else {
            setProductArray()
            categoryArray = await categoryarray()
            res.render('products', { isLogin, productArray, categoryArray })
        }
    } catch (error) {
        console.log(error)
    }
}

const productSearch = async (req, res) => {
    try {
        productArray = await productModel.find({ name: { $regex: req.body.search } })
        searched = true
        res.redirect('/products')
    } catch (error) {
        console.log(error);
    }
}

const category = async (req, res) => {
    filtered = true
    categoryId = req.query.id
    res.redirect('/products')
}

const productPage = async (req, res) => {
    let productName = await productModel.findOne({ _id: req.query.id })
    res.render('productpage', { productName, isLogin })
}


const aboutPage = (req, res) => {
    try {
        res.render('about', { isLogin })
    } catch (error) {
        console.log(error);
    }
}

// shows user profile
const userprofile = async (req, res) => {
    try {
        //finding and Sending default address to hbs
        let defaultAddress 
        for(let i = 0 ; i<loginData.address.length; i++){
            if(loginData.address[i].default){
                defaultAddress = loginData.address[i]
            }
        }
        res.render('user', {defaultAddress, loginData, isLogin })

    } catch (error) {
        console.log(error);
    }

}
const edituser = async (req, res) => {
    try {
        res.render('edituser', { loginData, isLogin })

    } catch (error) {
        console.log(error);
    }
}

///update-user-profile
const updateuserprofile = async (req, res) => {
    try {
        loginData = await User.findOneAndUpdate({ _id: loginData._id },
            { $set: { name: req.body.name, email: req.body.email, phone: Number(req.body.phone)}},{ new: true }) //address:req.body.addresss
        res.redirect('/userprofile')
    } catch (error) {
        console.log(error);
    }
}

const addressManagement = async(req,res)=>{
    try {
        let address = loginData.address
        res.render('manageaddress',{address,isLogin})
    } catch (error) {
        console.log(error)
    }
}

const addAddress = async(req,res)=>{
    try {
        res.render('newaddress',{isLogin})
    } catch (error) {
        console.log(error);  
    }
}

const newAddressUpdate = async (req,res)=>{
    try {
        console.log(req.body,'274',loginData._id);
        const data = await User.updateOne({_id:loginData._id},{$addToSet:{address:[{address:req.body.address,pincode:req.body.postalcode,place:req.body.city,state:req.body.state}]}},{new : true})
        loginData = await User.findOne({_id:loginData._id})

        //setting 'default = true' if there is no another address
        if(loginData.address.length<2){
            data = await User.updateOne({_id:loginData._id},{address:[{address:req.body.address,pincode:req.body.postalcode,place:req.body.city,state:req.body.state,default : true}]},{new : true})
            loginData = await User.findOne({_id:loginData._id})
        }
        res.redirect('/userprofile')
    } catch (error) {
        console.log(error);
    }
}

const userlogout = async (req, res) => {
    req.session.destroy()
    isLogin = false
    res.redirect('/')
}

const forgetpw = async (req, res) => {
    res.render('forgetpw1', { errMsg })
    errMsg = ''
}

const forgetpwOtp = async (req, res) => {
    try {
        userId = req.body.email
        let data = await User.findOne({ email: userId })
        otpVal = otpGenerator()
        if (data) {
            res.render('forgetpw2', { errMsg }) //rendering otp page
            mailer(data.name, data.email, data._id, otpVal)
        }
        else {
            errMsg = "Account didn't exist"
            res.redirect('/forget-password')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const otpError = async (req, res) => {
    try {
        res.render('forgetpw2', { errMsg })
        errMsg = ''
    } catch (error) {
        console.log(error.message);
    }
}

const resetpw = async (req, res) => {

    if (otpVal == req.body.otp) {
        res.render('forgetpw3', { errMsg })
        errMsg = ''
    }
    else {
        errMsg = 'Incorrect OTP'
        res.redirect('/forget-password2')
    }
}
// checking and resetting the password here
const resetpwcheck = async (req, res) => {

    if (req.body.password1 == '' || req.body.password2 == '') {
        errMsg = 'Type a valid password'
        res.redirect('/reset-password2')
    }
    else if (req.body.password1 == req.body.password2) {
        let hashpw = await bcrypt.securePassword(req.body.password1)
        let data = await User.updateOne({ email: userId }, { $set: { password: hashpw } })
        scsMsg = 'Password Changed Succesfully.Please login'
        res.redirect('/login')
    }
    else {
        errMsg = 'Passwords are different'
        res.redirect('/reset-password2')
    }
}
const resetpwcheckfail = async (req, res) => {
    res.render('forgetpw3', { errMsg })
    errMsg = ''
}
// const cart = async (req,res)=>{
//     res.render('cart')
// }

//404
const errorPage = async (req, res) => {
    console.log(isLogin);
    res.render('error', { isLogin })
}
module.exports = {
    loadSignup,
    loadHome,
    insertUser,
    loadLogin,
    loadproducts,
    aboutPage,
    signupverify,
    loginCheck,
    userlogout,
    errorPage,
    singupOtp,
    forgetpw,
    forgetpwOtp,
    otpError,
    resetpw,
    resetpwcheck,
    resetpwcheckfail,
    category,
    productSearch,
    productPage,
    userprofile,
    updateuserprofile,
    edituser,
    addressManagement,
    addAddress,
    newAddressUpdate
    // cart
}


