const Campground = require("../models/campground");
const Comment = require("../models/comment");

//Middleware for all routes goes here
let middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
    //AUTHORISATION: is user logged in?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundCampground)=>{
            if(err || !foundCampground) {   //edge case - !foundCampground prevents null being returned from valid requests to db
                //console.error(err);       //null breaks application and stops server running 
                req.flash('error', 'Campground not found...');
                res.redirect('back');
            } else {
                //logged in - is author id same as user id - foundCampground.author.id is a mongoose object, req.user._id is a string
                //.equals is a mogoose method allowing mogooseObj to string comparison
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash('error', "You don't have the required permission.");
                    res.redirect('back');
                };
            };
        });
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('back');
    };
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment)=>{
            if(err || !foundComment) {
                // console.error(err);
                req.flash('error', "Comment not found")
                res.redirect('back');
            } else {
                //logged in - is author id same as user id - foundComment.author.id is a mongoose object, req.user.comment_id is a string
                //.equals is a mogoose method allowing mogooseObj to string comparison
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                } else {
                    req.flash('error', 'You do not have permission.');
                    res.redirect('back');
                };
            };
        });
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('back');
    };
};

// -check if user is logged in if certain functions performed
middlewareObj.isLoggedin = function isLoggedin(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'Please Login First.'); //must be before the redirect, data does not persist
    res.redirect('/login');
};


module.exports = middlewareObj