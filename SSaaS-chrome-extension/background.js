chrome.storage.local.get(["settings"], function (value) {
  console.log(value);
  // TODO - Do something with the settings.
});

chrome.runtime.onMessage.addListener(onMsg);

/**
 * On a message sent from popup.js.
 * @param data
 */
function onMsg(data) {
  if (data.settings) {
    chrome.storage.local.set({"settings": data.settings});
  }
}
