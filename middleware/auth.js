const jwt = require('jsonwebtoken');
const Customer = require('../model/schema');


const auth= async(req,res,next)=>{


    try {
       const token = req.headers.authorization;
       console.log('ver_token');
        
        const verifyuser = jwt.verify(token,'secretkey');
        
        
       const user = await Customer.findOne({_id : verifyuser.id});
      
        
        req.userid = verifyuser;
        next();
        
    } catch (error) {
        res.status(404).json({
            message: 'unauthorized user'
        })
    
        
    }
}
module.exports.auth = auth;