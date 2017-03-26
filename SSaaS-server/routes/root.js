const express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.use('/makesafe', require('./make_safe.js'));
router.use('/makeimgsafe', require('./make_img_safe.js'));

module.exports = router;
