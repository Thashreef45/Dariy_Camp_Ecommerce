const express = require('express')
const admin_route = express()
const adminController = require('../controllers/adminController')
const multer = require('multer')
const path = require('path')
const {upload} = require('../helpers/multer')
const { isLogoutAdmin, isLoginAdmin } = require('../middleware/auth')

//Multer 




admin_route.set('view engine','hbs')
admin_route.set('views','./Views/admin')

admin_route.get('/',(req,res)=>{res.redirect('admin/login')})
admin_route.get('/login',adminController.adminLogin)
admin_route.get('/home',isLoginAdmin,adminController.adminHome)
admin_route.post('/home',adminController.adminHome)
admin_route.post('/checkLogin',adminController.checkLogin)
admin_route.post('/logout',adminController.logout)
admin_route.get('/users',isLoginAdmin,adminController.userManagement)
admin_route.get('/status',isLoginAdmin,adminController.userStatusManage)
admin_route.get('/product',isLoginAdmin,adminController.product)
admin_route.post('/users/search',adminController.userSearch)
admin_route.get('/addProduct',isLoginAdmin,adminController.addProduct)
admin_route.post('/addProduct',upload.array('productimage',3),adminController.updateProduct)
admin_route.post('/product/search',adminController.productsearch)
admin_route.get('/product/disable',isLoginAdmin,adminController.productdisable)
admin_route.get('/product/edit',isLoginAdmin,adminController.editProduct)
admin_route.post('/product/delete',adminController.productDelete)
admin_route.post('/update-edited-Product',upload.array('productimage',3),adminController.updateEditedProduct)
admin_route.post('/category',adminController.categoryManagement)
admin_route.get('/category',isLoginAdmin,adminController.categoryManagement)
admin_route.post('/addCategory',adminController.addCategory)

// admin_route.get('/',adminController.categoryManagement) 
admin_route.post('/delete-category',adminController.deletecategory)
admin_route.get('/order-management',isLoginAdmin,adminController.orderManagement)
admin_route.get('/admin-product-delevered',isLoginAdmin,adminController.adminProductDelevered)
admin_route.get('/coupon',isLoginAdmin,adminController.Coupon)
admin_route.post('/add-coupon',adminController.addCoupon)
admin_route.post('/coupon-status',adminController.couponStatusUpdate)
admin_route.get('/admin-order-viewproducts',isLoginAdmin,adminController.adminOrderViewproducts)
admin_route.get('/sales',isLoginAdmin,adminController.salesReport)
admin_route.get('/admin-home-data',isLoginAdmin,adminController.adminData)







module.exports = admin_route