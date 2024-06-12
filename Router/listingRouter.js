
const mbxClient = require('@mapbox/mapbox-sdk/services/geocoding');
const accesstoken=process.env.MAP_TOKEN;

const geocodingClient = mbxClient({ accessToken: accesstoken });



const express=require("express");
const app=express();
const router=express.Router();
const passport=require("passport");
const Listing=require("../model/Listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpreesError.js");

const {listingValidation,reviewValidation}=require("../Schema.js");
const {isloggedin,isOwwner}=require("../middleware.js");
const {storage}=require("../clodinary_config.js");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const multer  = require('multer');
const upload = multer({storage }).array('image', 10);
// const uploadMultiple=upload.fields([{name:'listing[image]',maxCount:5}]);
const UserVisit = require('../model/userVisit.js'); // Create this model
router.get("/search", wrapAsync(async (req, res) => {
    const { query } = req.query;
    const { customerId, deviceId, websiteId } = req.query;
    tracker.visitWebsite(customerId, deviceId, websiteId);
    const count = tracker.getOverallWebsiteHitCount(websiteId);
    const visit=await UserVisit.find({});
    let count2=0;
    for(let i in visit){
        count2++;
    }

    const userreg=await user.find({});
    let count3=0;
    for(let i in userreg){
        count3++;
    }
    console.log(query);
    if (!query) {
        req.flash("error", "Please enter a search term");
        return res.redirect("/listing");
    }

    const listings = await Listing.find({
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } },
            { country: { $regex: query, $options: 'i' } }
        ]
    });

    res.render("./listing/index.ejs", { alllist: listings,count,count2,count3 });
}));
class WebsiteHitTracker {
    constructor() {
        this.customerDevices = new Map(); // Maps customerId to a Set of deviceIds
        this.websiteVisits = new Map(); // Maps websiteId to a Map of customerId to a Set of deviceIds
    }

    visitWebsite(customerId, deviceId, websiteId) {
        if (!this.customerDevices.has(customerId)) {
            this.customerDevices.set(customerId, new Set());
        }
        this.customerDevices.get(customerId).add(deviceId);

        if (!this.websiteVisits.has(websiteId)) {
            this.websiteVisits.set(websiteId, new Map());
        }
        if (!this.websiteVisits.get(websiteId).has(customerId)) {
            this.websiteVisits.get(websiteId).set(customerId, new Set());
        }
        this.websiteVisits.get(websiteId).get(customerId).add(deviceId);
    }

    getWebsiteVisitCountForCustomer(customerId, websiteId) {
        if (this.websiteVisits.has(websiteId) && this.websiteVisits.get(websiteId).has(customerId)) {
            return this.websiteVisits.get(websiteId).get(customerId).size;
        }
        return 0;
    }

    getOverallWebsiteHitCount(websiteId) {
        if (this.websiteVisits.has(websiteId)) {
            
            return this.websiteVisits.get(websiteId).size;
        }
        return 0;
    }
}

const tracker = new WebsiteHitTracker();
//add new route
router.get("/new",isloggedin,(req,res,next)=>{
    res.render("./listing/add.ejs");
    
    
})
router.get("/:id/edit",upload,isloggedin,wrapAsync(async(req,res)=>{
   
    let {id}=req.params;
    const listing=await Listing.findById(id);
    
    
    const editImageUrl = listing.image.map(image => {
        return image.path.replace("/upload", "/upload/h_300,w_250");
    });
    if(!listing){
        req.flash("error","Listing you access to edit is already deleted");
        res.redirect("/listing");

    }
    res.render("./listing/update.ejs",{listing,editImageUrl});
}))
router.post("/",upload,wrapAsync(async(req,res)=>{
    const response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send()
        
//    console.log(response.body.features);
//    res.send("done");
    
    
    const newlisting=new Listing(req.body.listing);
    
    newlisting.image = req.files.map(file => ({
        path: file.path,
        filename: file.filename
    }));
    
    newlisting.owner=req.user._id;
    newlisting.geometry=response.body.features[0].geometry;
    await newlisting.save();
    console.log(newlisting);
    req.flash("success","new listing added sucessfully");
    res.redirect("/listing");
}))



//show route
router.get("/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const list= await Listing.findById(id).populate("Hotel").populate({path:"review",populate:({path:"author"})}).populate("owner");
    if(!list){
        req.flash("error","Listing you access is already deleted");
        res.redirect("/listing");

    }
        res.render("./listing/show.ejs",{list});
    
    
}))

//update
router.put("/:id",upload,isOwwner,wrapAsync(async(req,res,next)=>{
    // let {error}=listingValidation.validate(req.body);
    // console.log(error);
    // if(error){
    //      throw new ExpressError(400,error);
    // }else{
    //     next();
    // }
    let {id}=req.params;
    const updatedListing=await Listing.findByIdAndUpdate(id,{...req.body.list} );
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => ({
            path: file.path,
            filename: file.filename
        }));
        updatedListing.images.push(...newImages); // Add new images to existing ones
        await updatedListing.save();
    }
    
    req.flash("success","Listing updated sucessfully");
    res.redirect("/listing");
}))

router.delete("/:id",isOwwner,isloggedin,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const list=await Listing.findByIdAndDelete(id);
    
    req.flash("success","Listing Deleted sucessfully");
    res.redirect("/listing");
    
}))
const user=require("../model/user.js");
//new route
router.get("/",wrapAsync(async(req,res)=>{
   
    const alllist=await Listing.find({});
    const { customerId, deviceId, websiteId } = req.query;
    tracker.visitWebsite(customerId, deviceId, websiteId);
    const count = tracker.getOverallWebsiteHitCount(websiteId);
    const count1 = tracker.getWebsiteVisitCountForCustomer(customerId, websiteId);
    console.log(req.query.deviceId);
    console.log(count);
    console.log(customerId);
    
    const visit=await UserVisit.find({});
    let count2=0;
    for(let i in visit){
        count2++;
    }

    const userreg=await user.find({});
    let count3=0;
    for(let i in userreg){
        count3++;
    }
    //res.send();
   res.render("./listing/index.ejs",{alllist,count,count2,count3});
}) )

module.exports=router;