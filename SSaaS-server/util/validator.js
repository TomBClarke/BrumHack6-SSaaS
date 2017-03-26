function validateText(text, texts) {
  if (!(text === null || text === undefined)) {
    if (!(texts === null || texts === undefined)) {
      throw new Error('Cannot have single text and list of texts :\'(');
    }
    // Check single text
    if (typeof text !== 'string') {
      throw new Error('Text ' + text + ' not \'string\' :\'(');
    }
  } else if (!(texts === null || texts === undefined)) {
    if (!(text === null || text === undefined)) {
      throw new Error('Cannot have single text and list of texts :\'(');
    }
    // Checks list of strings.
    if (texts === []) {
      throw new Error('Texts list is empty :\'(');
    }
    for (var i = 0; i < texts.length; i++) {
      if (typeof texts[i] !== 'string') {
        throw new Error('Text ' + texts[i] + ' not \'string\' :\'(');
      }
    }
  } else {
    throw new Error('No text :\'(');
  }
}

function validateNumber(num) {
  if (isNaN(num)) {
    throw new Error('Number ' + num + ' is \'NaN\' :\'(');
  }
  if (num > 1) {
    throw new Error('Number ' + num + ' is too large :\'(');
  }
  if (num < 0) {
    throw new Error('Number ' + num + ' is too small :\'(');
  }
}

module.exports = {
  validateText: validateText,
  validateNumber: validateNumber
};
