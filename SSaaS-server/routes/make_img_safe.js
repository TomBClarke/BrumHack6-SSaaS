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
  console.log(1);
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
  
  console.log(2);
  userURLs.forEach(function (userURL, index) {
    console.log(3);
    if (!/(\.(png)|(jpe?g))(($)|(\?)|(#))/i.test(userURL)) {
      console.log(4);
      processed++;
      if (processed === numOfURLs) {
        console.log(5);
        // All processed.
        res.send({ urls: userURLs });
      }
      return;
    }
    console.log(6);
    
    var params = {
      url: userURL
    };

    VISUAL_RECOGNITION.classify(params, function (err, rec) {
      console.log(7);
      if (err) {
        console.log(8);
        next(err);
      } else {
        console.log(9);
        var image = rec.images[0];
        if (image.error) {
          console.log(10);
          err = new Error(image.error.description);
          err.status = 400;
          next(err);
          return;
        }
        var tags = image.classifiers[0].classes.map(function (ele) { return ele.class; }).join('. ');
        console.log(11);
        TONE_ANALYZER.tone({ text: tags }, function (err, tone) {
          console.log(12);
          if (err) {
            console.log(13);
            next(err);
          } else {
            console.log(14);
            var safe;
            if (tone.sentences_tone) {
              console.log(15);
              // Multiple sentences.
              safe = processSentences(tone.sentences_tone, settings);
            } else {
              console.log(16);
              // Single sentence.
              safe = processSentence(tone.document_tone.tone_categories, settings);
            }
            console.log(17);
            if (!safe) {
              userURLs[index] = urls.getURL();
            }

            console.log(18);
            processed++;
            if (processed === numOfURLs) {
              console.log(19);
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
