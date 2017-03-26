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
  currentSettings.active = value.active;
  currentSettings.settings = value.settings;

  // Initial check.
  if (currentSettings.active) {
    updatePageText();
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
    if (node.nodeType == 3) {
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

// Check the page and updates the page's TEXT.
function updatePageText() {
  $(textNodesUnder(document.body)).each(function (index, element) {
    processSentences(element);
  });
}