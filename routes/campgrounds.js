const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware"); //index.js files automatically required when parent folder required

// INDEX ROUTE - show all campgrounds
router.get("/", (req, res) => {
    //get all campgrounds from db then render 
    Campground.find({}, (err, Allcampgrounds) => {
        if (err) return console.error(err);
        res.render("campgrounds/index", {campgrounds: Allcampgrounds, currentUser: req.user});
    });
});
// CREATE ROUTE - add new campground to database
router.post("/", middleware.isLoggedin, (req, res) => {
    //get data from form - add to campgrounds mongoDB
    const name = req.body.name;
    const image = req.body.image;
    const desc = req.body.description;
    let author = {
        id:req.user._id,
        username:req.user.username
    };
    const price = req.body.price;

    var newCampground = {name:name, image:image, description:desc, author:author, price:price};
    //create new Campground and save to DB
    Campground.create(newCampground, (err, campground) =>{
        if(err) return console.error(err);
        //else redirect to campgrounds page
        res.redirect("/campgrounds"); //default redirect is GET
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedin, (req, res) => {
    res.render("campgrounds/new");
}); //form sends POST, add form data to arr, redirect to / via GET to update to new data

//SHOW - /campgrounds/:id - GET - shows info absout one specific campground
// /:id can be anycombination of viable letters/nums so must define this GET route last
router.get("/:id", (req, res) =>{
    //find campground with requested ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err || !foundCampground){
            req.flash('error', "Campground not found.");
            res.redirect("back");
        } else {
            res.render("campgrounds/show", {campground: foundCampground}); //must pass in campground to views template    
        };
    });
});

//==========EDIT campground Route===========
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res)=>{
        Campground.findById(req.params.id, (err, foundCampground)=>{
            if(err) return console.error(err);
            res.render("campgrounds/edit", {campground: foundCampground});
        });
});

//=========UPDATE campground route==========
router.put("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
//find and update correct campground -findByIdAndUpdate needs (id, [data to update], callback)
//-can use req.body.campground due to object campground[name]..etc. in edit.ejs
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
        if(err){
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    //redirect back to show page of campground
});

//===========DELETE/DESTROY ROUTE=============
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
    Campground.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res.redirect("/campgrounds")
        } else {
            res.redirect("/campgrounds")
        };
    });
});

module.exports = router;
