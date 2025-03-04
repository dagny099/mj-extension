// popup.js - Maintaining all functionality in one file

document.addEventListener('DOMContentLoaded', () => {
    const urlList = document.getElementById('urlList');
    const exportButton = document.getElementById('exportUrls');
    const exportGalleryButton = document.getElementById('exportGallery');
    const clearButton = document.getElementById('clearUrls');
    const versionInfo = document.getElementById('versionInfo');
    const howItWorksLink = document.getElementById('howItWorksLink');

    // Set up feedback form events
    setupFeedbackForm();
    
    // Check for first run or updates
    checkForUpdates();
    
    // Set version number in footer
    const currentVersion = chrome.runtime.getManifest().version;
    versionInfo.textContent = `v${currentVersion} - What's New`;
    
    // Add click handler for version info that shows the what's new dialog
    versionInfo.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent other handlers from firing
        
        // Open the What's New dialog with feedback button
        showWhatsNew(`What's New in v${currentVersion}`, [
            'Bookmark your favorite Midjourney images',
            'Export your collection as a text file',
            'Smart URL standardization to avoid duplicates'
        ], true);
    });

    // Load and display saved URLs
    function loadUrls() {
        chrome.runtime.sendMessage({ type: 'GET_URLS' }, (response) => {
            if (!response || !response.urls) {
                console.error("Failed to get URLs from background script");
                return;
            }

            const urls = response.urls;

            // Update the count display if the element exists
            const countDisplay = document.getElementById('countDisplay');
            if (countDisplay) {
                countDisplay.textContent = `${urls.length} saved`;
            }
            
            
            // Check if we have any bookmarks
            if (urls.length === 0) {
                urlList.innerHTML = `
                    <div class="empty-state">
                        No bookmarked images yet. Hover over Midjourney images to save them.
                    </div>
                `;
                return;
            }
            
            // Generate HTML for each URL
            urlList.innerHTML = urls.map(url => {
                const standardizedUrl = url; // Already standardized in background.js
                return `
                    <div class="url-item">
                        <img src="${standardizedUrl}" alt="thumbnail" class="thumbnail">
                        <div class="url-text">${standardizedUrl}</div>
                        <button class="remove-url" data-url="${standardizedUrl}">×</button>
                    </div>
                `;
            }).join('');

            // Add event listeners to remove buttons
            document.querySelectorAll('.remove-url').forEach(button => {
                button.addEventListener('click', (e) => {
                    const url = e.target.dataset.url;
                    chrome.runtime.sendMessage({
                        type: 'REMOVE_URL',
                        url: url
                    }, (response) => {
                        if (response && response.success) {
                            loadUrls(); // Refresh the list
                        }
                    });
                });
            });
        });
    }
    
    // Handle export button
    exportButton.addEventListener('click', () => {
        chrome.runtime.sendMessage({ type: 'EXPORT_URLS' });
    });

    // Handle gallery export button
    exportGalleryButton.addEventListener('click', exportAsHtmlGallery);

    // Handle How It Works link
    if (howItWorksLink) {
        howItWorksLink.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.windows.create({
                url: chrome.runtime.getURL("instructions.html"),
                type: "popup",
                width: 600,
                height: 500,
                top: Math.floor((screen.height - 500) / 2),
                left: Math.floor((screen.width - 600) / 2)
            });
        });
    }
    
    // Handle clear all button
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
    
    // Keeping all your original supporting functions below
    
    /**
     * Resets the feedback form to its default state
     */
    function resetForm() {
        document.getElementById('feedbackType').value = 'bug';
        document.getElementById('feedbackText').value = '';
        document.getElementById('contactEmail').value = '';
        document.querySelector('.feedback-form').style.display = 'flex';
        document.getElementById('feedbackSuccess').style.display = 'none';
    }

    /**
     * Sets up the feedback form event listeners and functionality
     */
    function setupFeedbackForm() {
        const feedbackModal = document.getElementById('feedbackModal');
        const cancelFeedback = document.getElementById('cancelFeedback');
        const submitFeedback = document.getElementById('submitFeedback');
        const feedbackSuccess = document.getElementById('feedbackSuccess');
        const closeFeedbackSuccess = document.getElementById('closeFeedbackSuccess');
        
        // Close feedback modal
        cancelFeedback.addEventListener('click', () => {
            feedbackModal.style.display = 'none';
            resetForm();
        });

        closeFeedbackSuccess.addEventListener('click', () => {
            feedbackModal.style.display = 'none';
            resetForm();
        });

        // Submit feedback
        submitFeedback.addEventListener('click', () => {
            const feedbackType = document.getElementById('feedbackType').value;
            const feedbackText = document.getElementById('feedbackText').value;
            const contactEmail = document.getElementById('contactEmail').value;
            
            if (!feedbackText.trim()) {
                alert('Please enter your feedback before submitting.');
                return;
            }
            
            // Create feedback object
            const feedback = {
                type: feedbackType,
                text: feedbackText,
                email: contactEmail,
                timestamp: new Date().toISOString(),
                version: chrome.runtime.getManifest().version,
                // Add browser info for debugging
                browser: {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform
                }
            };
            
            // Store feedback in sync storage so you can access it from any device
            chrome.storage.sync.get(['userFeedback'], (result) => {
                const existingFeedback = result.userFeedback || [];
                existingFeedback.push(feedback);
                
                // Limit to last 100 feedback items to avoid storage limits
                if (existingFeedback.length > 100) {
                    existingFeedback.shift(); // Remove oldest
                }
                
                chrome.storage.sync.set({ userFeedback: existingFeedback }, () => {
                    console.log('Feedback saved to sync storage');
                    
                    // Show success message
                    document.querySelector('.feedback-form').style.display = 'none';
                    feedbackSuccess.style.display = 'block';
                });
            });
        });
    }

    /**
     * Shows a modal with version release notes
     * @param {string} title - The title to display (e.g. "What's New in v1.0")
     * @param {string[]} bulletPoints - Array of bullet points to display as release notes
     * @param {boolean} showFeedbackButton - Whether to show the feedback button
     */
    function showWhatsNew(title, bulletPoints, showFeedbackButton = false) {
        // Remove any existing modal first to prevent duplicates
        const existingModal = document.querySelector('.whats-new-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'whats-new-modal';
        
        // Create modal content
        const content = document.createElement('div');
        content.className = 'whats-new-content';
        
        // Add title
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.className = 'whats-new-title';
        content.appendChild(titleElement);
        
        // Add bullet points
        const list = document.createElement('ul');
        list.className = 'whats-new-list';
        
        bulletPoints.forEach(point => {
            const item = document.createElement('li');
            item.textContent = point;
            list.appendChild(item);
        });
        content.appendChild(list);
        
        // Add buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'whats-new-buttons';
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Got it';
        closeButton.className = 'whats-new-close-button';
        closeButton.addEventListener('click', () => {
            modal.remove();
        });
        
        buttonContainer.appendChild(closeButton);
        
        // Add feedback button if requested
        if (showFeedbackButton) {
            const feedbackButton = document.createElement('button');
            feedbackButton.textContent = 'Send Feedback';
            feedbackButton.className = 'whats-new-feedback-button';
            feedbackButton.addEventListener('click', () => {
                modal.remove();
                document.getElementById('feedbackModal').style.display = 'flex';
            });
            
            buttonContainer.appendChild(feedbackButton);
        }
        
        content.appendChild(buttonContainer);
        
        // Add content to modal
        modal.appendChild(content);
        
        // Add click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Add modal to body
        document.body.appendChild(modal);
        
        return modal;
    }

    /**
     * Check if this is the first run or an update
     * Shows the what's new dialog if needed
     */
    function checkForUpdates() {
        const currentVersion = chrome.runtime.getManifest().version;
        
        chrome.storage.local.get(['lastVersion'], (result) => {
            const lastVersion = result.lastVersion;
            
            if (!lastVersion) {
                // First install
                showWhatsNew('Welcome to Midjourney Image Tracker!', [
                    'Hover over Midjourney images to bookmark them',
                    'Use this popup to manage your bookmarks',
                    'Export your collection with one click'
                ], true);
            } else if (lastVersion !== currentVersion) {
                // Update from previous version
                showWhatsNew(`What's New in v${currentVersion}`, [
                    'Bookmark your favorite Midjourney images',
                    'Export your collection as a text file',
                    'Smart URL standardization to avoid duplicates'
                ], true);
            }
            
            // Save current version
            chrome.storage.local.set({ lastVersion: currentVersion });
        });
    }

    function exportAsHtmlGallery() {
        chrome.tabs.create({ url: chrome.runtime.getURL("gallery.html") });
    }
});