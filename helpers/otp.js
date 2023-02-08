
function otp() {
    let otp = Math.random()
    otp = Math.trunc(otp = otp * 100000000)
    otp = otp.toString()
    otp = otp.slice(0, 6)
    otp = Number(otp)
    return otp
}

module.exports = otp




