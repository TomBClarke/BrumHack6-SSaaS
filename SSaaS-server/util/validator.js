function validateText(text) {
  if (text === null || text === undefined) {
    throw new Error('No text :\'(');
  }
  if (typeof text !== 'string') {
    throw new Error('Text ' + text + ' not \'string\' :\'(');
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
