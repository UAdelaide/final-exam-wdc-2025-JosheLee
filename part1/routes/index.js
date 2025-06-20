var express = require('express');
var router = express.Router();
var db = require('../db');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Return a list of all dogs with their size and owner's username
router.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        d.name      AS dog_name,
        d.size      AS size,
        u.username  AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);

    return res.json(rows);
  } catch (err) {
    console.error('/api/dogs error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Return all open walk requests
// including the dog name, requested time, location, and owner's username
router.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await db.query()
  } catch (err) {
    return res.status(500).json
  }
});

module.exports = router;
