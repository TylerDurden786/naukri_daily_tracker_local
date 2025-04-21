
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "openDetails") {
    chrome.windows.create({
      url: chrome.runtime.getURL("details.html"),
      type: "popup",
      width: 600,
      height: 600
    });
  }
});
