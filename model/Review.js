const { ref } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const reviewSchema=new Schema({
    comment:String,
    Rating:{
        type:Number,
        min:1,
        max:5,
        default:3,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User",
    }
})

module.exports=mongoose.model("Review",reviewSchema);