
const express = require("express"); //JS web framework
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); //JS interface for MongoDB 
const passport = require('passport');   //authentication middleware for node.
const LocalStrategy = require('passport-local'); //plugs in to passport to provide user-password authentication (middleware)
const seedDb = require("./seeds");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
const User = require("./models/user"); 
const methodOverride = require("method-override");//can use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
const flash = require('connect-flash');// flash messages informing user of err/succes 
const PORT = process.env.PORT || 5000


const commentRoutes = require("./routes/comments"); //refactored route logic into separate dirs
const campgroundRoutes = require("./routes/campgrounds");
const indexRoutes = require("./routes/index");

app.use(bodyParser.urlencoded({extended: true})); 
app.set("view engine", "ejs");
//express.static(root, [options]) - specifies dir from which to serve static assests (e.g. img/CSS/JS)
app.use(express.static(__dirname + "/public"))  //__dirname refers to directory name of app.js
                                                //convention in node + safer
app.use(methodOverride("_method"));
app.use(flash());

//PASSPORT CONFIG       //secret used inside of sessions to encode and decode data
app.use(require("express-session")({
    secret: "Nyquist",
    resave: false,              // don't save session if unmodified
    saveUninitialized: false    // don't create session until something stored
}));
//must be after require express-session or /secret page does not redirect correctly after login
app.use(passport.initialize());  //required anytime passport used
app.use(passport.session());    //required anytime passport used

//custom middleware - function written called on every route - in this case the currentUser variable
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error'); //error is a key to certain message
    res.locals.success = req.flash('success');
    next(); //required or code hangs on middleware and doesnt move to next function
});

// use static authenticate method of model in LocalStrategy - essentially passportLocalMongoose has written the
passport.use(new LocalStrategy(User.authenticate()));     //- authenticate() method already, we are using instead of writing a custom function 
passport.serializeUser(User.serializeUser());   // use static serialize and deserialize of model for passport session support
passport.deserializeUser(User.deserializeUser());   //also from passport local mongoose 

//DATABASE MONGOOSE
// mongoose.connect('mongodb://localhost/yelp_camp', {useNewUrlParser: true});
mongoose.connect('mongodb+srv://paynee:pass@cluster0-m8mwu.mongodb.net/test?retryWrites=true&w=majority', {
    dbName: 'Cluster0',
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log("Connected to ATLAS DB!");
}).catch(err => {
    console.log('initial mongoose connection error:', err.message);
});
mongoose.connection.on('error', err => {
    console.log("ongoing yelp_camp connection error:", err.message)
});

//seedDb();   //function from seeds.js to remove all data from database and seed afresh


app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes); //all routes in campgrounds.js prefixed with /campgrounds
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(PORT, () => console.log(`Listening on ${ PORT } \n============== YelpServer UP ==============`))


//================END======================== below are old code snippets for reference





// var campgrounds = [
//     {name:"Milo Mount", image:"https://farm2.staticflickr.com/1424/1430198323_c26451b047.jpg"},
//     {name:"Cream Creek", image:"https://farm4.staticflickr.com/3130/2770459706_3aed20703e.jpg"},
//     {name:"Biscuit Boulder", image:"https://farm3.staticflickr.com/2116/2164766085_0229ac3f08.jpg"},
//     {name:"Oreo Ooolong", image:"https://farm9.staticflickr.com/8471/8137270056_21d5be6f52.jpg"},
//     {name:"Jammy Lake and Creek", image:"https://farm8.staticflickr.com/7285/8737935921_47343b7a5d.jpg"},
//     {name:"Daves Dive", image:"https://farm7.staticflickr.com/6188/6106475454_cf4dab4d64.jpg"},{name:"Milo Mount", image:"https://farm2.staticflickr.com/1424/1430198323_c26451b047.jpg"},
//     {name:"Whatever Wakii", image:"https://farm7.staticflickr.com/6082/6142484013_74e3f473b9.jpg"},
//     {name:"Creek Paddle Dam", image:"https://farm8.staticflickr.com/7457/9586944536_9c61259490.jpg"},
// ];





//old seed data
// db.once('open', () => {
//     Campground.create({
//         name:"Cream Creek", 
//         image:"https://farm4.staticflickr.com/3130/2770459706_3aed20703e.jpg",
//         description: "Aggressive puppies attacked us during our stay here. Avoid the creek if you value your ankles.."
//     }, function(err, campground){
//         if(err) return console.error(err);
//         console.log(campground + "added to MongoDB!");
//     });
// });
