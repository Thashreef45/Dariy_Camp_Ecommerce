const User = require('../Model/userModel')
const categoryModel = require('../Model/categoryModel')
const productModel = require('../Model/productModel')
const orderModel = require('../Model/ordermodel')
const idGenerator = require('../helpers/oderid')
const bcrypt = require('../helpers/bcrypt')
const otpGenerator = require('../helpers/otp')
const mailer = require('../helpers/nodemailer')
const couponModel = require('../Model/couponmodel')
const time = require('moment')
const { product } = require('./adminController')
const { updateOne, findOne, count } = require('../Model/userModel')
const session = require('express-session')
const { request } = require('../routes/userRoute')
const Razorpay = require('razorpay')
const { log } = require('console')
const console = require('console')
let instance = new Razorpay({ key_id: "rzp_test_iokOwNXFWNwA5p", key_secret: "ZT1y2f2HnwGWoM9ESkUn4Ugu" })


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
// let couponUsed = false 

let loginData // userd to store user data when success login done 
// let productName // Use to store product details when clicking product on product page
let filtered = false // when Category(in product page) clicked then it will become true
let isLogin = false //setting 'true' while success login linenum:116


async function setProductArray() {
    productArray = await productModel.find({ status: true }).lean()
}

async function categoryarray() {
    return categoryArray = await categoryModel.find().lean()
}


