const fs = require('fs'),
  facts = fs.readFileSync('util/kitten_facts.txt').toString().split('\n').sort(function(ele1, ele2) {
  return ele1.length - ele2.length;
});

module.exports = {
  
  facts: facts,
  
  getFact: function (length) {
    var acceptableDiff = 10;
    do {
      var filtered = facts.filter(function (fact) {
        return fact.length < length + acceptableDiff && fact.length > length - acceptableDiff;
      });
      acceptableDiff += 5;
    } while (filtered.length === 0);
    return filtered[Math.floor(Math.random() * filtered.length)];
  }
  
};
