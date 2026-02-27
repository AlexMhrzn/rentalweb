const express = require('express').Router();
const multer=require("multer");
const upload=multer();
const fileUpload = require('../helpers/multer');

const{getAllUser,addUser,addAdminUser,getUsersById,getActiveUsers,updateUser,deleteUser,
    logInUser,getMe,getProfile,updateProfile,changePassword
}=require("../controllers/userController");

const authGuard = require("../helpers/authguagrd");
const isAdmin = require("../helpers/isAdmin");

// express.get("/getallUsers",authGuard,isAdmin,getAllUser);
// express.get("/getMe",authGuard,getMe);
// express.post("/register",addUser);
// express.get("/getuserByid/:uid",authGuard,isAdmin,getUsersById);
// express.put("/updateUserByid/:id",authGuard,isAdmin,updateUser);
// express.delete("/deleteuser/:id",authGuard,isAdmin,deleteUser);
// express.post("/login",logInUser);

express.post("/user",upload.none(),addUser)
express.post("/admin-register",upload.none(),addAdminUser)
express.get("/me",authGuard,getMe)
// profile endpoints
express.get("/profile", authGuard, getProfile);
express.put("/profile/update", authGuard, fileUpload('image'), updateProfile);
express.put("/profile/change-password", authGuard, changePassword);
express.get("/getalluser",authGuard,isAdmin,getAllUser)
express.get("/getusersbyid/:id",authGuard,isAdmin,getUsersById)
express.get("/getactiveusers",authGuard,getActiveUsers)
express.put("/updateuserbyid/:id",authGuard,isAdmin,updateUser)
express.delete("/deleteuserbyid/:id",authGuard,isAdmin,deleteUser)
express.post("/loginuser",logInUser)

module.exports=express;