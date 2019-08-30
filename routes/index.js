const express = require("express");
const router = express.Router();
const User = require("../models/user"); 
const passport = require('passport');

//app.METHOD(PATH, HANDLERfunction) - express route definition (app is an instance of express)
//root route
router.get("/", (req, res) => {
    res.render("landing");
});

//register form for new users
router.get("/register", (req, res)=>{
    res.render('register');
});
//create user
router.post("/register", (req, res)=>{
    let newUser = new User({username: req.body.username})
    if(req.body.adminCode === 'secretcode') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user)=>{ //register hashes password automatically before sending to db
        if (err){
            console.error(err);
            req.flash('error', err.message);
            return res.redirect("/register")
        } 
        passport.authenticate("local")(req, res, function(){
            req.flash('success', "Welcome to the community " + user.username);
            res.redirect("/campgrounds");
        });
    });
});


//=========LOGIN ROUTES============
router.get("/login", (req, res)=>{
    res.render("login"); 
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect:"/campgrounds",
        failureRedirect:"/login"
    }), (req, res)=>{}
);

//=======LOGOUT===========
router.get('/logout', (req, res)=>{
    req.logout();
    res.redirect('/campgrounds');
});


//========MIDDLEWARE======= -check if user is logged in if certain functions performed
function isLoggedin(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
};


module.exports = router;