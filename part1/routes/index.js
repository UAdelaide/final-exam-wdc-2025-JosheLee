var express = require('express');
var router = express.Router();
var db = require('../db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Return a list of all dogs with their size and owner's username


module.exports = router;
