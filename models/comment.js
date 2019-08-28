
const mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
    text: String,
    createdAt: {type: Date, default: Date.now},
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username: String
    }
});

module.exports = mongoose.model("Comment", commentSchema);

//author made an object with properties id and username. 
//id references a user model id - accessed through req.user (in comments.js route)