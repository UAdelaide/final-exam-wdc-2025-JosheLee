var mysql2 = require('mysql2/promise');

var pool = mysql2.createPool({
    host: 'localhost',
    /* if local host doesnt work
    socketPath: '/var/run/mysqld/mysqld.sock',
    host: '127.0.0.1', */
    /* user: 'root', (or your user)
    password: 'your_password', */
    database: 'pracExam'
});

module.exports = pool;