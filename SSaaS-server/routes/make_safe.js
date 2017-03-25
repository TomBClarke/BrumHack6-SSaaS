const express = require('express'),
  facts = require('./../util/kitten_facts.js'),
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
  },
  CATEGORY_NAMES = {
    'emotion': 'emotion_tone',
    'language': 'language_tone',
    'social': 'social_tone'
  },
  BAD_EMOTION = [
    'anger',
    'sadness',
    'disgust',
    'fear'
  ],
  BAD_LANGUAGE = [
    'tentative'
  ],
  BAD_SOCIAL = [];

function validateText(text) {
  if (text === null || text === undefined) {
    throw new Error('No text :\'(');
  }
  if (typeof text !== 'string') {
    throw new Error('text not \'string\' :\'(');
  }
}

function validateNumber(num) {
  var num = parseInt(numberList[i]);
  if (isNan(num)) {
    throw new Error('number' + num + ' is \'NaN\' :\'(');
  }
  if (num > 1) {
    throw new Error('number' + num + ' is too large :\'(');
  }
  if (num < 0) {
    throw new Error('number' + num + ' is too small :\'(');
  }
}

function validateUserInput(req) {
  // Check the text.
  validateText(req.body.text);
  // Check the numbers.
  var emotion = req.body.emotion;
  var language = req.body.language;
  var social = req.body.social;

  if (!(emotion === undefined || emotion === null)) {
    validateNumber(emotion);
  }
  if (!(language === undefined || language === null)) {
    validateNumber(language);
  }
  if (!(social === undefined || social === null)) {
    validateNumber(social);
  }
}

function processSentences(userText, sentenceTones, settings) {
  // Check each sentence.
  for (var i = 0; i < sentenceTones.length; i++) {
    var sentenceTone = sentenceTones[i];
    processSentence(userText, sentenceTone.tone_categories, sentenceTone.input_from, sentenceTone.input_to, settings);
  }
}

function processSentence(userText, categories, from, to, settings) {
  var shouldSwap = false;
  // Check each category.
  for (var i = 0; i < categories; i++) {
    var category = categories[i];
    var badWords;
    var threshold;
    switch (category.category_id) {
      case CATEGORY_NAMES.emotion:
        badWords = BAD_EMOTION;
        threshold = settings.emotion;
        break;
      case CATEGORY_NAMES.language:
        badWords = BAD_LANGUAGE;
        threshold = settings.language;
        break;
      case CATEGORY_NAMES.social:
        badWords = BAD_SOCIAL;
        threshold = settings.social;
        break;
      default:
        throw new Error('category not recognised :\'(');
    }

    shouldSwap = checkCategory(category.tones, badWords, threshold);

    if (shouldSwap) {
      // We should swap the line, don't bother checking other fields.
      break;
    }
  }

  if (shouldSwap) {
    // Swap sentence.
    userText = userText.substr(0, from) + facts.getFact(to - from) + userText.substr(to, userText.length - 1);
  }
}

function checkCategory(tones, badWords, threshold) {
  for (var i = 0; i < tones.length; i++) {
    var tone = tones[i];
    // See if the tone is in the bad words list.
    if (badWords.indexOf(tone.tone_id) > -1) {
      // See if it beats the threshold.
      if (tone.score > threshold) {
        // A strong bad tone.
        return true;
      }
    }
  }
  return false;
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
        processSentences(userText, tone.sentences_tone, settings);
      } else {
        // Single sentence.
        processSentence(userText, tone.document_tone.tone_categories, 0, userText.length - 1, settings);
      }
      res.send(JSON.stringify(tone));
    }
  });
});

module.exports = router;
