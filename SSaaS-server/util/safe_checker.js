const CATEGORY_NAMES = {
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

function isSafe(categories, settings) {
  // Check each category.
  for (var i = 0; i < categories.length; i++) {
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
    
    if (checkCategory(category.tones, badWords, threshold)) {
      // We should swap the line, don't bother checking other fields.
      return false;
    }
  }
  return true;
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

module.exports = {
  isSafe: isSafe
};
