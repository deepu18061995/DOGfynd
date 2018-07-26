var mongoose=require("mongoose");


var dogSchema=new mongoose.Schema({
    name:String,
    breed:String,
    price:String,
    image:String,
    contact:Number,
    age:String,
    description:String,
    location:String,
    created:{type:Date, default:Date.now},
    comment:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"comment"
    }]
});

module.exports=(mongoose.model("dog", dogSchema));