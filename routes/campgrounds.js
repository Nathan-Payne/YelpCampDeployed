const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware"); //index.js files automatically required when parent folder required
const multer = require("multer");
//FILE UPLOAD LOGIC via Multer - storage puts current date at start of filename
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function(req, file, cb){
    //accepts only image files of set types
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({storage: storage, fileFilter: imageFilter});
//CLOUDINARY LOGIC
var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: 'sippingcoffeeeveryday',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//=========MAPS GEOCODE INFO===========
var NodeGeocoder = require("node-geocoder");
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
var geocoder = NodeGeocoder(options);

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

    geocoder.geocode(req.body.location, function (err, data) {
        if (err || !data.length) {
            //console.log(err); //use to debug check restrictions 
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        var lat = data[0].latitude;
        var lng = data[0].longitude;
        var location = data[0].formattedAddress;
        var newCampground = {name: name, image: image, description: desc, price: price, author:author, location: location, lat: lat, lng: lng};
        // Create a new campground and save to DB
        Campground.create(newCampground, function(err, newlyCreated){
            if(err){
                console.log(err);
            } else {
                //redirect back to campgrounds page
                // console.log(newlyCreated);
                res.redirect("/campgrounds");
            }
        });
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
    geocoder.geocode(req.body.location, function(err, data){
        if(err || !data.length){
            req.flash('error', 'Invalid address');
            return res.redirect('back');
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
            if(err){
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                req.flash("success","Successfully Updated!");
                res.redirect("/campgrounds/" + req.params.id);
            }
        });
    })
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
