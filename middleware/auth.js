const isLogged = async (req, res, next) => {
    try {
        if (req.session.user) {
            next();
        } else {
            return res.redirect('/login');
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

const isLoginAdmin = async (req, res, next) => {
    try {
        if (req.session.admin) {
            next()
        }
        else {
          return  res.redirect('/admin');
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogged,
    isLogout,
    isLoginAdmin,

}

