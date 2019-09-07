
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    password: String,
    avatar: String,
    bio: String,
    firstName: String,
    lastName: String,
    email: String,
    isAdmin: {type: Boolean, default: false}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);