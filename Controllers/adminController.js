const userModel = require('../Model/userModel')
const Admin = require('../Model/adminModel')
const categoryModel = require('../Model/categoryModel')
const productModel = require('../Model/productModel')
const orderModel = require('../Model/ordermodel')
const time = require('moment')
const couponModel = require('../Model/couponmodel')
const { ObjectId } = require('mongodb')
const User = require('../Model/userModel')
const Category = require('../Model/categoryModel')
const e = require('express')

let userArray // Storing users collection 
let categoryArray //Storin category collection 
let arrayProducts
let searched = false

async function setUserCollection() {
    userArray = await userModel.find()
}
async function setCategoryCollection() {
    return categoryArray = await categoryModel.find()
}
async function setProductCollection() {
    const productArray = await productModel.find()
    return productArray
}

let errMsg // passing to hbs,settin while password or email wrong
setUserCollection()


const adminLogin = async (req, res) => {
    if (req.session.admin) {
        res.redirect('/admin/home')
    }
    else {
        res.render('login', { errMsg })
        errMsg = ''
    }

}

const adminHome = async (req, res) => {
    try {
        res.render('home')
    } catch (error) {
        console.log(error)
    }
        

}
const adminData = async (req, res) => {

    try {
        let Orders = await orderModel.find({status:'Delivered'}).lean()
        let products = await productModel.find({}, { name: 1,category:1, _id: 0 }).lean()
    
        let paymentCount = []
        let cod = 0
        let razor = 0
        let payements = Orders.forEach((element)=>{
            if(element.paymentmethod == 'cod'){ cod ++ }
            else{razor++}
        })
        paymentCount.push(cod,razor)
        products.forEach((element) => {
            element.count = 0
            Orders.forEach((item) => {
                item.product.forEach((prd) => {
                    if (prd.name == element.name) {
                        element.count += prd.quantity;
                    }
                })
            })
        })
    
        let counts = []
        let categories = await categoryModel.find({},{_id:0,category:1}).lean()
    
        
    
        categories.forEach((element)=>{
            element.count = 0
            products.forEach((val)=>{
                if(element.category == val.category){
                    element.count  += val.count
                }
                
            })
        })
    
        categories = categories.map((val)=>{
            counts.push(val.count)
            return val.category
        })
    
    
        //weekly sales data 
        let sales = await orderModel.find({status:'Delivered'}).lean()
        let date
        let dateArray = []
        let weeklySales = []
        for(let i = 0 ;i < 7 ; i++){
            date = new Date()
            date.setDate(date.getDate()-i)
            dateArray.push(date)
        }
    
        dateArray.forEach((element)=>{
            let sum = 0
            sales.forEach((val)=>{
                let date1 = time(val.date[0].orderdate).format('DD-MM-YYYY')
                let date2 = time(element).format('DD-MM-YYYY')
                if(date1 == date2){
                    sum+= val.total
                }
            })
            weeklySales.push(sum)
        })
    
        dateArray = dateArray.map((date)=>{
           return time(date).format('DD-MM-YYYY')
        })
        dateArray.reverse()
        weeklySales.reverse()
    
    
        res.json({
            counts,
            categories,
            paymentCount,
    
            dateArray,
            weeklySales,
        })
    } catch (error) {
        console.log(error)
    }
}

const userManagement = async (req, res) => {
    try {
        res.render('users', { userArray, errMsg })
        errMsg = ''
        setUserCollection()
    } catch (error) {
        console.log(error);
    }

}


const checkLogin = async (req, res) => {
    const adminData = await Admin.findOne({ email: req.body.email })
    try {
        if (!adminData) {
            errMsg = 'Account not found'
            res.redirect('/admin/login')
        }
        else if (adminData.email == req.body.email) {
            if (adminData.password == req.body.password) {
                req.session.admin = true
                res.redirect('/admin/home')
            }
            else {
                //password wrong
                errMsg = 'Email or Password is wrong'
                res.redirect('/admin/login')
            }
        }
        else {
            // email not exist
            errMsg = 'Email or Password is wrong'
            res.redirect('/admin/login')
        }
    } catch (error) {
        console.log(error)
    }
}

const userSearch = async (req, res) => {
    userArray = await userModel.find({ name: { $regex: req.body.search } })

    if (req.body.search == '') {
        setUserCollection()
        res.redirect('/admin/users')
    }
    else if (req.body.search) {
        errMsg = ''
        res.redirect('/admin/users')
    }
    else {
        errMsg = 'No result found'
        res.redirect('/admin/users')
    }

}

//For Blockin and Unblocking user 
const userStatusManage = async (req, res) => {
    try {
        let uId = req.query.id
        let isBlocked = await userModel.findById({ _id: uId })
        if (isBlocked.status) {
            isBlocked = await userModel.updateOne({ email: isBlocked.email }, { status: false })
        } else {
            isBlocked = await userModel.updateOne({ email: isBlocked.email }, { status: true })
        }
        setUserCollection()
        res.redirect('/admin/users')
    } catch (error) {
        console.log(error);
    }
}

