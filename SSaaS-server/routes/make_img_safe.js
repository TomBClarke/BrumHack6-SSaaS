const express = require('express'),
  safeChecker = require('./../util/safe_checker.js'),
  urls = require('./../util/kitten_urls.js'),
  router = express.Router(),
  validator = require('./../util/validator.js'),
  watson = require('watson-developer-cloud'),
  VISUAL_RECOGNITION = watson.visual_recognition({
    api_key: '30d25667f0b283d385d681257f985121408ad48f',
    version: 'v3',
    version_date: '2016-05-20'
  }),
  TONE_ANALYZER = watson.tone_analyzer({
    username: '064c7f8c-2cf0-4baa-b516-e129531ee4a9',
    password: 'b5Q8knyNjMcw',
    version: 'v3',
    version_date: '2016-05-19'
  }),
  DEFAULT_THRESHOLDS = {
    'emotion': 0.6,
    'language': 0.6,
    'social': 0.6
  };

function validateUserInput(req) {
  // Check the url.
  validator.validateText(req.body.url, req.body['urls[]']);
  // Check the numbers.
  var emotion = req.body.emotion;
  var language = req.body.language;
  var social = req.body.social;
  
  if (!(emotion === undefined || emotion === null)) {
    validator.validateNumber(emotion);
  }
  if (!(language === undefined || language === null)) {
    validator.validateNumber(language);
  }
  if (!(social === undefined || social === null)) {
    validator.validateNumber(social);
  }
}

function processSentences(sentenceTones, settings) {
  // Check each sentence.
  for (var i = 0; i < sentenceTones.length; i++) {
    if (!processSentence(sentenceTones[i].tone_categories, settings)) {
      return false;
    }
  }
  return true;
}

function processSentence(categories, settings) {
  return safeChecker.isSafe(categories, settings);
}

/* POST make img safe */
router.post('/', function (req, res, next) {
  validateUserInput(req);
  var userURLs = req.body['urls[]'];

  var emotion = req.body.emotion;
  var language = req.body.language;
  var social = req.body.social;

  if (emotion === undefined || emotion === null) {
    emotion = DEFAULT_THRESHOLDS.emotion;
  }
  if (language === undefined || language === null) {
    language = DEFAULT_THRESHOLDS.language;
  }
  if (social === undefined || social === null) {
    social = DEFAULT_THRESHOLDS.social;
  }

  var settings = { 'emotion': emotion, 'language': language, 'social': social };

  if (userURLs === undefined || userURLs === null || userURLs === []) {
    userURLs = [req.body.url];
  }

  var numOfURLs = userURLs.length;
  var processed = 0;
  
  userURLs.forEach(function (userURL, index) {
    if (!/(\.(png)|(jpe?g))(($)|(\?)|(#))/i.test(userURL)) {
      processed++;
      if (processed === numOfURLs) {
        // All processed.
        res.send({ urls: userURLs });
      }
      return;
    }
    
    var params = {
      url: userURL
    };

    VISUAL_RECOGNITION.classify(params, function (err, rec) {
      if (err) {
        next(err);
      } else {
        var image = rec.images[0];
        if (image.error) {
          err = new Error(image.error.description);
          err.status = 400;
          next(err);
          return;
        }
        var tags = image.classifiers[0].classes.map(function (ele) { return ele.class; }).join('. ');
        TONE_ANALYZER.tone({ text: tags }, function (err, tone) {
          if (err) {
            next(err);
          } else {
            var safe;
            if (tone.sentences_tone) {
              // Multiple sentences.
              safe = processSentences(tone.sentences_tone, settings);
            } else {
              // Single sentence.
              safe = processSentence(tone.document_tone.tone_categories, settings);
            }
            if (!safe) {
              userURLs[index] = urls.getURL();
            }
            
            processed++;
            if (processed === numOfURLs) {
              // All processed.
              res.send({ urls: userURLs });
            }
          }
        });
      }
    });
  });
});

module.exports = router;
