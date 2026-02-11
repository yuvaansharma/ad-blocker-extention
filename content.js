let blockedCount = 0;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdBlocker);
} else {
  initAdBlocker();
}

function initAdBlocker() {
  if (!filterManager.enabled) return;
  
  // Block existing ads on page load
  blockExistingAds();
  
  // Monitor for dynamically added ads
  observeDOMChanges();
  
  // Block requests for ad resources
  interceptAdRequests();
  
  // Update UI with blocked count
  updateBlockedCountUI();
}

function blockExistingAds() {
  const selectors = filterManager.getAllSelectors();
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element && element.parentNode) {
          element.style.display = 'none';
          element.classList.add('blocked-ad');
          blockedCount++;
        }
      });
    } catch (e) {
      console.log(`Invalid selector: ${selector}`);
    }
  });
}

function observeDOMChanges() {
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node matches ad selectors
            checkAndBlockElement(node);
            
            // Check children of added nodes
            const descendants = node.querySelectorAll(
              filterManager.getAllSelectors().join(', ')
            );
            descendants.forEach(descendant => {
              descendant.style.display = 'none';
              descendant.classList.add('blocked-ad');
              blockedCount++;
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function checkAndBlockElement(element) {
  const selectors = filterManager.getAllSelectors();
  selectors.forEach(selector => {
    try {
      if (element.matches && element.matches(selector)) {
        element.style.display = 'none';
        element.classList.add('blocked-ad');
        blockedCount++;
      }
    } catch (e) {
      // Ignore invalid selectors
    }
  });
}

function interceptAdRequests() {
  // Note: For Manifest V3, request interception happens in service worker
  // But we can still do client-side checks
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0] instanceof Request ? args[0].url : args[0];
    if (filterManager.isAdUrl(url)) {
      blockedCount++;
      updateBlockedCountUI();
      return Promise.resolve(new Response('', { status: 204 }));
    }
    return originalFetch.apply(this, args);
  };
}

function updateBlockedCountUI() {
  // Send count to popup
  chrome.runtime.sendMessage({
    action: 'updateBlockedCount',
    count: blockedCount
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getBlockedCount') {
    sendResponse({ count: blockedCount });
  } else if (request.action === 'toggleBlocker') {
    filterManager.enabled = !filterManager.enabled;
    chrome.storage.local.set({ isEnabled: filterManager.enabled });
    
    if (filterManager.enabled) {
      // Re-enable blocking
      blockExistingAds();
    } else {
      // Show blocked elements again
      document.querySelectorAll('.blocked-ad').forEach(el => {
        el.style.display = '';
        el.classList.remove('blocked-ad');
      });
    }
    sendResponse({ enabled: filterManager.enabled });
  }
});

// Initialize filter manager
filterManager.initialize();
