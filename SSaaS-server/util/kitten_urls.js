const fs = require('fs'),
  urls = fs.readFileSync('util/kitten_urls.txt').toString().split('\n').filter(function (ele) { return /^[^#].*$/.test(ele); });

module.exports = {
  
  urls: urls,
  
  getURL: function () {
    return urls[Math.floor(Math.random() * urls.length)];
  }
  
};
