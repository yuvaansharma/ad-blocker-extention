// Predefined ad selectors and patterns
const AD_SELECTORS = [
  '[data-ad]', '[data-ads]', '[data-adunit]',
  '.ad-container', '.advertisement', '.adsense',
  '.google-ads', '.taboola', '.outbrain',
  '.promoted', '.sponsored', '.native-ad',
  '#ad-wrapper', '#advertisement', '.ad-slot',
  '[id*="ad"]', '[class*="ad-"]', '[class*="ads"]',
  '.gpt-ad', '.doubleclick', '.dfp-ad'
];

const AD_URL_PATTERNS = [
  '*://*/ads/*',
  '*://*/advertisement/*',
  '*://*/pubads.*',
  '*://*/gpt.js*',
  '*://*/taboola/*',
  '*://*/doubleclick/*',
  '*://*/googlesyndication.com/*'
];

// Custom filter management
class FilterManager {
  constructor() {
    this.customFilters = [];
    this.enabled = true;
  }

  async initialize() {
    const saved = await chrome.storage.local.get(['customFilters', 'isEnabled']);
    this.customFilters = saved.customFilters || [];
    this.enabled = saved.isEnabled !== false;
  }

  addCustomFilter(filter) {
    if (!this.customFilters.includes(filter)) {
      this.customFilters.push(filter);
      this.saveFilters();
    }
  }

  removeCustomFilter(filter) {
    this.customFilters = this.customFilters.filter(f => f !== filter);
    this.saveFilters();
  }

  saveFilters() {
    chrome.storage.local.set({ customFilters: this.customFilters });
  }

  getAllSelectors() {
    return [...AD_SELECTORS, ...this.customFilters];
  }

  isAdUrl(url) {
    return AD_URL_PATTERNS.some(pattern => {
      const regexPattern = pattern.replace(/\*/g, '.*');
      return new RegExp(regexPattern).test(url);
    });
  }
}

const filterManager = new FilterManager();
