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
    changePassword,
    forgotPassword,
    resetPassword
} = require("../controllers/userController");

// report controller for user complaints/scams
const {
    createReport,
    getUserReports,
    getAllReports
} = require("../controllers/reportController");

// Matches your actual filename: authguagrd.js
const authGuard = require("../helpers/authguagrd"); 
const isAdmin = require("../helpers/isAdmin");

// --- User Registration & Login ---
express.post("/user", upload.none(), addUser);
express.post("/admin-register", upload.none(), addAdminUser);
express.post("/loginuser", logInUser);

// --- Forgot/Reset Password ---
express.post("/forgot-password", upload.none(), forgotPassword);
express.post("/reset-password", upload.none(), resetPassword);

// --- Profile Endpoints ---
express.get("/me", authGuard, getMe);
express.get("/profile", authGuard, getProfile);
express.put("/profile/update", authGuard, fileUpload('image'), updateProfile);
express.put("/profile/change-password", authGuard, changePassword);

// --- Reporting Endpoints ---
express.post("/report", authGuard, createReport);
express.get("/reports/me", authGuard, getUserReports);
express.get("/reports", authGuard, isAdmin, getAllReports);
// admin can update status
express.put("/reports/:id/status", authGuard, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'reviewed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    try {
        const report = await require('../models/reportModel').findByPk(id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        report.status = status;
        await report.save();
        return res.json({ success: true, report });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});
// --- Admin Management Endpoints ---
express.get("/getalluser", authGuard, isAdmin, getAllUser);
express.get("/getusersbyid/:id", authGuard, isAdmin, getUsersById);
express.get("/getactiveusers", authGuard, getActiveUsers);
express.put("/updateuserbyid/:id", authGuard, isAdmin, updateUser);
express.delete("/deleteuserbyid/:id", authGuard, isAdmin, deleteUser);

// (optional) admin can later add endpoints to update report status

module.exports = express;