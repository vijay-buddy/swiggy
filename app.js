
const express = require('express');
const app= express();
const ejs = require('ejs');
const path = require('path');
require('./db/conn')
const userrouter = require("./router/users");
const Customer = require('./model/schema')
const bodyparser = require ('body-parser');
const port = process.env.PORT || 3000;
const staticpath = path.join(__dirname,"/views");

app.use(express.static(staticpath));
// app.set('views','./views); // it can also be used  in place of above expression
app.set("view engine","ejs");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}))
//app.use(express.json());//  this act as a middleware it recognises the json request from postman
// now we need to register our router
app.use('/',userrouter);
app.listen(port,()=>{
    console.log(`connection is running at ${port}`);

})