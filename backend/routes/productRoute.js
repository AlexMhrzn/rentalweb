const express = require('express').Router();

const{getAllProduct}=require("../controllers/productController")

express.get("/product",getAllProduct)

module.exports=express;