const mongoose = require("mongoose");
const Comment = require("./comment");
//SCHEMA setup
var campgroundSchema = new mongoose.Schema({
    name: String, 
    price: String,
    image: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [             //comments property should be an array of database Id's
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
}); //can't var Campground... here due to scope, declaring within function means it is not
//seen in global scope - used when get request to /campgrounds made **was a problem when in .once() callback

//synchronus - program waits until each operation finished before moving on to the next
//asynchronus - something happening but program does not wait to continue - e.g. when waiting for server response
//- callbacks used to handle async data - gets very complex in parallel/concurrent tasks
//- ES6 introduced promises - can pass around a representation of a future value, a promise is an object which represents what the value will be when the operation finishes
//- ES7 introduced async/await syntax (Promises+Generators) - await pauses (like a generator) until promise is completed - allows events to occur while waiting
campgroundSchema.pre('remove', async function(){
    await Comment.remove({ _id: {$in: this.comments}});
});

module.exports = mongoose.model("Campground", campgroundSchema); 