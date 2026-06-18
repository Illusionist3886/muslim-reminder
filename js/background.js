// Clicking the toolbar icon opens a new tab, which the newtab override
// renders as the prayer/dhikr dashboard.
chrome.action.onClicked.addListener(function () {
  chrome.tabs.create({});
});
