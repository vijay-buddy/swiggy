const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/swiggyapi",{
useNewUrlParser: true,
useUnifiedTopology: true,
useNewUrlParser : true,


 }).then(()=>{
    console.log("connection successful to  swiggy database")
 }).catch((err)=>{
     console.log("no connection");
});