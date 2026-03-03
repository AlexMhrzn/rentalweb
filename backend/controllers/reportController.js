const Report = require('../models/reportModel');
const User = require('../models/userModel');

// Create a new report from a user
const createReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { subject, message } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ success: false, message: 'Subject and message are required' });
        }
        const report = await Report.create({ userId, subject, message });
        return res.status(201).json({ success: true, report, message: 'Report submitted' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error creating report', error: error.message });
    }
};

// Get reports submitted by the authenticated user
const getUserReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const reports = await Report.findAll({ where: { userId }, order: [['createdAt','DESC']] });
        return res.json({ success: true, reports });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching reports', error: error.message });
    }
};

// Admin: get all reports
const getAllReports = async (req, res) => {
    try {
        const reports = await Report.findAll({
            order: [['createdAt','DESC']],
            include: [{ model: User, as: 'reporter', attributes: ['id', 'username', 'email'] }]
        });
        return res.json({ success: true, reports });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching reports', error: error.message });
    }
};

module.exports = { createReport, getUserReports, getAllReports };
