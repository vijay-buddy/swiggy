const mongoose = require('mongoose');
const validator = require('validator');
const bycript = require('bcryptjs');
const { default: isEmail } = require('validator/lib/isEmail');
const customerSchema = new mongoose.Schema({
    name : {
        type : String,
        minlength :3,
        required:true
    },
    email :{
        type: String,
        required:true,
        unique:[true,"email id is already present"],
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("invalid email");
            }
        }
    },
    phone : {
            type:Number,
           unique : true,
            min:10,
            required: true

        },

        
        password :{
            type:String,
            required:true,
    
        },
        confirmpassword :{
            type:String
            
    
        },
        customerprofile:{
           type:String
        },
        latitude :{
            type : Number
        },
        longitude :{
            type:Number
        },
        location:{
            type:{
                type:String,
                enum:['Point'],
                required:true,
            },
            coordinates:{
                type:[Number],
                required:true
            }
        
        },
        
        deliverOption:{
            type:String,
            enum:['delivery','pickup'],
            default:'delivery'
        },
        seller:{
        profile : {
            type: String,
            
            
        },
        pannumber:{
            type : String,
            
            
        },
        panimage :{
            type:String,
            
            
        },
        adharfront :{
            type:String,
           
           
        },
        adharback :{
            type:String,
            
            
        },
        address:{
            streetname :{
                type:String,
                
               
            },
            city :{
                type:String,
               
                
            },
            selectstate :{
                type:String,
               
               
            },
            pincode :{
                type:String,
                
              
            }
        }
        }


    
})
//using bcript
customerSchema.pre("save",async function(next){
    if(this.isModified("password")){
        console.log(`the current passwod is  ${this.password}`);
        this.password= await bycript.hash(this.password,10);
        console.log(`the current passwod is  ${this.password}`);
        this.confirmpassword= await bycript.hash(this.confirmpassword,10);
        //this.confirmpassword = undefined;
        next();


    }
})
// we will create a new collection
const Customer = new mongoose.model("Customer",customerSchema);
customerSchema.index({location:"2dsphere"},{
    sparse:true
})
module.exports = Customer;
