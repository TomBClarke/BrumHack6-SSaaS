$(function () {
  // Initiate data.
  sendToCurrentTab({ 'action': "HANDSHAKE" });

  chrome.runtime.onMessage.addListener(function (currentSettings) {
    // Display initial values.
    $('#emotion').val(currentSettings.settings.emotion);
    $('#language').val(currentSettings.settings.language);
    $('#social').val(currentSettings.settings.social);

    if (!currentSettings.active) {
      toggleActiveStatusVisually();
    }
  });

  // Toggle active status of extension.
  $('#toggleActive').click(function () {
    toggleActiveStatusVisually();
    sendToCurrentTab({ 'action': 'TOGGLE_ACTIVE' });
  });

  // Save configuration of tones.
  $('#saveSettings').click(function () {
    $('#error').text("");

    var settings = {
      'emotion': parseFloat($('#emotion').val()),
      'language': parseFloat($('#language').val()),
      'social': parseFloat($('#social').val())
    }

    try {
      validateNumber(settings.emotion);
      validateNumber(settings.language);
      validateNumber(settings.social);

      // All validated.
      sendToCurrentTab({ 'action': 'UPDATE_DATA', 'settings': settings });
    } catch (error) {
      // One didn't pass validation.
      $('#error').text(error.message);
    }
  });

  // Validate the number.
  function validateNumber(num) {
    if (isNaN(num)) {
      throw new Error('number ' + num + ' is \'NaN\' :\'(');
    }
    if (num > 1) {
      throw new Error('number ' + num + ' is too large :\'(');
    }
    if (num < 0) {
      throw new Error('number ' + num + ' is too small :\'(');
    }
  }

  // Active/disable fields.
  function toggleActiveStatusVisually() {
    if ($('#toggleActive').text() == 'Turn Off') {
      $('#toggleActive').text('Turn On');
      $('#emotion').prop('disabled', true);
      $('#language').prop('disabled', true);
      $('#social').prop('disabled', true);
      $('#saveSettings').prop('disabled', true);
    } else {
      $('#toggleActive').text('Turn Off');
      $('#emotion').prop('disabled', false);
      $('#language').prop('disabled', false);
      $('#social').prop('disabled', false);
      $('#saveSettings').prop('disabled', false);
    }
  }

  // Send data to background script.
  function sendToCurrentTab(data) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, data);
    });
  }
});