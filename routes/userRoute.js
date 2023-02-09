const express = require('express')
const user_route = express()
const userController = require('../Controllers/userController')



user_route.set('view engine', 'hbs')
user_route.set('views', './views/user')

user_route.get('/', userController.loadHome)
user_route.get('/signup', userController.loadSignup)
user_route.post('/signup', userController.insertUser)
user_route.post('/signupverify', userController.signupverify)
user_route.get('/signupOtp',userController.singupOtp)
user_route.post('/logincheck', userController.loginCheck)
// user_route.get('/home', userController.loadHome)
user_route.get('/products', userController.loadproducts)
user_route.get('/about', userController.aboutPage)
user_route.get('/login', userController.loadLogin)
user_route.get('/forget-password', userController.forgetpw)
user_route.post('/forget-password2', userController.forgetpwOtp)
user_route.get('/forget-password2', userController.otpError)
user_route.post('/reset-password', userController.resetpw)
user_route.get('/reset-password', userController.resetpw)
user_route.post('/reset-password2', userController.resetpwcheck)
user_route.get('/reset-password2', userController.resetpwcheckfail)
user_route.get('/product/category',userController.category)
user_route.post('/product/search',userController.productSearch)
user_route.get('/product-page',userController.productPage)
user_route.get('/userprofile',userController.userprofile)
user_route.post('/update-user-profile',userController.updateuserprofile)
user_route.get('/edit-profile',userController.edituser)
user_route.get('/address-management',userController.addressManagement)
user_route.get('/add-address',userController.addAddress)
user_route.post('/new-address-update',userController.newAddressUpdate)
user_route.get('/edit-address',userController.editAddress)
user_route.post('/edited-address-update',userController.updateEditedAddress)
user_route.get('/password-reset',userController.resetPassword)
user_route.post('/reset-password-update',userController.resetPasswordUpdate)
user_route.get('/cart',userController.cart)



user_route.post('/logout',userController.userlogout)


module.exports = user_route