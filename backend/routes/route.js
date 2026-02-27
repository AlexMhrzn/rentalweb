const express = require('express').Router();
const multer = require("multer");
const upload = multer();
const fileUpload = require('../helpers/multer');

const {
    getAllUser,
    addUser,
    addAdminUser,
    getUsersById,
    getActiveUsers,
    updateUser,
    deleteUser,
    logInUser,
    getMe,
    getProfile,
    updateProfile,
    changePassword
} = require("../controllers/userController");

// Matches your actual filename: authguagrd.js
const authGuard = require("../helpers/authguagrd"); 
const isAdmin = require("../helpers/isAdmin");

// --- User Registration & Login ---
express.post("/user", upload.none(), addUser);
express.post("/admin-register", upload.none(), addAdminUser);
express.post("/loginuser", logInUser);

// --- Profile Endpoints ---
express.get("/me", authGuard, getMe);
express.get("/profile", authGuard, getProfile);
express.put("/profile/update", authGuard, fileUpload('image'), updateProfile);
express.put("/profile/change-password", authGuard, changePassword);

// --- Admin Management Endpoints ---
express.get("/getalluser", authGuard, isAdmin, getAllUser);
express.get("/getusersbyid/:id", authGuard, isAdmin, getUsersById);
express.get("/getactiveusers", authGuard, getActiveUsers);
express.put("/updateuserbyid/:id", authGuard, isAdmin, updateUser);
express.delete("/deleteuserbyid/:id", authGuard, isAdmin, deleteUser);

module.exports = express;