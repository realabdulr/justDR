function getDomain(url) {
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) return null;
    return urlObj.hostname;
  } catch (e) {
    return null;
  }
}

function processResults() {
  // Find all links that look like search results (have href and ping)
  const resultLinks = document.querySelectorAll('a[href][ping]');
  
  resultLinks.forEach(link => {
    // Avoid double processing
    if (link.dataset.onlydrProcessed) return;
    link.dataset.onlydrProcessed = 'true';

    // Main web results typically have an h3 title
    const h3 = link.querySelector('h3');
    if (!h3) return; 

    const domain = getDomain(link.href);
    if (!domain) return;

    // Create the badge element
    const badge = document.createElement('span');
    badge.className = 'onlydr-badge onlydr-loading';
    badge.textContent = 'DR: ...';
    
    // We can append it directly to the h3 element so it shows at the end of the title
    h3.appendChild(badge);

    // Fetch the DR from the background script
    chrome.runtime.sendMessage({ action: 'getDR', domain: domain }, (response) => {
      // If there's an error (e.g. extension context invalidated, no API key, API error)
      if (chrome.runtime.lastError || !response || response.dr === null) {
        badge.classList.remove('onlydr-loading');
        badge.classList.add('onlydr-error');
        badge.textContent = 'DR: ?';
        if (response && response.error) {
           badge.title = response.error; // Show error on hover
        } else {
           badge.title = "Could not fetch Domain Rating";
        }
      } else {
        // Success
        badge.classList.remove('onlydr-loading');
        badge.classList.add('onlydr-success');
        badge.textContent = `DR: ${response.dr}`;
        badge.title = `Domain Rating for ${domain}`;
      }
    });
  });
}

// Initial run
processResults();

// Observe DOM for infinite scrolling/dynamic loading
let debounceTimer;
const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0) {
      shouldProcess = true;
      break;
    }
  }
  if (shouldProcess) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      processResults();
    }, 200);
  }
});

observer.observe(document.body, { childList: true, subtree: true });