//Product page
const product = async (req, res) => {
    try {
        if (!searched) {
            arrayProducts = await setProductCollection()
            res.render('product', { arrayProducts })
        }
        else {
            res.render('product', { arrayProducts })
            searched = false
            arrayProducts = await setProductCollection()
        }
    } catch (error) {
        console.log(error);
    }
}

//Produch search
const productsearch = async (req, res) => {
    try {
        arrayProducts = await productModel.find({ name: { $regex: req.body.search } })
        searched = true
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error);
    }
}

const productdisable = async (req, res) => {
    try {
        arrayProducts = await productModel.findOne({ _id: req.query.id })
        if (arrayProducts.status) {
            arrayProducts = await productModel.updateOne({ _id: req.query.id }, { $set: { status: false } })
        }
        else {
            arrayProducts = await productModel.updateOne({ _id: req.query.id }, { $set: { status: true } })
        }
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error);
    }
}

const editProduct = async (req, res) => {
    let editProduct = await productModel.findOne({ _id: req.query.id })
    categoryArray = await setCategoryCollection()
    res.render('editproduct', { categoryArray, editProduct })
}
const updateEditedProduct = async (req, res) => {

    let images = req.files.map((file)=>{
        return file.filename
    })
    let editProduct = await productModel.updateOne({ _id: req.query.id },
        {
            $set: {
                name: req.body.productname, category: req.body.category, image: images[0],
                images : images,
                rate: req.body.productprice, unit: req.body.producunit, quantity: req.body.productquantity,
                description: req.body.productdescription
            }
        })
    res.redirect('/admin/product')
}

//Deleting a product
const productDelete = async (req, res) => {
    try {
        let deleteProduct = await productModel.deleteOne({ _id: req.body.id })
        res.json("response")
        // res.redirect('/admin/product')
    } catch (error) {
        console.log(error);
    }
}

//Add Product page
const addProduct = async (req, res) => {
    try {
        setCategoryCollection()
        res.render('addproducts', { categoryArray })
    } catch (error) {
        console.log(error);
    }
}

const updateProduct = async (req, res) => {

    let images = req.files.map((file)=>{
       return file.filename
    })



    const newProduct = new productModel({
        image: images[0],
        images : images,
        name: req.body.productname,
        unit: req.body.producunit,
        rate: req.body.productprice,
        quantity: req.body.productquantity,
        category: req.body.category,
        description: req.body.productdescription
    })
    const productSave = newProduct.save()

    // const newProduct = new productModel({
    //     image: req.file.filename,
    //     name: req.body.productname,
    //     unit: req.body.producunit,
    //     rate: req.body.productprice,
    //     quantity: req.body.productquantity,
    //     category: req.body.category,
    //     description: req.body.productdescription
    // })
    // const productSave = newProduct.save()
    // res.redirect('/admin/product')
}

const categoryManagement = async (req, res) => {
    categoryArray = await setCategoryCollection()
    res.render('category', { categoryArray, errMsg })
    errMsg = ''
}
const addCategory = async (req, res) => {
    let category = await categoryModel.find({})
    let notUnique = false

    for (let index = 0; index < category.length; index++) {
        if (category[index].category.toLowerCase().replace(/\s/g, '') == req.body.category.toLowerCase().replace(/\s/g, '')) {
            notUnique = true
        }
    }

    // removing space and saving into "const input"
    const input = req.body.category.replace(/\s/g, '');
    if (input == '') {
        errMsg = 'Only spaces are not allowed'
        res.redirect('/admin/category')
    }
    else if (notUnique) {
        res.redirect('/admin/category')
        errMsg = 'Similar category is there'
        notUnique = false
    }
    else {
        let catdata = await new categoryModel({
            category: req.body.category,
            status: true
        })
        const dataCat = await catdata.save()
        res.redirect('/admin/category')
    }
}

const deletecategory = async (req, res) => {
    try {
        const id = req.body.id
        let data = await categoryModel.deleteOne({ _id: id })
        let response = data
        res.json(response);
    } catch (error) {
        console.log(error);
    }
}

