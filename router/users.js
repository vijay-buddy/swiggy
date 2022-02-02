const express = require('express');
const path = require('path');
const bycript = require('bcryptjs');
const ejs = require('ejs');
const Customer = require('../model/schema');
const nodemailer = require('nodemailer');
const Category = require('../model/categories');
const Item = require('../model/items');
//const Seller = require('../model/sellerschema');
//const bodyparser = require('body-parser');
const {ustomerSchema}= require('../model/schema')
const jwt = require('jsonwebtoken');

const app= express();

const { check, validationResult}= require("express-validator");
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { request } = require('http');
const { profile } = require('console');
const { auth } = require('../middleware/auth');
app.use(express.static(__dirname+"./public/uploads"))
const bodyparser = require('body-parser');
const { response } = require('express');
app.use(express.urlencoded({extended:false}));
//app.use(bodyparser.urlencoded({extended:true}))
//app.use(bodyparser.json());
// creating router
const router = new express.Router();



// uploading image syntax


const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/uploads');
    },
    filename : function(req,file,cb){


        cb(null,Date.now()+path.extname(file.originalname))
    }
})

const filefilter = (req,file,cb)=>{
    if(file.mimetype==="image/jpg" || file.mimetype=== "image/jpeg"){
        cb(null,true);
    }
    else{
     cb(null,false);
    }
}
const upload  = multer({
    storage:storage,
    
filefilter : filefilter
    
})



// user can register as well as become a sellerr


router.post("/register", async(req,res)=>{
    try{

        
        const password = req.body.password;
        const confirmpassword= req.body.confirmpassword;
        if(password===confirmpassword)
        {
            
        const user = new Customer({ 
        name : req.body.name,
        email : req.body.email,
        phone : req.body.phone,
        password : req.body.password,
        confirmpassword:req.body.confirmpassword,
        latitude:req.body.latitude,
        longitude:req.body.longitude,
        location:{type:'Point', coordinates:[req.body.longitude,req.body.latitude]}
        

    });

    console.log('user',user);
    const createuser = await user.save();
    console.log(createuser);
        res.status(201).send(createuser);
        }
        else{
            res.send("password not match");
        }
    }
    catch(e)
    {
        res.status(400).send(e);

    }

})
// customer profile update
router.patch("/profileupdate",auth,upload.fields([{
  name : "customerprofile",maxCount:1  
}]),async(req,res)=>{
    try{
        const updatedInfo = await Customer.updateOne(
            { _id: _id},
         
            { $set: {
                customerprofile:(!req.files || Object.keys(req.files).length === 0)? "":req.files['customerprofile'][0].filename,

            }})
            console.log(updatedInfo);
            res.send(updatedInfo);
            
    }
    catch(err){
        res.send(err);
    }



}
)
router.patch("/registerseller",auth,upload.fields(
    [
        {
            name:'profile',
            maxCount:1
        },
        {
            name: 'panimage', maxCount:1
        },
        {
            name: 'adharfront', maxCount:1
        },
        {
            name : 'adharback',maxCount:1
        }
    ]),async(req,res)=>{
        try{
        const _id = req.userid.id;
        
        const updatedInfo = await Customer.updateOne(
            { _id: _id},
         
            { $set: {
                seller:{
                
                panimage :req.files['panimage'][0].filename,
                adharfront:req.files['adharfront'][0].filename,
                adharback:req.files['adharback'][0].filename,
                
                pannumber:req.body.pannumber,
                profile:req.files['profile'][0].filename,
                address:{

                streetname:req.body.streetname,
                city:req.body.city,
                selectstate:req.body.selectstate,
                pincode:req.body.pincode
                }
                }
              

            } }

          );
          res.send(updatedInfo);
        }
        catch(err){
            res.send(err);
        }



})
// updating seller
router.patch("/updateseller",auth,upload.fields(
    [
        {
            name:'profile',
            maxCount:1
        }
    ]),async(req,res)=>{
        try{
            const _id = req.userid.id;
            
            const updatedInfo = await Customer.updateOne(
                { _id: _id},
             
                { $set: {
                    name :req.body.name,
                    "seller.pannumber":req.body.pannumber,
                    "seller.profile":(!req.files || Object.keys(req.files).length === 0)? "":req.files['profile'][0].filename,
                    
    
                    "seller.address.streetname":req.body.streetname,
                    "seller.address.city":req.body.city,
                    "seller.address.selectstate":req.body.selectstate,
                    "seller.address.pincode":req.body.pincode
                    
                    
                  
    
                } }
    
              );
              res.send(updatedInfo);
            }
            catch(err){
                res.send(err);
            }

    }
    )

