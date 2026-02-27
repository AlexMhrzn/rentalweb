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

// POST /api/conversation/start
router.post('/start', authGuard, async (req, res) => {
  try {
    const { property_id, owner_id } = req.body;
    const user_id = req.user.id;
    if (!owner_id || !property_id) return res.status(400).json({ success: false, message: 'owner_id and property_id required' });

    const client = await pool.connect();
    try {
      // check existing
      const findRes = await client.query(
        'SELECT * FROM conversations WHERE property_id=$1 AND owner_id=$2 AND user_id=$3 LIMIT 1',
        [property_id, owner_id, user_id]
      );
      if (findRes.rows.length) return res.json({ success: true, conversation: findRes.rows[0] });

      const insertRes = await client.query(
        'INSERT INTO conversations (property_id, owner_id, user_id) VALUES ($1,$2,$3) RETURNING *',
        [property_id, owner_id, user_id]
      );
      return res.status(201).json({ success: true, conversation: insertRes.rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/conversation/user
router.get('/user', authGuard, async (req, res) => {
  try {
    const user_id = req.user.id;
    const client = await pool.connect();
    try {
      const q = `
        SELECT c.*, m.message_text as last_message, m.created_at as last_message_at
        FROM conversations c
        LEFT JOIN LATERAL (
          SELECT message_text, created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
        ) m ON true
        WHERE c.user_id = $1
        ORDER BY m.created_at DESC NULLS LAST, c.created_at DESC
      `;
      const r = await client.query(q, [user_id]);
      return res.json({ success: true, conversations: r.rows });
    } finally { client.release(); }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/conversation/owner
router.get('/owner', authGuard, async (req, res) => {
  try {
    const owner_id = req.user.id;
    const client = await pool.connect();
    try {
      const q = `
        SELECT c.*, m.message_text as last_message, m.created_at as last_message_at
        FROM conversations c
        LEFT JOIN LATERAL (
          SELECT message_text, created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
        ) m ON true
        WHERE c.owner_id = $1
        ORDER BY m.created_at DESC NULLS LAST, c.created_at DESC
      `;
      const r = await client.query(q, [owner_id]);
      return res.json({ success: true, conversations: r.rows });
    } finally { client.release(); }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
