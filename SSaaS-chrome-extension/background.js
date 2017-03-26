var DEFAULTS = {
  'active': true,
  'settings': {
    'emotion': 0.6,
    'language': 0.6,
    'social': 0.6
  }
},
  currentSettings = DEFAULTS,
  SSAAS_URL = 'http://localhost:3000',
  SSAAS_TEXT = 'makesafe',
  SSAAS_IMG = 'makeimgsafe';

// Failure for any issue.
function failure(data) {
  console.log("SSaaS Extension Error");
  console.log(data);
}

// Loads initial data.
chrome.storage.local.get(["active", "settings"], function (value) {
  // Load values.
  if (!(value.active === undefined || value.active === null)) {
    currentSettings.active = value.active;
  }
  if (!(value.settings === undefined || value.settings === null)) {
    currentSettings.settings = value.settings;
  }

  // Initial check.
  if (currentSettings.active) {
    updatePageImages();
    updatePageTexts();
  }
});

chrome.runtime.onMessage.addListener(onMsg);

// Handles a message from popup.js
function onMsg(data) {
  switch (data.action) {
    case "HANDSHAKE":
      chrome.runtime.sendMessage(currentSettings);
      break;
    case "TOGGLE_ACTIVE":
      currentSettings.active = !currentSettings.active;
      saveData();
      break;
    case "UPDATE_DATA":
      currentSettings.settings = data.settings;
      saveData();
      break;
  }
}

// Saves data to chrome storage.
function saveData() {
  chrome.storage.local.set({ "active": currentSettings.active, "settings": currentSettings.settings });
}

// Get list of text nodes.
function textNodesUnder(node) {
  var all = [];
  if (node.tagName === undefined || node.tagName.toLowerCase() === 'script') {
    return all;
  }
  for (node = node.firstChild; node; node = node.nextSibling) {
    // Text fields
    if (node.nodeType === 3) {
      // Only get text node with text.
      if (/[a-zA-Z]/.test($(node).text())) {
        all.push(node);
      }
    } else {
      all = all.concat(textNodesUnder(node));
    }
  }
  return all;
}

// Calls the SSaaS.
function processSentences(element) {
  $.ajax({
    type: 'POST',
    url: SSAAS_URL + '/' + SSAAS_TEXT,
    data: {
      'text': $(element).text(),
      'emotion': currentSettings.settings.emotion,
      'language': currentSettings.settings.language,
      'social': currentSettings.settings.social
    },
    success: function (data) {
      element.nodeValue = data.text;
    },
    failure: failure,
    dataType: 'json'
  });
}

// Calls the SSaaS.
function processImage(element) {
  $.ajax({
    type: 'POST',
    url: SSAAS_URL + '/' + SSAAS_IMG,
    data: {
      'url': $(element).attr('src'),
      'emotion': currentSettings.settings.emotion,
      'language': currentSettings.settings.language,
      'social': currentSettings.settings.social
    },
    success: function (data) {
      $(element).attr('src', data.url);
      $(element).removeAttr('srcset');
    },
    failure: failure,
    dataType: 'json'
  });
}

// Check the page and updates the page's TEXT.
function updatePageText() {
  $(textNodesUnder(document.body)).each(function (index, element) {
    processSentences(element);
  });
}

// Check the page and updates the page's IMAGES.
function updatePageImage() {
  $('img').each(function (index, element) {
    $(element).attr('src', element.src);
    if (/[a-zA-Z]/.test($(element).attr('src'))) {
      processImage(element);
    }
  });
}

// Update texts in 1 request.
function updatePageTexts() {
  var texts = textNodesUnder(document.body);
  $.ajax({
    type: 'POST',
    url: SSAAS_URL + '/' + SSAAS_TEXT,
    data: {
      'texts': texts,
      'emotion': currentSettings.settings.emotion,
      'language': currentSettings.settings.language,
      'social': currentSettings.settings.social
    },
    success: function (data) {
      $.each(data.texts, function (index, value) {
        texts[index].nodeValue = value;
      });
    },
    failure: failure,
    dataType: 'json'
  });
}

// Update imgs in 1 request.
function updatePageImages() {
  var imgSelector = 'img';
  var urls = $(imgSelector);
  $.ajax({
    type: 'POST',
    url: SSAAS_URL + '/' + SSAAS_IMG,
    data: {
      'urls': $(imgSelector).map(function () {
        return $(this).attr("src");
      }).get(),
      'emotion': currentSettings.settings.emotion,
      'language': currentSettings.settings.language,
      'social': currentSettings.settings.social
    },
    success: function (data) {
      $.each(data.urls, function (index, value) {
        $(urls[index]).attr('src', value);
        $(urls[index]).removeAttr('srcset');
      });
    },
    failure: failure,
    dataType: 'json'
  });
}