const mongoose=require("mongoose");
const data1=require("../init/data.js");
const Listing=require("./Listing.js");


async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}
main().then(()=>{
   console.log("mongoose connected successful");
}).catch((err)=>{
    console.log(err);
})

const initDB=async ()=>{
    await Listing.deleteMany({});
     data1.data=await data1.data.map((obj)=>({...obj,owner:"66359328559bb1acc5526893"}));
     data1.data=await data1.data.map((obj)=>({...obj,geometry:{ type: 'Point', coordinates: [ -155.134023, 19.698738 ]}}));
    await Listing.insertMany(data1.data);
}

initDB();