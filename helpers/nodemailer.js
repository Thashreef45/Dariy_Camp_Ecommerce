const nodemailer = require('nodemailer')
const sendMail = async (name, email, id, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'ahmedthashreef@gmail.com',
                pass: 'caothpkwijvkfimu'
            }
        })
        const mailOptions = {
            from: 'ahmedthashreef@gmail.com',
            to: email,
            subject: 'For email verification',
            html: '<p>Hi ' + name + ',This is from Dairy Camp.<br> It is your OTP : ' + otp + '</p>'
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email has been send ', info.response);
            }
        })
    } catch (error) {
        console.log(error);
    }
}


module.exports = sendMail