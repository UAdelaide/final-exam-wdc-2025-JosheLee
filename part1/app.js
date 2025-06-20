var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const pool = require('./db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

(async () => {
    try {
        const [uRows] = await pool.query(`SELECT COUNT(*) AS count FROM Users`);
        if (uRows[0].count === 0) {
            await pool.query(`
        INSERT INTO Users (username, email, password_hash, role)
        VALUES
          ('alice123',  'alice@example.com',  'hashed123',   'owner'),
          ('bobwalker', 'bobwalker@example.com','hashed456',  'walker'),
          ('carol123',  'carol@example.com',  'hashed789',   'owner'),
          ('josh09',    'Josh@example.com',   'password123','owner'),
          ('ryza24',    'Ryza@example.com',   'password456','walker')
      `);

            await pool.query(`
        INSERT INTO Dogs (owner_id, name, size)
        VALUES
          ((SELECT user_id FROM Users WHERE username='alice123'), 'Max',    'medium'),
          ((SELECT user_id FROM Users WHERE username='carol123'), 'Bella',  'small'),
          ((SELECT user_id FROM Users WHERE username='josh09'),   'Goji',   'small'),
          ((SELECT user_id FROM Users WHERE username='carol123'), 'Willow', 'medium'),
          ((SELECT user_id FROM Users WHERE username='josh09'),   'Sasha',  'large')
      `);

            await pool.query(`
        INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
        VALUES
          ((SELECT dog_id FROM Dogs WHERE name='Max'),    '2025-06-10 08:00:00', 30, 'Parklands',      'open'),
          ((SELECT dog_id FROM Dogs WHERE name='Bella'),  '2025-06-10 09:30:00', 45, 'Beachside Ave',  'accepted'),
          ((SELECT dog_id FROM Dogs WHERE name='Goji'),   '2025-06-11 09:00:00', 30, 'Brighton',       'open'),
          ((SELECT dog_id FROM Dogs WHERE name='Willow'), '2025-06-12 10:30:00', 45, 'Balmoral Ave',   'accepted'),
          ((SELECT dog_id FROM Dogs WHERE name='Sasha'),  '2025-06-10 08:00:00', 30, 'Warradale',      'open')
      `);

            await pool.query(`
        INSERT INTO WalkApplications (request_id, walker_id, status)
        VALUES
          (
            (SELECT request_id FROM WalkRequests WHERE location='Parklands'),
            (SELECT user_id    FROM Users       WHERE username='bobwalker'),
            'accepted'
          ),
          (
            (SELECT request_id FROM WalkRequests WHERE location='Brighton'),
            (SELECT user_id    FROM Users       WHERE username='ryza24'),
            'pending'
          )
      `);

            await pool.query(`
        INSERT INTO WalkRatings (request_id, walker_id, owner_id, rating, comments)
        VALUES
          (
            (SELECT request_id FROM WalkRequests WHERE location='Parklands'),
            (SELECT user_id FROM Users WHERE username='bobwalker'),
            (SELECT user_id FROM Users WHERE username='alice123'),
            5,
            'excellent service'
          )
      `);

            console.log('seed data inserted');
        }
    } catch (err) {
        console.error('error during seeding:', err);
    }
})();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;
