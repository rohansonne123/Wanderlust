if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}
// console.log(process.env);

const express=require("express");
const app=express();
const mongoose=require("mongoose");
const Listing=require("./model/Listing.js");
const path=require("path");
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpreesError.js");

const {listingValidation,reviewValidation}=require("./Schema.js");
const Review = require("./model/Review.js");

const listingsRouter=require("./Router/listingRouter.js");
const hotelRouter=require("./Router/hotelRouter.js");
const reviewsRouter=require("./Router/reviewRouter.js");
const userRouter=require("./Router/userRouter.js");

const session=require("express-session");
const flash= require('express-flash');

const passport=require("passport");
const User=require("./model/user.js");
const LocalStrategy=require("passport-local");
const { v4: uuidv4 } = require('uuid');
const UserVisit = require('./model/userVisit.js'); // Create this model
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const url=process.env.ATLAS_URL;
const store=MongoStore.create({
    mongoUrl:url,
    crypto:{
        secret: process.env.SECRET_KEY,
    },
    touchAfter: 24*3600,
})

store.on("error",()=>{
    console.log("ERROR in MONGO Session Store");
})
const sessionOptions={
    store,
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    Cookie:{
       expires:Date.now()+7*24*60*60*1000,
       maxAge:7*24*60*60*1000,
       httpOnly:true,
    }
}


app.use(cookieParser());
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.engine('ejs', engine);
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

async function main(){
    await mongoose.connect(process.env.ATLAS_URL);
}
main().then(()=>{
   console.log("mongoose connected successful");
}).catch((err)=>{
    console.log(err);
})

app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.userData=req.user;
    res.locals.pathData=req.path;
    next();
})
app.use(async (req, res, next) => {
    let userId = req.cookies.userId;
    if (!userId) {
      userId = uuidv4();
      res.cookie('userId', userId, { maxAge: 900000, httpOnly: true });
    }
    const userVisit = await UserVisit.findOneAndUpdate(
        { userId: userId },
        { $set: { lastVisit: new Date() } },
        { upsert: true, new: true }
      );
      
      req.userVisit = userVisit;
      next();});
//listing Router
app.use("/listing",listingsRouter);
//reviews Router
app.use("/listing/:id",reviewsRouter);
app.use("/listing",hotelRouter);
//user
app.use("/",userRouter);

// const validateListing=(req,res,next)=>{
//     let {error}=listingValidation.validate(req.body);
//     if(error){
//          next( new ExpressError(400,error));
//     }else{
//         next();
//     }
// }
// const validateReview=(req,res,next)=>{
//     let {error}=reviewValidation.validate(req.body);
//     if(error){
//         let errmsg=error.details.map((el)=>el.message).join(",");
//          throw new ExpressError(400,errmsg);
//     }else{
//         next();
//     }
// }

app.get("/getDemoUser",async(req,res,next)=>{
    const newUser=new User({
        email:"rohan@gmail.com",
        username:"rohansonne",
    })

    const userData = await User.register(newUser,"1234");
    res.send(userData);
})

app.all("*",(req,res,next)=>{
   
    next(new ExpressError(401,"path not found"));
})

app.use((err,req,res,next)=>{
    let { status=500,message="random error" }=err;
    res.status(status).render("error.ejs",{message});
})

app.listen(8080,()=>{
    console.log("listing to port 8080");
})