// rendering ejs file
router.get("/changepassword/:email",(req,res)=>{
    console.log('params', req.params.email)
    res.render("changepassword", {email:req.params.email});
})



// updating forgot password
router.post("/changepassword",async(req,res)=>{
    console.log(req.body.email);
    const email = req.body.email;
    
    const base64 = email;

// create a buffer
const buff = Buffer.from(base64, 'base64');

// decode buffer as UTF-8
const str = buff.toString('utf-8');

// print normal string
console.log(str);

    //const userid =  await Customer.find({email :str});
    var pass= req.body.password;
    var confirm = req.body.confirmpassword;
    
    //const _id = userid[0]._id;
    if(pass==confirm)
    {
       
        pass=await bycript.hash(pass,10);
          confirm=  await bycript.hash(confirm,10);
            console.log(confirm);
            const updateuser = await Customer.updateOne({email:str},{$set :{
                password : pass,
                confirmpassword :confirm
            }});
    

            if(updateuser){
                res.send(updateuser);
            }
            else{
                res.send("not updated");
            }
            
            
            
            
            
            
        
        


        }
    else{
        res.send("password and confirmpassword not matched")
    }


    
    

})


// showing success



router.post("/login",//[
    // check('email')
    // .exists()
    // .isEmail(),
    // check('password','invalid password')
    // .exists()
//]
async(req,res)=>{
    try {
        // const errors = validationResult(req)
        // if (!errors.isEmpty()) {
        //     return res.status(400).json({ errors: errors.array() });
    
        // }
        const email = req.body.email;
        const password = req.body.password;
        
        const usermail = await Customer.findOne({email:email});
        console.log(usermail);
      
        const isMatch = await bcrypt.compare(password,usermail.password)
        console.log(isMatch);
        if(isMatch){
            
            console.log('token : ',jwt.sign({id :usermail._id},'secretkey'));
            res.status(201).send(`Successful login    src,
            id : ${usermail._id},
            token : ${jwt.sign({id :usermail._id},'secretkey')}`);
            
        }
        else{
            res.send("invalid login");
        }
        
    } catch (error) {
        res.status(400).send(error);
        
    }
})



// now showing data of database using get method



router.get("/user",auth,async(req,res)=>{
    try{
       
        
        const usersdata = await Customer.findOne({_id :req.userid.id} );
        
        res.send(usersdata._id)
        
    }catch(e){
        res.send(e);
    }
})





// now showing paricular document using id
router.get("/users/:id",async(req,res)=>{
    try{
    const _id = req.params.id;
    const userdata = await Customer.findById(_id);
    res.send(userdata);
    }
    catch(e){
        res.send(e);
    }
})









// update profile
router.patch("/useredit",auth, async(req,res)=>{
try{
    const _id = req.userid.id;
    const updateuser = await Customer.findByIdAndUpdate(_id,req.body,{
        new : true, useFindAndModify :false
    }
    );
    res.send(updateuser);
    console.log(updateuser);

}
catch(e){
res.send(e);
  
}
})







// delet document
router.delete("/deluser/:id",async(req,res)=>{
try{
const _id = req.params.id;
const deluser = await Customer.findByIdAndDelete(_id);

res.send(deluser);
}
catch(e){
    res.send(e);
}

})


