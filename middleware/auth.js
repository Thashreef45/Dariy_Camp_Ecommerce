const isLogged = async (req, res, next) => {
    try {
        if (req.session.user) {
            next();
        } else {
            return res.redirect('/');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user) {
            return res.redirect('/')
        }
        else
            next();
    } catch (error) {
        console.log(error.message);
    }
}

// const isLogoutAdmin = async (req, res, next) => {
//     try {
//         if (req.session.admin_id) {
//           return  res.redirect('/admin/adminhome')
//         }
//         next();
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const isLoginAdmin = async (req, res, next) => {
//     try {
//         if (req.session.admin_id) {} else {
//           return  res.redirect('/admin');
//         }
//         next();
//     } catch (error) {
//         console.log(error.message);
//     }
// }

module.exports = {
    isLogged,
    isLogout,
    // isLoginAdmin,
    // isLogoutAdmin,
  
}

