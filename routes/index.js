const express = require("express");
const router = express.Router();
const User = require("../models/user"); 
const passport = require('passport');
const Campground = require("../models/campground");

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
    let newUser = new User({
        username: req.body.username,
        avatar: req.body.avatar,
        bio: req.body.bio,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
    })
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

//===== USER PROFILE =======
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "Something went wrong...");
            res.redirect("/");
        }
        //finds campgrounds where author id is the same as mongoose user id and passes to user-profile page as campgrounds
        Campground.find().where("author.id").equals(foundUser._id).exec(function(err, campgrounds){
            if(err){
                req.flash("error", "Something went wrong...");
                res.redirect("/");
            };
            res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        });
    });
});


module.exports = router;