const loadSignup = async (req, res) => {
    try {

        res.render('signup', { errMsg })
        errMsg = ''

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
    try {
        res.render('signupotp', { errMsg })
        errMsg = ''
    } catch (error) {
        console.log(error)
    }
}
const signupverify = async (req, res) => {
    try {
        if (req.body.signupotp == otpVal) {
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


    try {
        res.render('login', { errMsg, scsMsg })
        errMsg = ''
        scsMsg = ''

    } catch (error) {
        console.log(error.message)
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
        let inCart
        // function to check whether the item is already in the cart or not,if its exists then 'inCart' will be true
        let isInCart = () => {
            if (req.session.user) {
                for (let i = 0; i < loginData.cart.length; i++) {
                    for (let index = 0; index < productArray.length; index++) {
                        if (String(productArray[index]._id) == String(loginData.cart[i]._id)) {
                            tAmount = productArray[index].rate * loginData.cart[i].count
                            console.log(tAmount, 'of -', productArray[index].name);
                            productArray[index].inCart = true
                        }
                        else {

                        }
                    }
                }
            }
        }

        if (filtered) {
            categoryArray = await categoryarray()
            productArray = await productModel.find({ category: categoryId }).lean()
            isInCart()
            res.render('products', { isLogin, productArray, categoryArray, inCart })
            filtered = false
            setProductArray()
        }
        else if (searched) {
            categoryArray = await categoryarray()
            isInCart()
            res.render('products', { isLogin, productArray, categoryArray, inCart })
            searched = false
        }
        else {
            setProductArray()
            categoryArray = await categoryarray()
            isInCart()
            console.log(productArray, '<<updated incart,ivideyum 213');
            res.render('products', { isLogin, productArray, categoryArray, inCart })
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
    try {
        filtered = true
        categoryId = req.query.id
        res.redirect('/products')

    } catch (error) {
        console.log(error)
    }
}

const productPage = async (req, res) => {
    try {
        let productName = await productModel.findOne({ _id: req.query.id })
        for (let index = 0; index < loginData?.cart.length; index++) {
            if (productName._id == String(loginData.cart[index]._id)) {
                productName.inCart = true
            }
        }
        res.render('productpage', { productName, isLogin })
    } catch (error) {
        console.log(error)
    }
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
        for (let i = 0; i < loginData.address.length; i++) {
            if (loginData.address[i].default) {
                defaultAddress = loginData.address[i]
            }
        }
        res.render('user', { defaultAddress, loginData, isLogin })

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
            { $set: { name: req.body.name, email: req.body.email, phone: Number(req.body.phone) } }, { new: true }) //address:req.body.addresss
        res.redirect('/profile')
    } catch (error) {
        console.log(error);
    }
}

const addressManagement = async (req, res) => {
    try {
        loginData = await User.findOne({ _id: loginData._id })
        let address = loginData.address
        let addressLength = loginData.address.length
        console.log(addressLength, '<<length');
        res.render('manageaddress', { address, isLogin, addressLength })
    } catch (error) {
        console.log(error)
    }
}

const addAddress = async (req, res) => {
    try {
        res.render('newaddress', { isLogin })
    } catch (error) {
        console.log(error);
    }
}

const newAddressUpdate = async (req, res) => {
    try {
        console.log(req.body, '284', loginData._id);
        let data = await User.updateOne({ _id: loginData._id }, { $addToSet: { address: [{ address: req.body.address, pincode: req.body.postalcode, place: req.body.city, state: req.body.state }] } }, { new: true })
        loginData = await User.findOne({ _id: loginData._id })

        //setting 'default = true' if there is no another address
        if (loginData.address.length < 2) {
            data = await User.updateOne({ _id: loginData._id }, { address: [{ address: req.body.address, pincode: req.body.postalcode, place: req.body.city, state: req.body.state, default: true }] }, { new: true })
            loginData = await User.findOne({ _id: loginData._id })
            res.redirect('/profile')
        }
        res.redirect('/profile')
    } catch (error) {
        console.log(error);
    }
}

// edit address
const editAddress = async (req, res) => {
    try {
        let address = loginData.address.filter((element) => {
            if (element._id == req.query.id) {
                return element
            }
        });
        address = address[0]
        res.render('editaddress', { address, isLogin, })
    } catch (error) {
        console.log(error)
    }
}

//updating edited address
const updateEditedAddress = async (req, res) => {

    try {
            //finding the specific address by query id
    let address = loginData.address.filter((element) => {
        if (element._id == req.query.id) {
            return element
        }
    });
    address = address[0]

    //finding the index of the address 
    let indexOfAddress = loginData.address.findIndex((val) => val._id == req.query.id)


    //Finding the index of  default address
    let indexOfDfAddress = loginData.address.findIndex((val) => val.default == true)

    //Find the default address
    let dfAddress = loginData.address.filter((element) => {
        if (element.default == true) {
            return element
        }
    });
    dfAddress = dfAddress[0]
    // console.log(dfAddress,'dfad',indexOfDfAddress,'dfindex',address,'clicked address',indexOfAddress,'clicked index',Boolean(req.body.default),'tr/fl',req.body,address.default,'--');

    if (address.default) {
        loginData.address[indexOfAddress] =
            { address: req.body.address, pincode: req.body.postalcode, place: req.body.city, state: req.body.state, default: true }
        const update = await User.updateOne({ _id: loginData._id }, { $set: { address: loginData.address } }, { new: true })


    }
    else {
        if (req.body.default == 'true') {
            loginData.address[indexOfDfAddress] =
                { address: dfAddress.address, pincode: dfAddress.pincode, place: dfAddress.place, state: dfAddress.state, default: false }
            loginData.address[indexOfAddress] =
                { address: req.body.address, pincode: req.body.postalcode, place: req.body.city, state: req.body.state, default: true }

            const update = await User.updateOne({ _id: loginData._id }, { $set: { address: loginData.address } }, { new: true })
        }
        else {
            loginData.address[indexOfAddress] =
                { address: req.body.address, pincode: req.body.postalcode, place: req.body.city, state: req.body.state, default: false }

            const update = await User.updateOne({ _id: loginData._id }, { $set: { address: loginData.address } }, { new: true })
        }
    }
    res.redirect('/profile')
    
    } catch (error) {
        console.log(error)
    }
}
//(updating edited address) ends here


//Reset-password
const resetPassword = async (req, res) => {
    try {
    res.render('resetpw', { errMsg, scsMsg, isLogin })
    scsMsg = ''
    errMsg = ''
    } catch (error) {
        console.log(error)
    }

}
const resetPasswordUpdate = async (req, res) => {
    try {
        if (await bcrypt.checkPassword(req.body.password, loginData.password)) {
            if (req.body.password1 == req.body.password2) {
                let pw = await bcrypt.securePassword(req.body.password1)
                let data = await User.updateOne({ _id: loginData._id }, { password: pw })
                loginData = await User.findOne({ _id: loginData._id })
                scsMsg = 'Password changed please go back to home'
                res.redirect('/password-reset')
            }
            else {
                errMsg = "The password confirmation doesn't match"
                res.redirect('/password-reset')
            }
        }
        else {
            errMsg = 'Current password is wrong'
            res.redirect('/password-reset')
        }
    } catch (error) {
        console.log(error)
    }    
}

const userlogout = async (req, res) => {
    try {
        delete req.session.user
    isLogin = false
    res.redirect('/')

    } catch (error) {
        console.log(error)
    }
}

const forgetpw = async (req, res) => {
    try {
        res.render('forgetpw1', { errMsg })
    errMsg = ''
    } catch (error) {
        console.log(error)
    }
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
    try {
        if (otpVal == req.body.otp) {
            res.render('forgetpw3', { errMsg })
            errMsg = ''
        }
        else {
            errMsg = 'Incorrect OTP'
            res.redirect('/forget-password2')
        }
    } catch (error) {
        console.log(error);
    }
}
// checking and resetting the password here
const resetpwcheck = async (req, res) => {
    try {
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
    } catch (error) {
        console.log(error)
    }
}

const resetpwcheckfail = async (req, res) => {
    try {
        res.render('forgetpw3', { errMsg })
        errMsg = ''
    } catch (error) {
        console.log(error)
    }
}

//cart 
const cart = async (req, res) => {
    try {
        loginData = await User.findOne({ _id: loginData._id })

    // taking _id from user cart(_id and count is there)
    let cartData = loginData.cart.map((val) => {
        return val._id
    })

    //Quantities of every product
    let cartQuantity = loginData.cart.map((val) => {
        return val.count
    })

    let cartArray = await productModel.find({ _id: { $in: cartData } }).lean()
    let Total = 0
    for (let i = 0; i < cartArray.length; i++) {
        cartArray[i].count = cartQuantity[i]
        cartArray[i].tAmount = Number(cartQuantity[i]) * Number(cartArray[i].rate)
        Total += Number(cartQuantity[i]) * Number(cartArray[i].rate)
    }
    Total = 'Rs ' + Total
    let itemsCount = cartArray.length

    let subTotal = 0
    for (let i = 0; i < loginData.cart.length; i++) {
        subTotal += loginData.cart[i].count
    }

    res.render('cart', { isLogin, cartArray, itemsCount, subTotal, Total })
    } catch (error) {
        console.log(error)
    }
}

const addtoCart = async (req, res) => {
    try {
        let productData = await productModel.findOne({ _id: req.query.id })
        loginData = await User.findOne({ _id: loginData._id })
    
        let product
        let index
        if (loginData.cart) {
            product = loginData.cart.filter((val) => {
                if (req.query.id == val._id) {
                    return val
                }
            })
            if (product.length > 0) {
                if (productData.quantity >= 1) {
                    index = loginData.cart.findIndex((val) => val._id == req.query.id)
                    loginData.cart[index].count = product[0].count + 1
                    let data = await User.updateOne({ _id: loginData._id }, { $set: { cart: loginData.cart } })
                }
                else {
                    //stock over
                }
            }
            else {
                let data = await User.updateOne({ _id: loginData._id }, { $addToSet: { cart: [{ _id: req.query.id, count: 1 }] } }, { new: true })
            }
        }
        else {
    
            let data = await User.updateOne({ _id: loginData._id }, { $addToSet: { cart: [{ _id: req.query.id, count: 1 }] } }, { new: true })
        }
        loginData = await User.findOne({ _id: loginData._id })
        console.log(loginData.cart, 'updated cart 556');
        res.redirect('/products')
    } catch (error) {
        console.log(error);
    }
}

//cart updation from cart -- fetch API
const cartUpdate = async (req, res) => {
    try {
    let cartArray = req.body.cart
    let cartId = cartArray.map((val) => {
        return val.id
    })
    let cartCount = cartArray.map((val) => {
        return Number(val.count)
    })

    // console.log(cartId,cartCount,'<<mapped ids -570');
    let cartData = await productModel.find({ _id: { $in: cartId } }, { _id: 1 }).lean()

    for (let i = 0; i < cartData.length; i++) {
        cartData[i].count = cartCount[i]
    }
    console.log(cartData, '<<$in data');
    let data = await User.updateOne({ _id: loginData._id }, { $set: { cart: cartData } })

    res.json(cartData)
    } catch (error) {
        console.log(error);
    }
}

//Removing item form cart 
const removeItem = async (req, res) => {
    try {
    loginData = await User.findOne({ _id: loginData._id })
    let nwArray = []
    for (let i = 0; i < loginData.cart.length; i++) {
        if (loginData.cart[i]._id == req.query.id) { }
        else {
            nwArray.push(loginData.cart[i])
        }
    }
    loginData.cart = nwArray

    let data = await User.updateOne({ _id: loginData._id }, { cart: loginData.cart })
    console.log(loginData.cart);
    loginData = await User.findOne({ _id: loginData._id })
    res.redirect('/cart')
    } catch (error) {
        console.log(error);
    }
}

const checkout = async (req, res) => {
    try {
        loginData = await User.findOne({ _id: loginData._id })

        // taking _id from user cart(_id and count is there)
        let cartData = loginData.cart.map((val) => {
            return val._id
        })
    
        //Quantities of every product
        let cartQuantity = loginData.cart.map((val) => {
            return val.count
        })
    
        let cartArray = await productModel.find({ _id: { $in: cartData } }).lean()
        console.log(cartQuantity, '<< cart --array quantities 505');
    
        let Total = 0
        for (let i = 0; i < cartArray.length; i++) {
            cartArray[i].count = cartQuantity[i]
            cartArray[i].tAmount = Number(cartQuantity[i]) * Number(cartArray[i].rate)
            Total += Number(cartQuantity[i]) * Number(cartArray[i].rate)
        }
        //Total = 'Rs ' + Total
    
        console.log(cartArray, '<< cart array 510');
    
        let itemsCount = cartArray.length
    
        let subTotal = 0
        for (let i = 0; i < loginData.cart.length; i++) {
            subTotal += loginData.cart[i].count
        }
    
        let address = loginData.address
        res.render('checkout', { isLogin, cartArray, itemsCount, subTotal, Total, address })
    } catch (error) {
        console.log(error);
    }
}


// saving checkout data to db after checkout  
const placeOrder = async (req, res) => {
    try {
        let order = req.body
    console.log(order, '--', order[order.length - 1].couponused, '668 place order function');
    order.length - 1
    let checkouted

    let product = []
    let date
    //product details
    for (let i = 0; i < order.length - 1; i++) {
        product.push({
            id: order[i].productid,
            name: order[i].product,
            price: order[i].price,
            quantity: order[i].counts
        })
    }
    if (order[order.length - 1].deliveryMethod == 'normal') {
        date = [{ orderdate: new Date() }]
        console.log(date)
    }

    else {
        date = [{ orderdate: new Date() }, { schedule: order[order.length - 1].scheduledate }]
    }
    let randomId = idGenerator()
    let address = loginData.address.filter((val => val._id == order[order.length - 1].addressid))

    if (order[order.length - 1].couponused) {
        console.log('coupon status 1');
        let coupon = []
        coupon.push({ name: order[order.length - 1].promocode, offer: order[order.length - 1].offer })

        const cart = await orderModel({
            userId: loginData._id,
            product: product,
            orderId: randomId,
            date: date,
            total: order[order.length - 1].subtotal,
            address: address,
            paymentmethod: order[order.length - 1].paymentMethod,
            deliverymethod: order[order.length - 1].deliveryMethod,
            couponused: true,
            coupon: coupon
        })
        checkouted = await cart.save()
    }
    else {

        console.log('coupon status 2');
        const cart = await orderModel({
            userId: loginData._id,
            product: product,
            orderId: randomId,
            date: date,
            total: order[order.length - 1].subtotal,
            address: address,
            paymentmethod: order[order.length - 1].paymentMethod,
            deliverymethod: order[order.length - 1].deliveryMethod,
        })
        checkouted = await cart.save()
    }


    //updating user after using coupon  
    // if(couponUsed){
    // let upload = await couponModel.updateOne({couponcode : req.body.promocode},{$addToSet:{users :[{userid: loginData._id}]}})
    // }

    const clearCart = await User.updateOne({ _id: loginData._id }, { $set: { cart: [] } })

    //Reducing the stock while successful payement done 
    product.forEach(async (item) => {
        const reduceStock = await productModel.updateOne({ _id: item.id }, { $inc: { quantity: -Number(item.quantity) } })
    })

    if (checkouted) {
        res.json('success')
    }
    else {
        res.json('try again')
    }


    } catch (error) {
        console.log(error)
    }
}

const myOrders = async (req, res) => {

    try {
        let myorders = await orderModel.find({ userId: loginData._id })

    //changing the total value after using coupon
    myorders.forEach((element) => {
        if (element.couponused) {
            element.total = ((100 - element.coupon[0].offer) * element.total) / 100
        }
    })

    myorders.reverse()
    console.log(myorders)
    res.render('myoders', { myorders, isLogin, loginData })
    } catch (error) {
        console.log(error)
    }
}

const cancelOrder = async (req, res) => {
    try {
        let data = await orderModel.updateOne({ _id: req.query.id }, { $set: { status: 'Cancelled' } })
    data = await orderModel.findOne({ _id: req.query.id })

    // afetr cancelling the order resetting the stock back
    data.product.forEach(async (element) => {
        let resetCount = await productModel.updateOne({ _id: element.id }, { $inc: { quantity: +Number(element.quantity) } })
    });
    res.redirect('/my-oders')
    } catch (error) {
        console.log(error);
    }
}

const couponCheck = async (req, res) => {

    try {
        let data = await couponModel.find({ couponcode: req.body.promocode }).lean()
        let date = new Date()
        let usedCode = false
    
        if (data[0]?.users) {
            data[0].users.forEach((element) => {
                console.log(element.userid, '<<ids 749');
                if (String(element.userid) == loginData._id) {
                    usedCode = true
                    console.log('usedCode = true');
                }
            });
        }
    
        if (!data || data.length == 0) {
            console.log('Invalid Coupon 1');
            res.json('Invalid Coupon')
        }
        else if (data[0]?.isvalid == false) {
            console.log('coupon blocked ');
            res.json('Invalid Coupon')
        }
        else if (data[0]?.expiry < date) {
            console.log('Invalid Coupon 2');
            res.json('Invalid Coupon')
        }
        else if (usedCode) {
            console.log('Invalid Coupon 3');
            res.json('Already Used')
        }
        else {
            res.json(data[0].offer)
            let upload = await couponModel.updateOne({ couponcode: req.body.promocode }, { $addToSet: { users: [{ userid: loginData._id }] } })
        }
    } catch (error) {
        console.log(error);
    }
}

const myordersDetails = async (req, res) => {
    try {
        let orderData = await orderModel.find({ _id: req.query.id }).lean()
        console.log(orderData, '[[[', req.body, '<<807');
        let ids = orderData[0].product.map((val) => {
            return val.id
        })
    
        let subTotal = orderData[0].total
        let deliveryMethod = orderData[0].deliverymethod.toUpperCase()
        let paymentmethod = orderData[0].paymentmethod.toUpperCase()
        let orderId = orderData[0].orderId
        let address = Object.values(orderData[0].address[0])
        let status = orderData[0].status
        let date = time(orderData[0].date[0].orderdate).format('DD-MM-YYYY')
        let scheduledDate = time(orderData[0]?.date[1]?.schedule).format('DD-MM-YYYY')
        let actualPrice
        let coupon
        address = address.slice(0, 4)
        console.log(address, date, '[[799');
    
    
        console.log(ids, paymentmethod, deliveryMethod, subTotal, '795')
        let productData = await productModel.find({ _id: { $in: ids } }).lean()
    
        if (orderData[0].couponused) {
            coupon = orderData[0].coupon[0].name
            actualPrice = subTotal
            subTotal = ((100 - orderData[0].coupon[0].offer) * subTotal) / 100
        }
    
        productData.forEach((element, index) => {
            element.quantity = orderData[0].product[index].quantity
            element.total = element.rate * element.quantity
        })
    
        res.render('orderdetails', {
            productData, paymentmethod, deliveryMethod, subTotal, orderId, address,
            isLogin, orderData, status, date, scheduledDate, actualPrice, coupon
        })
    } catch (error) {
        console.log(error);
    }

}


const ordergen = async (req, res) => {
    try {
        console.log("Create OrderId Request", req.body)
    var options = {
        amount: req.body.amount,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "rcp1"
    };
    instance.orders.create(options, function (err, order) {
        console.log(order);
        res.send({ orderId: order.id });//EXTRACT5NG ORDER ID AND SENDING IT TO CHECKOUT
    });
    } catch (error) {
        console.log(error);
    }
}

const siggen = async (req, res) => {
    try {
        let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

        var crypto = require("crypto");
        var expectedSignature = crypto.createHmac('sha256', 'ZT1y2f2HnwGWoM9ESkUn4Ugu')
            .update(body.toString())
            .digest('hex');
        console.log("sig received ", req.body.response.razorpay_signature);
        console.log("sig generated ", expectedSignature);
        var response = { "signatureIsValid": "false" }
        if (expectedSignature === req.body.response.razorpay_signature)
            response = { "signatureIsValid": "true" }
        res.send(response);
    } catch (error) {
        console.log(erro);
    }
}



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
    newAddressUpdate,
    editAddress,
    updateEditedAddress,
    resetPassword,
    resetPasswordUpdate,
    cart,
    addtoCart,
    cartUpdate,
    removeItem,
    checkout,
    placeOrder,
    myOrders,
    cancelOrder,
    couponCheck,
    myordersDetails,


    siggen,
    ordergen
}


