const bcrypt = require('bcrypt')

const securePassword = async (password) => {
    try {
        const passwordHash = bcrypt.hash(password, 8)
        return passwordHash
    } catch (error) {
        console.log(error)
    }
}

const checkPassword = async (reqPw,dbPw) => {
    try {
        const pwCheckStatus = await bcrypt.compare(reqPw,dbPw,) 
        return pwCheckStatus
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    checkPassword,
    securePassword
}