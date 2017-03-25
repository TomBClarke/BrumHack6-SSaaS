const express = require('express'),
  router = express.Router(),
  watson = require('watson-developer-cloud'),
  tone_analyzer = watson.tone_analyzer({
    username: '064c7f8c-2cf0-4baa-b516-e129531ee4a9',
    password: 'b5Q8knyNjMcw',
    version: 'v3',
    version_date: '2016-05-19'
  });

function validateText(text) {
  if (text === null || text === undefined) {
    throw new Error('No text :\'(');
  }
  if (typeof text !== 'string') {
    throw new Error('text not \'string\' :\'(');
  }
}

function validateUserInput(req) {
  validateText(req.body.text);
}

/* POST make safe */

router.post('/', function(req, res, next) {
  validateUserInput(req);
  tone_analyzer.tone({ text: req.body.text },
    function(err, tone) {
      if (err)
        next(err);
      else
        res.send(JSON.stringify(tone, null, 2));
    });
});

module.exports = router;
