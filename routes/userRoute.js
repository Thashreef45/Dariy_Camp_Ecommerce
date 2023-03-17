const express = require('express')
const user_route = express()
const userController = require('../controllers/userController')
const { isLogged, isLogout } = require('../middleware/auth')


user_route.set('view engine', 'hbs')
user_route.set('views', './Views/user')

user_route.get('/', userController.loadHome)
user_route.get('/signup', isLogout, userController.loadSignup)
user_route.post('/signup', userController.insertUser)
user_route.post('/signupverify', userController.signupverify)
user_route.get('/signupOtp', userController.singupOtp)
user_route.post('/logincheck', userController.loginCheck)
// user_route.get('/home', userController.loadHome)
user_route.get('/products', userController.loadproducts)
user_route.get('/about', userController.aboutPage)
user_route.get('/login',isLogout, userController.loadLogin)
user_route.get('/forget-password',isLogout, userController.forgetpw)
user_route.post('/forget-password2', userController.forgetpwOtp)
user_route.get('/forget-password2',isLogout, userController.otpError)
user_route.post('/reset-password', userController.resetpw)
user_route.get('/reset-password',isLogged, userController.resetpw)
user_route.post('/reset-password2', userController.resetpwcheck)
user_route.get('/reset-password2',isLogout, userController.resetpwcheckfail)
user_route.get('/product/category', userController.category)
user_route.post('/product/search', userController.productSearch)
user_route.get('/product-page', userController.productPage)
user_route.get('/profile',isLogged, userController.userprofile)
user_route.post('/update-user-profile', userController.updateuserprofile)
user_route.get('/edit-profile',isLogged, userController.edituser)
user_route.get('/address-management',isLogged, userController.addressManagement)
user_route.get('/add-address',isLogged, userController.addAddress)
user_route.post('/new-address-update', userController.newAddressUpdate)
user_route.get('/edit-address',isLogged, userController.editAddress)
user_route.post('/edited-address-update', userController.updateEditedAddress)
user_route.get('/password-reset',isLogged, userController.resetPassword)
user_route.post('/reset-password-update', userController.resetPasswordUpdate)
user_route.get('/cart', isLogged, userController.cart)
user_route.get('/addto-cart', isLogged, userController.addtoCart)
user_route.get('/remove-item',isLogged, userController.removeItem)
user_route.post('/cart-updation', userController.cartUpdate)
user_route.post('/checkout', userController.checkout)
user_route.post('/place-order', userController.placeOrder) 
user_route.get('/my-oders',isLogged, userController.myOrders)
user_route.get('/cancel-order',isLogged, userController.cancelOrder)
user_route.post('/coupon-check',userController.couponCheck)
user_route.get('/myorders-details',userController.myordersDetails) 
user_route.post('/invoice',userController.invoice) 



user_route.post('/create/orderId', userController.ordergen)
user_route.post('/api/payment/verify', userController.siggen)

user_route.get('*',(req,res)=>{
    res.render('404')
})





user_route.post('/logout', userController.userlogout)


module.exports = user_route