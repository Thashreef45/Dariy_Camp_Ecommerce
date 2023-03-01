const express = require('express')
const admin_route = express()
const adminController = require('../controllers/adminController')
const multer = require('multer')
const path = require('path')
const {upload} = require('../helpers/multer')

//Multer 




admin_route.set('view engine','hbs')
admin_route.set('views','./views/admin')

admin_route.get('/',(req,res)=>{res.redirect('admin/login')})
admin_route.get('/login',adminController.adminLogin)
admin_route.get('/home',adminController.adminHome)
admin_route.post('/home',adminController.adminHome)
admin_route.post('/checkLogin',adminController.checkLogin)
admin_route.post('/logout',adminController.logout)
admin_route.get('/users',adminController.userManagement)
admin_route.get('/status',adminController.userStatusManage)
admin_route.get('/product',adminController.product)
admin_route.post('/users/search',adminController.userSearch)
admin_route.get('/addProduct',adminController.addProduct)
admin_route.post('/addProduct',upload.single('productimage'),adminController.updateProduct)
admin_route.post('/product/search',adminController.productsearch)
admin_route.get('/product/disable',adminController.productdisable)
admin_route.get('/product/edit',adminController.editProduct)
admin_route.post('/product/delete',adminController.productDelete)
admin_route.post('/update-edited-Product',upload.single('productimage'),adminController.updateEditedProduct)
admin_route.post('/category',adminController.categoryManagement)
admin_route.get('/category',adminController.categoryManagement)
admin_route.post('/addCategory',adminController.addCategory)

// admin_route.get('/',adminController.categoryManagement) 
admin_route.post('/delete-category',adminController.deletecategory)
admin_route.get('/order-management',adminController.orderManagement)
admin_route.get('/admin-product-delevered',adminController.adminProductDelevered)
admin_route.get('/coupon',adminController.Coupon)
admin_route.post('/add-coupon',adminController.addCoupon)
admin_route.post('/coupon-status',adminController.couponStatusUpdate)
admin_route.get('/admin-order-viewproducts',adminController.adminOrderViewproducts)
admin_route.get('/sales',adminController.salesReport)
admin_route.get('/admin-home-data',adminController.adminData)

admin_route.get('/hi',(req,res)=>{
    res.render('hlo')
})





module.exports = admin_route