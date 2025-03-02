// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const urlList = document.getElementById('urlList');
    const countDisplay = document.getElementById('count');
    const exportButton = document.getElementById('exportUrls');
    const clearButton = document.getElementById('clearUrls');
    
    // Load and display saved URLs
    function loadUrls() {
        chrome.runtime.sendMessage({ type: 'GET_URLS' }, (response) => {
            if (!response || !response.urls) {
                return;
            }

            const urls = response.urls;
            countDisplay.textContent = `${urls.length} saved`;
            
            if (urls.length === 0) {
                urlList.innerHTML = `
                    <div class="empty-state">
                        No bookmarked images yet. Hover over Midjourney images to save them.
                    </div>
                `;
                return;
            }
            
            urlList.innerHTML = urls.map(({ url, timestamp }) => {
                // Standardize the URL before displaying
                const standardizedUrl = standardizeMidjourneyUrl(url);
                return `
                    <div class="url-item">
                        <img src="${standardizedUrl}" alt="thumbnail" class="thumbnail">
                        <div class="url-text">${standardizedUrl}</div>
                        <button class="remove-url" data-url="${standardizedUrl}">×</button>
                    </div>
                `;
            }).join('');
        });
    }
    
    // Handle URL removal
    urlList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-url')) {
            const url = e.target.dataset.url;
            // URL is already standardized in the dataset
            chrome.runtime.sendMessage({
                type: 'REMOVE_URL',
                url: url
            }, (response) => {
                if (response && response.success) {
                    loadUrls();
                }
            });
        }
    });
    
    // Handle export
    exportButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({
            type: 'EXPORT_URLS'
        }, (response) => {
            console.log('Export response:', response);
            if (!response || !response.success) {
                console.error('Export failed:', response?.error);
            }
        });
    });
    
    // Handle clear all
    clearButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all bookmarked URLs? This cannot be undone.')) {
            chrome.runtime.sendMessage({
                type: 'CLEAR_URLS'
            }, (response) => {
                if (response && response.success) {
                    loadUrls();
                }
            });
        }
    });
    
    // Initial load
    loadUrls();
});