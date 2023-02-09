const userModel = require('../Model/userModel')
const Admin = require('../Model/adminModel')
const categoryModel = require('../Model/categoryModel')
const productModel = require('../Model/productModel')
const { ObjectId } = require('mongodb')

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
    if (req.session.admin) {
        res.render('home')
    }
    else {
        res.redirect('/admin/login')
    }

}

const userManagement = async (req, res) => {

    if (req.session.admin) {
        res.render('users', { userArray, errMsg })
        errMsg = ''
        setUserCollection()
    }
    else {
        res.redirect('/admin/login')
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
    if (req.session.admin) {
        let uId = req.query.id
        let isBlocked = await userModel.findById({ _id: uId })
        if (isBlocked.status) {
            isBlocked = await userModel.updateOne({ email: isBlocked.email }, { status: false })
        }
        else {
            isBlocked = await userModel.updateOne({ email: isBlocked.email }, { status: true })
        }
        setUserCollection()
        res.redirect('/admin/users')
    }
    else {
        res.redirect('/admin/login')
    }

}

//Product page
const product = async (req, res) => {
    if (req.session.admin) {
        if (!searched) {
            arrayProducts = await setProductCollection()
            console.log(arrayProducts, 'hhhh 133 admin');
            res.render('product', { arrayProducts })
        }
        else {
            res.render('product', { arrayProducts })
            searched = false
            arrayProducts = await setProductCollection()
        }
    }
    else {
        res.redirect('/admin/login')
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
    let editProduct = await productModel.updateOne({ _id: req.query.id },
        {
            $set: {
                name: req.body.productname, category: req.body.category, image: req.file.filename,
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
    if (req.session.admin) {
        setCategoryCollection()
        res.render('addproducts', { categoryArray })
    }
    else {
        res.redirect('/admin/login')
    }
}

const updateProduct = async (req, res) => {
    const newProduct = new productModel({
        image: req.file.filename,
        name: req.body.productname,
        unit: req.body.producunit,
        rate: req.body.productprice,
        quantity: req.body.productquantity,
        category: req.body.category,
        description: req.body.productdescription
    })
    const productSave = newProduct.save()
    res.redirect('/admin/product')
}

const categoryManagement = async (req, res) => {
    categoryArray = await setCategoryCollection()
    res.render('category', { categoryArray })
}
const addCategory = async (req, res) => {
    let category = categoryModel.find({})
    category = addCategory.filter((val)=>{
        
    })
    req.body.category
    if (req.body.category == '') {
        res.redirect('/admin/category')
    }
    else if(hi){

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
    productDelete
    // productsearch
}