//change password
router.patch("/updatepass",auth, async(req,res)=>{
    try{
        const _id = req.userid.id;
        const password = req.body.oldpassword;
        const userdata = await Customer.findById(_id);
        const isMatch = await bcrypt.compare(password,userdata.password);
        //const cpass = await bcrypt.compare(password,userdata.confirmpassword);
        if(isMatch)
        {
            let data={
                password : req.body.password,
                confirmpassword : req.body.confirmpassword
            }
            if(password== data.password)
            {
                res.send("oldpassword and new password cannot be same");
            }
            else if(data.password == data.confirmpassword)
            {
            data.password=await bycript.hash(data.password,10);
            data.confirmpassword= await bycript.hash(data.confirmpassword,10);
            const updateuser = await Customer.findByIdAndUpdate(_id,data,{
                new : true, useFindAndModify :false
            }
            );
        
            res.send(updateuser);
            console.log(updateuser);
        }
        else{
            res.send("password not match");
        }

        }
       
    
    }
    catch(e){
    res.send(e);
      
    }
    })


    // forget password 
    router.post("/forgetpass",async(req,res)=>{
        const email = req.body.email;
        // plain-text string
const str = email;

// create a buffer
const buff = Buffer.from(str, 'utf-8');

// decode buffer as Base64
const base64 = buff.toString('base64');

// print Base64 string
console.log(base64);
    
        const userid =  await Customer.find({email : email});
       
        console.log(userid[0].email);
        if(userid[0].email== req.body.email)
        {
            
        
        var transporter = nodemailer.createTransport({
            port :2525,
            host:'smtp.mailtrap.io',
            auth: {
              user: '40d7706843bef2',
              pass: 'ffb6a55e978800'
            }
          });
          var mailOptions = {
            from: 'sfs.priyanka19@gmail.com',
            to: req.body.email,
            subject: 'FORGET PASSWORD',
            html: 'To reset your password click on this link <a href="http://localhost:3000/changepassword/'+base64+'"> Click Here</a>'
          };
         transporter.sendMail(mailOptions,(err,result)=>{

            if(result){
                res.send('Mail has been sent')
            }

            else{
                res.status(400).json({
                    message: 'Mail not sent',
                    Error: err
                })
            }
        
           })
       
          
        
        }
        else{
            res.status(400).json({
                message: 'invalid email',
                
            })
        }
        
    })
    // creating category
    router.post("/category",async(req,res)=>{
        const category = new Category({
            name : req.body.name
        })
        const createcategory = await category.save();
        res.send(createcategory);
        console.log(createcategory);


    })
    //adding items
    router.post("/items",auth,upload.fields([
        {
        name : 'image' ,maxCount:1
        }
    ]),async(req,res)=>{
        const find = await Category.findOne({name : req.body.name})
        if(find){
            let cat_id= find._id;
        const items = new Item({
            item:req.body.item,
            category_id : cat_id,
            price : req.body.price,
            seller_id:req.userid.id,
             image : (!req.files || Object.keys(req.files).length === 0)? "":req.files['image'][0].filename


        })
        const createitem = await items.save();
        res.send(createitem);
        
    }
    else("category not found")
    })
    //getting all itmes of registerd user
    router.get("/getitemsuser",auth,async(req,res)=>{
        try {
            const seller = req.userid.id;
            const userdata = await Item.find({seller_id:seller});
            res.send(userdata);
    

            

            
        } catch (error) {
            res.json({
                message:"error",
                error:error
            })
            
        }
    })


    router.post("/search",async(req,res)=>{

          const data =  await Item.find({item:{ $regex: /^l.*/, $options: "i" }});
          return res.status(200).json({
              data:data
          })

          
    });
    router.get("/findnearitems",auth,async(req,res)=>{
        try{
        // const neardata = await  Customer.aggregate([
        //     {
        //         $geoNear:{
        //             near: {type: "Point", coordinates: [ parseFloat(req.body.lng), parseFloat(req.body.lat)]},
        //             distanceField: "dist.calculated",
        //             minDistance:1,
        //             maxDistance:400*1000,
        //            // query: { category: "Parks" },
        //             includeLocs: "dist.location",
        //             spherical: true
        //         }
        //      }
        // ])

       let items =  await Item.aggregate([
            {
                $lookup:{
                    from:'customers',
                    // localField:'seller_id',
                    // foreignField:'_id',
                    let:{
                        'seller':'$seller_id'
                    },
                    pipeline:[
                        {
                            $geoNear:{
                                near: {type: "Point", coordinates: [ parseFloat(req.body.lng), parseFloat(req.body.lat)]},
                                distanceField: "dist.calculated",
                                minDistance:1,
                                maxDistance:400*1000,
                                // query: { category: "Parks" },
                                includeLocs: "dist.location",
                                spherical: true
                            }
                        },
                        {
                            $match:{                               
                                    $expr:{                                         
                                        $eq:["$_id","$$seller"]
                                    }
                                
                            }
                         }
                    ],
                    as:'seller'
                }
            },
            {
                $unwind:"$seller"
            },
            {
                $project:{
                    'seller_name':'$seller.name',
                    'seller_distance':'$seller.dist.calculated',
                    _id:1,
                    item:1,
                    category_id:1,
                    seller_id:1,
                    image:1,
                    price:1
                }
            }
        ])
        if(items)
        {
            res.status(200).json({
                data:items,
                message:"item found"
            })
        }else{
            res.status(404).json({
                data:[],
                message:"items not found"
            })
        }

      
    }catch(err){
        res.status(404).json({
            err:err,
            message:err.message
        })
    }

    })
    


module.exports=router;