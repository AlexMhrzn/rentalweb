const express = require('express');
const router = express.Router();
const authGuard = require('../helpers/authguagrd');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// POST /api/message/send
router.post('/send', authGuard, async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { conversation_id, message_text } = req.body;
    if (!conversation_id || !message_text) return res.status(400).json({ success: false, message: 'conversation_id and message_text required' });

    const client = await pool.connect();
    try {
      const r = await client.query('INSERT INTO messages (conversation_id, sender_id, message_text) VALUES ($1,$2,$3) RETURNING *', [conversation_id, sender_id, message_text]);
      return res.status(201).json({ success: true, message: r.rows[0] });
    } finally { client.release(); }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/message/:conversationId
router.get('/:conversationId', authGuard, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const client = await pool.connect();
    try {
      const r = await client.query('SELECT * FROM messages WHERE conversation_id=$1 ORDER BY created_at ASC', [conversationId]);
      return res.json({ success: true, messages: r.rows });
    } finally { client.release(); }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
