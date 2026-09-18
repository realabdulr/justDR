document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load existing API key
  chrome.storage.local.get(['ahrefsApiKey'], (result) => {
    if (result.ahrefsApiKey) {
      apiKeyInput.value = result.ahrefsApiKey;
    }
  });

  saveBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    
    if (!key) {
      showStatus('Please enter an API key.', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Testing...';
    hideStatus();

    try {
      // Test the API key
      const response = await fetch('https://api.ahrefs.com/v3/public/domain-rating-free?target=ahrefs.com', {
        headers: {
          'Authorization': `Bearer ${key}`
        }
      });

      if (response.ok) {
        // Save if successful
        chrome.storage.local.set({ ahrefsApiKey: key }, () => {
          showStatus('API key valid and saved!', 'success');
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || response.statusText || 'Invalid API key';
        showStatus(`Error: ${errorMsg}`, 'error');
      }
    } catch (error) {
      showStatus(`Connection error: ${error.message}`, 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save API Key';
    }
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = type;
    statusDiv.style.display = 'block';
  }

  function hideStatus() {
    statusDiv.style.display = 'none';
  }
});
