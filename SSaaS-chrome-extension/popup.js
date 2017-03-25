document.getElementById('submitButton').onclick = function() {
	var settings = document.getElementById("settings").value;
  sendToCurrentTab({
    settings: {
      emotion: 0.6,
      language: 0.6,
      social: 0.6
    }
  });
};

document.getElementById('toggleActive').onclick = function() {
  sendToCurrentTab({ activeToggle: true });
};

function sendToCurrentTab(data) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, data);
    });
}
