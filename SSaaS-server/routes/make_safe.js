const express = require('express'),
  facts = require('./../util/kitten_facts.js'),
  safeChecker = require('./../util/safe_checker.js'),
  validator = require('./../util/validator.js'),
  router = express.Router(),
  watson = require('watson-developer-cloud'),
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
  // Check the text.
  validator.validateText(req.body.text);
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

function processSentences(userText, sentenceTones, settings) {
  // Check each sentence.
  for (var i = 0; i < sentenceTones.length; i++) {
    var sentenceTone = sentenceTones[i];
    userText = processSentence(userText, sentenceTone.tone_categories, sentenceTone.text, settings);
  }
  return userText;
}

function processSentence(userText, categories, oldText, settings) {
  if (safeChecker.isSafe(categories, settings)) {
    return userText;
  } else {
    // Swap sentence.
    return userText.replace(oldText, facts.getFact(oldText.length));
  }
}

/* POST make safe */
router.post('/', function (req, res, next) {
  validateUserInput(req);
  var userText = req.body.text;
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
  TONE_ANALYZER.tone({ text: userText }, function (err, tone) {
    if (err) {
      next(err);
    } else {
      if (tone.sentences_tone) {
        // Multiple sentences.
        userText = processSentences(userText, tone.sentences_tone, settings);
      } else {
        // Single sentence.
        userText = processSentence(userText, tone.document_tone.tone_categories, userText, settings);
      }
      res.send({ text: userText });
    }
  });
});

module.exports = router;
