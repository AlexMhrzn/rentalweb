const express = require('express').Router();
const authGuard = require('../helpers/authguagrd');
const { sendMessage, getConversations, getConversationWith } = require('../controllers/messageController');

express.post('/', authGuard, sendMessage);
express.get('/conversations', authGuard, getConversations);
express.get('/with/:userId', authGuard, getConversationWith);

module.exports = express;
