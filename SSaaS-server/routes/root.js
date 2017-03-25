const express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use('/makeSafe', require('./make_safe.js'));

module.exports = router;
