const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
    item:{
        type:String,
        required:true,
        
    },
    category_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Categories',
        required:true
    },
    seller_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref :'Customers',
    

    },
    price:{
        type : Number
    },
    image:{
        type:String
    }
});

const Item = new mongoose.model("Item",itemSchema);
itemSchema.index({'item':'text'})
module.exports = Item;
