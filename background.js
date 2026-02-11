// Handle declarative net request rules for URL blocking
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: 1,
        priority: 1,
        action: { type: 'block' },
        condition: { 
          urlFilter: '*://*/ads/*',
          resourceTypes: ['script', 'image', 'xmlhttprequest']
        }
      }
    ]
  });
});

// Maintain blocked count per tab
const blockedCounts = new Map();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBlockedCount') {
    const tabId = sender.tab.id;
    blockedCounts.set(tabId, request.count);
  } else if (request.action === 'getBlockedCount') {
    const tabId = sender.tab.id;
    sendResponse({ count: blockedCounts.get(tabId) || 0 });
  }
});
