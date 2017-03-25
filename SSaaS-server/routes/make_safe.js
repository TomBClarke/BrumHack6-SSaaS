var express = require('express');
var router = express.Router();

/* POST make safe */
router.get('/', function(req, res, next) {
  res.status(401).send({'hi': 'there'});
});

module.exports = router;
