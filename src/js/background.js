// background.js

// Include shared.js in service worker context
// Since importScripts is only available in service workers
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

            // Add new URL with timestamp
            savedUrls.add(standardizedUrl);
            
            // Save to storage
            chrome.storage.local.set({ 
                savedUrls: Array.from(savedUrls)
            }, () => {
                sendResponse({ success: true });
                // Notify content scripts about the update
                chrome.tabs.query({active: true}, (tabs) => {
                    tabs.forEach(tab => {
                        chrome.tabs.sendMessage(tab.id, { type: 'URLS_UPDATED' })
                            .catch(err => console.log('Tab not ready for message:', err));
                    });
                });
            });
            return true;

        case 'GET_URLS':
            sendResponse({ 
                urls: Array.from(savedUrls).map(url => ({
                    url,
                    timestamp: Date.now() // You might want to store timestamps with URLs
                }))
            });
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
                            .catch(err => console.log('Tab not ready for message:', err));
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
                            .catch(err => console.log('Tab not ready for message:', err));
                    });
                });
            });
            return true;

        case 'EXPORT_URLS':
            console.log('Export requested. Current URLs:', savedUrls);
            const urlList = Array.from(savedUrls).join('\n');
            console.log('URL list created:', urlList);
            
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
                    console.log('Download started with ID:', downloadId);
                    sendResponse({ success: true });
                }
            });
            return true;
    }
});