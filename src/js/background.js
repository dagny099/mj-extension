// background.js - Revised for consistency and reliability

// Include shared.js in service worker context
try {
    importScripts('shared.js');
} catch (e) {
    console.error('Error importing shared.js:', e);
}

// Store URLs in memory
let savedUrls = new Set();

// Load saved URLs from storage
chrome.storage.local.get(['savedUrls'], (result) => {
    if (result.savedUrls) {
        savedUrls = new Set(result.savedUrls);
    }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'SAVE_URL':
            // Standardize the URL before checking or saving
            const standardizedUrl = standardizeMidjourneyUrl(message.url);
            
            // Check if URL already exists
            if (savedUrls.has(standardizedUrl)) {
                sendResponse({ success: false, message: 'URL already saved' });
                return true;
            }

            // Add new URL 
            savedUrls.add(standardizedUrl);
            
            // Save to storage - store as array of strings for simplicity
            chrome.storage.local.set({ 
                savedUrls: Array.from(savedUrls)
            }, () => {
                sendResponse({ success: true });
                // Notify content scripts about the update
                chrome.tabs.query({active: true}, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.sendMessage(tab.id, { type: 'URLS_UPDATED' })
                            .catch(err => {/* Ignore errors for inactive tabs */});
                    });
                });
            });
            return true;

        case 'GET_URLS':
            // Send back just the array of URL strings
            sendResponse({ urls: Array.from(savedUrls) });
            return true;
        
        case 'REMOVE_URL':
            // Standardize the URL before removing
            const urlToRemove = standardizeMidjourneyUrl(message.url);
            savedUrls.delete(urlToRemove);
            
            chrome.storage.local.set({ 
                savedUrls: Array.from(savedUrls) 
            }, () => {
                sendResponse({ success: true });
                // Notify content scripts about the update
                chrome.tabs.query({active: true}, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.sendMessage(tab.id, { type: 'URLS_UPDATED' })
                            .catch(err => {/* Ignore errors for inactive tabs */});
                    });
                });
            });
            return true;
            
        case 'CLEAR_URLS':
            // Clear all URLs from memory and storage
            savedUrls.clear();
            chrome.storage.local.set({ savedUrls: [] }, () => {
                sendResponse({ success: true });
                // Notify content scripts about the update
                chrome.tabs.query({active: true}, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.sendMessage(tab.id, { type: 'URLS_UPDATED' })
                            .catch(err => {/* Ignore errors for inactive tabs */});
                    });
                });
            });
            return true;

        case 'EXPORT_URLS':
            const urlList = Array.from(savedUrls).join('\n');
            
            // Create a timestamp in YYYY-MM-DD-HHMM format
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
            const filename = `midjourney-bookmarks-${timestamp}.txt`;
            
            // Use data URL instead of Blob URL
            const dataUrl = 'data:text/plain;charset=utf-8,' + encodeURIComponent(urlList);
            
            chrome.downloads.download({
                url: dataUrl,
                filename: filename,
                saveAs: false  // Don't show Save As dialog, save directly to Downloads
            }, (downloadId) => {
                if (chrome.runtime.lastError) {
                    console.error('Download error:', chrome.runtime.lastError);
                    sendResponse({ success: false, error: chrome.runtime.lastError });
                } else {
                    sendResponse({ success: true });
                }
            });
            return true;
    }
});