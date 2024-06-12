const mbxClient = require('@mapbox/mapbox-sdk');
const mbxgeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const accesstoken=process.env.MAP_TOKEN;

const geocodingClient = mbxgeocoding({ accessToken: accesstoken });


const express=require("express");
const app=express();
const router=express.Router();
const passport=require("passport");
const Listing=require("../model/Hotel.js");
const OrignListing=require("../model/Listing.js");
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

// router.get("/search", wrapAsync(async (req, res) => {
//     const { query } = req.query;
//     console.log(query);
//     if (!query) {
//         req.flash("error", "Please enter a search term");
//         return res.redirect("/listing");
//     }

//     const listings = await Listing.find({
//         $or: [
//             { title: { $regex: query, $options: 'i' } },
//             { description: { $regex: query, $options: 'i' } },
//             { location: { $regex: query, $options: 'i' } },
//             { country: { $regex: query, $options: 'i' } }
//         ]
//     });

//     res.render("./Hotel/index.ejs", { alllist: listings });
// }));
//add new route
router.get("/:id/hotels/new",isloggedin,wrapAsync(async(req,res,next)=>{
    let {id}=req.params;
    console.log(id);
    const listing=await OrignListing.findById(id);

    res.render("./Hotel/add.ejs",{id});
    
    
}))
router.get("/:id/hotels/:hotelid/edit",upload,isloggedin,wrapAsync(async(req,res)=>{
   
    let {id,hotelid}=req.params;
    const listing=await Listing.findById(hotelid);
    
    
    const editImageUrl = listing.image.map(image => {
        return image.path.replace("/upload", "/upload/h_300,w_250");
    });
    if(!listing){
        req.flash("error","Listing you access to edit is already deleted");
        res.redirect("/hotel");

    }
    res.render("./hotel/update.ejs",{id,listing,editImageUrl});
}))
router.post("/:id/hotels",upload,wrapAsync(async(req,res)=>{
    const response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send()
        
//    console.log(response.body.features);
//    res.send("done");
    
    let {id}=req.params;
    const newlisting=new Listing(req.body.listing);
    const listing=await OrignListing.findById(id);
    newlisting.image = req.files.map(file => ({
        path: file.path,
        filename: file.filename
    }));
    
    newlisting.owner=req.user._id;
    // newlisting.geometry={ type: 'Point', coordinates: [ -155.134023, 19.698738 ]};
    listing.Hotel.push(newlisting);
    await newlisting.save();
    await listing.save();
    console.log(newlisting);
    req.flash("success","new listing added sucessfully");
    res.redirect("/hotel");
}))



//show route
router.get("/:id/hotels/:hotelid",wrapAsync(async(req,res)=>{
    let {id,hotelid}=req.params;
    const Orignlist=await OrignListing.findById(id).populate("Hotel").populate({path:"review",populate:({path:"author"})}).populate("owner");
    const list= await Listing.findById(hotelid).populate({path:"review",populate:({path:"author"})}).populate("owner");
    if(!list){
        req.flash("error","Listing you access is already deleted");
        res.redirect("/hotel");

    }
        res.render("./hotel/show.ejs",{id,list,Orignlist});
    
    
}))

//update
router.put("/:id/hotels/:hotelid",upload,wrapAsync(async(req,res,next)=>{
    // let {error}=listingValidation.validate(req.body);
    // console.log(error);
    // if(error){
    //      throw new ExpressError(400,error);
    // }else{
    //     next();
    // }
    let {hotelid}=req.params;
    const updatedListing=await Listing.findByIdAndUpdate(hotelid,{...req.body.list} );
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => ({
            path: file.path,
            filename: file.filename
        }));
        updatedListing.image.push(...newImages); // Add new images to existing ones
        await updatedListing.save();
    }
    
    req.flash("success","Listing updated sucessfully");
    res.redirect("/hotel");
}))

router.delete("/:id/hotels/:hotelid",isloggedin,wrapAsync(async(req,res)=>{
    let {hotelid}=req.params;
    const list=await Listing.findByIdAndDelete(hotelid);
    
    req.flash("success","Listing Deleted sucessfully");
    res.redirect("/hotel");
    
}))

//new route
router.get("/:id/hotels",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const alllist=await Listing.find({});
    const list=await OrignListing.findById(id).populate({path:"review",populate:({path:"author"})}).populate("owner").populate("Hotel");
    console.log(alllist);
    //res.send();
   res.render("./Hotel/index.ejs",{list,id});
}) )

module.exports=router;