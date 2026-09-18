# OnlyDR - Ahrefs Domain Rating Chrome Extension

OnlyDR is a lightning-fast, minimalist Chrome extension that seamlessly integrates Ahrefs' Free Domain Rating (DR) API into your browsing experience. Whether you're doing SEO research, prospecting, or just casually browsing, OnlyDR puts website authority metrics front and center.

## ✨ Features

- **Toolbar Integration**: Dynamically replaces the extension icon with the Domain Rating of the current website in a clean, highly readable format.
- **Google Search Injection**: Automatically injects a DR badge next to every search result on Google, saving you countless clicks and manual lookups.
- **Lightning Fast & Optimized**: 
  - Implements a strict **7-day local cache** per domain to ensure instant load times on repeated visits.
  - Smart deduplication prevents redundant API calls (e.g., when a domain appears multiple times on a single search results page).
- **Minimalist Options UI**: Clean settings page to quickly manage and validate your Ahrefs API key.
- **Manifest V3**: Built with modern, secure, and performant Manifest V3 standards, utilizing `OffscreenCanvas` for dynamic high-res icon generation.

## 🚀 Installation

Since this extension is open source and not (yet) on the Chrome Web Store, you can install it easily via Developer Mode:

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left corner.
5. Select the folder containing the extension files (the `onlyDR` directory).

## 🔑 Setup (Getting your Free API Key)

OnlyDR uses the official [Ahrefs Free Domain Rating API](https://docs.ahrefs.com/en/api/reference/public/get-domain-rating-free).

1. [Sign up](https://ahrefs.com/) for a free Ahrefs account if you don't have one.
2. Go to your [Ahrefs Account Settings \u2192 API keys](https://app.ahrefs.com/account/api-keys).
3. Generate a new **APIv3 Key** (Requests to this specific endpoint are 100% free!).
4. Right-click the OnlyDR extension icon in your Chrome toolbar and select **Options**.
5. Paste your API key, hit save, and you're good to go!

## 🛠️ Tech Stack

- Chrome Extension Manifest V3
- Vanilla JavaScript (ES6+)
- `chrome.storage.local` for robust caching
- `OffscreenCanvas` for dynamic toolbar icon rendering
- `MutationObserver` for Google Search infinite scroll support

## 📜 License

This project is open-source and available under the [MIT License](LICENSE). 

---

*Note: Use of Ahrefs data is subject to the Domain Rating License at http://ahrefs.com/legal/domain-rating-license. "Domain Rating by Ahrefs" (https://ahrefs.com/).*