const orderManagement = async (req, res) => {

    let orders = await orderModel.find({deliverymethod : 'normal',status:{$ne:'Order placed'}}).lean() 
    let sOrders = await orderModel.find({deliverymethod : 'scheduled',status:{$ne:'Order placed'}}).lean()

    const pendingOrders = await orderModel.find({deliverymethod : 'normal',status:'Order placed'}).lean()
    const sPendingOrders = await orderModel.find({deliverymethod : 'scheduled',status:'Order placed'}).lean()

    orders.forEach((val) => {
        val.date[0].orderdate = time(val.date[0].orderdate).format('DD-MM-YYYY')

    })
    sOrders.forEach((val)=>{
        val.date[0].orderdate = time(val.date[0].orderdate).format('DD-MM-YYYY')
        val.date[1].schedule = time(val.date[1].schedule).format('DD-MM-YYYY')
        
    })


    pendingOrders.forEach((val) => {
        val.date[0].orderdate = time(val.date[0].orderdate).format('DD-MM-YYYY')

    })
    sPendingOrders.forEach((val)=>{
        val.date[0].orderdate = time(val.date[0].orderdate).format('DD-MM-YYYY')
        val.date[1].schedule = time(val.date[1].schedule).format('DD-MM-YYYY')
        
    })

    pendingOrders.reverse()
    sPendingOrders.reverse()
    sOrders.reverse()
    orders.reverse()
    res.render('ordermanagement', { orders,sOrders,pendingOrders ,sPendingOrders})

   
}
const adminOrderViewproducts = async (req, res) => {
    let orderData = await orderModel.find({ _id: req.query.id }).lean()
    let ids = orderData[0].product.map((val) => {
        return val.id
    })

    

    let subTotal = orderData[0].total
    let deliveryMethod = orderData[0].deliverymethod.toUpperCase()
    let paymentmethod = orderData[0].paymentmethod.toUpperCase()
    let orderId = orderData[0].orderId
    let address = Object.values(orderData[0].address[0])
    address = address.slice(0, 4)
    let userId = orderData[0].userId
    let actualPrice
    let coupon
    if (orderData[0].couponused) {
        coupon = orderData[0].coupon[0].name
        actualPrice = subTotal
        subTotal = ((100 - orderData[0].coupon[0].offer) * subTotal) / 100

    }

    //Taking user name
    let userName = await User.findOne({_id:userId},{_id:0,name:1})
    userName = userName.name

    let productData = await productModel.find({ _id: { $in: ids } }).lean()
    productData.forEach((element, index) => {
        element.quantity = orderData[0].product[index].quantity
        element.total = element.rate * element.quantity
    })

    res.render('orderdetails', {
        productData, paymentmethod, deliveryMethod, subTotal, orderId,
         address, orderData, userId,userName,actualPrice,coupon
    })

    //res.render('orderdetails')
}


const adminProductDelevered = async (req, res) => {

    const data = await orderModel.updateOne({ _id: req.query.id }, { $set: { status: 'Delivered' } })

    res.redirect('/admin/order-management')

}

const Coupon = async (req, res) => {
    const couponArray = await couponModel.find()
    res.render('couponmanagement', { couponArray, errMsg })
    errMsg = ''
}

const addCoupon = async (req, res) => {
    let data = await couponModel.find().lean()

    let unique = true
    data.forEach((val) => {
        if (val.couponcode.toLowerCase().replace(/\s/g, '') == req.body.coupon.toLowerCase().replace(/\s/g, '')) {
            unique = false
        }
    })

    let input = req.body.coupon
    if (input.replace(/\s/g, '') == '') {
        errMsg = 'Spaces are not taken as input'
        res.redirect('/admin/coupon')
    }
    else if (!unique) {
        errMsg = 'Similar Coupon already exist'
        res.redirect('/admin/coupon')
    }
    else {
        let couponAdd = new couponModel({
            couponcode: req.body.coupon,
            expiry: req.body.date,
            offer: Number(req.body.discount)
        })
        let upload = await couponAdd.save()
        res.redirect('/admin/coupon')
    }
}

const couponStatusUpdate = async (req, res) => {
    let coupon = await couponModel.findOne({ _id: req.body.id })


    if (coupon.isvalid) {
        let data = await couponModel.updateOne({ _id: req.body.id }, { $set: { isvalid: false } })
        res.json('false')
    }
    else {
        let data = await couponModel.updateOne({ _id: req.body.id }, { $set: { isvalid: true } })
        res.json('true')
    }
}


//Sales report page
const salesReport = async (req, res) => {
    try {
        let Orders = await orderModel.find().lean()

        let products = await productModel.find({}, { name: 1, category: 1, _id: 0, rate: 1 }).lean()
        products.forEach((val) => {
            val.count = 0
            val.sum = 0
        })

        products.forEach((element) => {

            Orders.forEach((val) => {
                val.product.forEach((prd) => {
                    if (prd.name == element.name) {
                        element.count += prd.quantity;
                        element.sum = element.rate * element.count
                    }
                })
            })
        })

        let sum = 0
        let quantity = 0

        products.forEach((i) => {
            sum += i.sum
            quantity += i.count
        })
        
        products.push({
            count: quantity, sum: sum,
            name :'Total  (Count and Sum)',
            // rate :'',
            // category :''
        })

        res.render('salesreport', { products ,quantity,sum})


    } catch (error) {
        console.log(error);
    }
}

const logout = async (req, res) => {
    req.session.destroy()
    res.redirect('/admin/login')
}

module.exports = {

    adminLogin,
    adminHome,
    checkLogin,
    userManagement,
    userSearch,
    logout,
    userStatusManage,
    product,
    addProduct,
    updateProduct,
    categoryManagement,
    addCategory,
    deletecategory,
    productsearch,
    productdisable,
    editProduct,
    updateEditedProduct,
    productDelete,
    orderManagement,
    adminProductDelevered,
    Coupon,
    addCoupon,
    couponStatusUpdate,
    adminOrderViewproducts,
    salesReport,
    adminData
    // productsearch
}