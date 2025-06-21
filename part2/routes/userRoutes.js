const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login (dummy version)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(
      `SELECT user_id, username, role
         FROM Users
        WHERE username = ?
          AND password_hash = ?`,
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // session setup
    req.session.user = {
      id: rows[0].user_id,
      username: rows[0].username,
      role: rows[0].role
    };

    res.json({ message: 'Login successful', user: req.session.user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST logout
router.post('/logout', function (req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ logout: false, error: 'Logout failed' });
    }
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: true,
    });
    res.json({ logout: true });
  });
});

// GET get owner's dogs
router.get('/dogs', async (req, res) => {
  try {
    const owner_id = req.session.user.id;
    const [rows] = await db.query(`
    SELECT dog_id, name
    FROM Dogs
    WHERE owner_id = ?`,
      [owner_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'couldnt load dogs' });
  }
});

// Return a list of all dogs with their size and owner's username
router.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        d.dog_id AS dog_id
        d.name AS dog_name,
        d.size AS size,
        u.username AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);

    return res.json(rows);
  } catch (err) {
    console.error('/api/dogs error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;