const mongoose = require('mongoose');
const sellerschema = new mongoose.Schema({
    profile : {
        type: String,
        required : true
    },
    pannumber:{
        type : String,
        required:true
    },
    panimage :{
        type:String,
        required : true
    },
    adharfront :{
        type:String,
        required:true
    },
    adharback :{
        type:String,
        required:true
    },
    streetname :{
        type:String,
        required:true
    },
    city :{
        type:String,
        required:true
    },
    selectstate :{
        type:String,
        required:true
    },
    pincode :{
        type:String,
        required:true
    }
})
const Seller = new mongoose.model("Seller",sellerschema);
module.exports =Seller;
