document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  
  document.getElementById('enableBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleBlocker'}, (response) => {
        updateUI();
      });
    });
  });
  
  document.getElementById('disableBtn').addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'toggleBlocker'}, (response) => {
        updateUI();
      });
    });
  });
});

function updateUI() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {action: 'getBlockedCount'}, (response) => {
      document.getElementById('count').textContent = response.count || 0;
      
      // Update button states based on enabled/disabled status
      // (You'd need to track this state)
    });
  });
}
