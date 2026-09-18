const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function getApiKey() {
  const result = await chrome.storage.local.get('ahrefsApiKey');
  return result.ahrefsApiKey;
}

function getDomain(url) {
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) return null;
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

const ongoingFetches = new Map();

async function fetchDR(domain, apiKey) {
  const cacheKey = `dr_cache_${domain}`;
  const result = await chrome.storage.local.get(cacheKey);
  const cachedData = result[cacheKey];

  if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION_MS)) {
    return cachedData.dr;
  }

  if (ongoingFetches.has(domain)) {
    return ongoingFetches.get(domain);
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(`https://api.ahrefs.com/v3/public/domain-rating-free?target=${encodeURIComponent(domain)}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // The API returns nested domain_rating object based on openapi schema
        const drValue = data.domain_rating && data.domain_rating.domain_rating !== undefined 
          ? data.domain_rating.domain_rating 
          : null;
          
        if (drValue !== null) {
          const dr = Math.round(drValue);
          await chrome.storage.local.set({
            [cacheKey]: {
              dr: dr,
              timestamp: Date.now()
            }
          });
          return dr;
        }
      }
      return null;
    } catch (e) {
      console.error('Error fetching DR:', e);
      return null;
    } finally {
      ongoingFetches.delete(domain);
    }
  })();

  ongoingFetches.set(domain, fetchPromise);
  return fetchPromise;
}

function createIconImageData(text, bgColor = '#8b5cf6') {
  const size = 32;
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Clear canvas
  ctx.clearRect(0, 0, size, size);

  // Draw rounded rectangle
  const radius = 6;
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();

  // Draw text
  ctx.fillStyle = '#ffffff';
  // Adjust font size based on text length (e.g., "100" vs "99")
  const fontSize = text.length > 2 ? 16 : 20;
  ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, size / 2, size / 2 + 1); // +1 for visual vertical centering

  return ctx.getImageData(0, 0, size, size);
}

async function updateBadgeForTab(tabId, url) {
  if (!url) return;
  
  const domain = getDomain(url);
  if (!domain) {
    chrome.action.setIcon({ tabId, path: "icon16.png" });
    chrome.action.setTitle({ tabId, title: "OnlyDR" });
    return;
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    chrome.action.setIcon({ 
      tabId, 
      imageData: createIconImageData('!', '#f59e0b') 
    });
    chrome.action.setTitle({ tabId, title: 'API Key missing. Click extension icon to setup.' });
    return;
  }

  const dr = await fetchDR(domain, apiKey);
  
  if (dr !== null) {
    chrome.action.setIcon({ 
      tabId, 
      imageData: createIconImageData(dr.toString(), '#8b5cf6') 
    });
    chrome.action.setTitle({ tabId, title: `Domain Rating: ${dr}` });
  } else {
    chrome.action.setIcon({ 
      tabId, 
      imageData: createIconImageData('?', '#ef4444') 
    });
    chrome.action.setTitle({ tabId, title: 'Error fetching DR. Check your API key or limits.' });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    updateBadgeForTab(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  updateBadgeForTab(activeInfo.tabId, tab.url);
});

chrome.action.onClicked.addListener(async (tab) => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getDR') {
    getApiKey().then(apiKey => {
      if (!apiKey) {
        sendResponse({ dr: null, error: 'No API key' });
        return;
      }
      fetchDR(request.domain, apiKey).then(dr => {
        sendResponse({ dr: dr });
      });
    });
    return true; 
  }
});
