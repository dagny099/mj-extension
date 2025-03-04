// content.js 

// In-memory cache of saved URLs
let savedUrls = new Set();
let lastUpdateTime = 0;
const CACHE_TTL = 5000; // 5 seconds
const DEBOUNCE_DELAY = 200; // milliseconds
let initialized = false;

/**
 * Updates the saved URLs cache if needed
 * @param {Function} [callback] - Optional callback to run after update
 */
function updateSavedUrls(callback, forceRefresh = false) {
    if (!isExtensionContextValid()) {
        console.warn('Extension context invalid, cannot update URLs');
        return;
    }
    
    // Only fetch if cache is expired or forced refresh
    if (!forceRefresh && Date.now() - lastUpdateTime < CACHE_TTL) {
        if (callback && typeof callback === 'function') {
            callback();
        }
        return;
    }

    try {
        chrome.runtime.sendMessage({ type: 'GET_URLS' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Runtime error in updateSavedUrls:', chrome.runtime.lastError);
                if (callback && typeof callback === 'function') {
                    callback();
                }
                return;
            }
            
            if (response && response.urls) {
                console.log('Received updated URLs:', response.urls.length);
                // Create a new Set to avoid reference issues
                savedUrls = new Set(response.urls);
                lastUpdateTime = Date.now();
                
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        });
    } catch (error) {
        console.error('Error updating saved URLs:', error);
        if (callback && typeof callback === 'function') {
            callback();
        }
    }
}


/**
 * Determines the appropriate size class for a bookmark button based on image dimensions
 * @param {HTMLImageElement} img - The image element
 * @returns {string} CSS class name for button sizing
 */
function getButtonSizeClass(img) {
    if (!img || !img.complete) return '';
    
    try {
        // Only proceed if naturalWidth and naturalHeight are available and valid
        if (!img.naturalWidth || !img.naturalHeight) return '';
        
        const area = img.naturalWidth * img.naturalHeight;
        
        // Use larger buttons for bigger images
        if (area > 1000000) return 'mj-bookmark-button-xl';
        if (area > 500000) return 'mj-bookmark-button-larger';
        
        // For very wide or tall images with unusual aspect ratios
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        if (aspectRatio > 3 || aspectRatio < 0.33) {
            return 'mj-bookmark-button-larger';
        }
    } catch (e) {
        console.warn('Error calculating button size:', e);
    }
    
    return '';
}

/**
 * Creates a bookmark button for an image
 * @param {HTMLImageElement} img - The image to create a button for
 * @returns {HTMLButtonElement|null} - The created button or null if creation failed
 */
function createBookmarkButton(img) {
    if (!img || !img.src) {
        return null;
    }
    
    // Skip if this image already has a bookmark button
    const existingButton = img.parentElement.querySelector('[data-mj-bookmark-btn]');
    if (existingButton) {
        console.log('Skipping image that already has a button');
        return null;
    }
    
    try {
        let button = document.createElement('button');
        
        // Standardize the image URL for comparison
        const standardizedImgUrl = standardizeMidjourneyUrl(img.src);
        
        // Check if this image is already saved
        const isAlreadySaved = savedUrls.has(standardizedImgUrl);
        
        // Set initial appearance based on saved state
        button.className = isAlreadySaved ? 
            `mj-bookmark-button saved` : 
            `mj-bookmark-button`;
        
        button.textContent = isAlreadySaved ? '✓' : '🔖';
        button.setAttribute('data-mj-bookmark-btn', 'true');
        button.setAttribute('data-mj-url', standardizedImgUrl);
        
        // Handle bookmarking without affecting image clicks
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            
            // Get the CURRENT state directly from the button's class
            const isCurrentlySaved = button.classList.contains('saved');
            console.log('Button clicked for URL:', standardizedImgUrl);
            console.log('Current saved state (from button class):', isCurrentlySaved);
            
            if (isCurrentlySaved) {
                // Handle removal
                button.textContent = '🔖';
                button.classList.remove('saved');
                
                chrome.runtime.sendMessage({
                    type: 'REMOVE_URL',
                    url: standardizedImgUrl
                }, function(response) {
                    console.log('Remove URL response:', response);
                    if (chrome.runtime.lastError) {
                        console.error('Runtime error:', chrome.runtime.lastError);
                        return;
                    }
                    
                    // Refresh saved URLs
                    updateSavedUrls(function() {
                        const isStillSaved = savedUrls.has(standardizedImgUrl);
                        console.log('After removal, still saved?', isStillSaved);
                        
                        // Update button to match actual state
                        if (isStillSaved) {
                            button.textContent = '✓';
                            button.classList.add('saved');
                        } else {
                            button.textContent = '🔖';
                            button.classList.remove('saved');
                        }
                    }, true);
                });
            } else {
                // Handle addition
                button.textContent = '✓';
                button.classList.add('saved');
                
                chrome.runtime.sendMessage({
                    type: 'SAVE_URL',
                    url: standardizedImgUrl
                }, function(response) {
                    console.log('Save URL response:', response);
                    if (chrome.runtime.lastError) {
                        console.error('Runtime error:', chrome.runtime.lastError);
                        return;
                    }
                    
                    // Refresh saved URLs
                    updateSavedUrls(function() {
                        const isNowSaved = savedUrls.has(standardizedImgUrl);
                        console.log('After addition, is now saved:', isNowSaved);
                        
                        // Update button to match actual state
                        if (isNowSaved) {
                            button.textContent = '✓';
                            button.classList.add('saved');
                        } else {
                            button.textContent = '🔖';
                            button.classList.remove('saved');
                        }
                    }, true);
                });
            }
        });
        
        // Add hover effects
        img.addEventListener('mouseenter', function() {
            button.style.display = 'block';
        });
        img.addEventListener('mouseleave', function() {
            // Don't hide if hovered over the button itself
            if (!button.matches(':hover')) {
                button.style.display = 'none';
            }
        });
        button.addEventListener('mouseenter', function() {
            button.style.display = 'block';
        });
        button.addEventListener('mouseleave', function() {
            // Only hide if also not hovering over image
            if (!img.matches(':hover')) {
                button.style.display = 'none';
            }
        });
        
        return button;
    } catch (error) {
        console.error('Error creating bookmark button:', error);
        return null;
    }
}


/**
 * Process each image on the page - with improved error handling
 */
function processImages() {
    try {
        // Get all images
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            try {
                // Skip invalid images or already processed ones
                if (!img || !img.src || img.hasAttribute('data-mj-processed') || 
                    !img.src.includes('cdn.midjourney.com')) {
                    return;
                }
                
                // Skip if parent already has a button
                const container = img.parentElement;
                if (!container) return;
                
                const existingButton = container.querySelector('[data-mj-bookmark-btn]');
                if (existingButton) {
                    img.setAttribute('data-mj-processed', 'true');
                    return;
                }
                
                // Mark as processed
                img.setAttribute('data-mj-processed', 'true');
                
                // Only process reasonably sized images
                if (img.complete && (img.naturalWidth < 50 || img.naturalHeight < 50)) {
                    return;
                }
                
                // Store original position style
                const originalPosition = getComputedStyle(container).position;
                
                // Only set position relative if needed
                if (originalPosition === 'static' || !originalPosition) {
                    container.style.position = 'relative';
                    container.setAttribute('data-mj-container', 'true');
                }
                
                // Create and add bookmark button
                const button = createBookmarkButton(img);
                if (button) {
                    container.appendChild(button);
                }
            } catch (imgError) {
                console.error('Error processing individual image:', imgError);
            }
        });
    } catch (error) {
        console.error('Fatal error in processImages:', error);
    }
}


/**
 * Refreshes all buttons on the page based on current saved URLs
 */
function refreshAllButtons() {
    try {
        // Clean up existing buttons
        document.querySelectorAll('[data-mj-bookmark-btn]').forEach(button => {
            try {
                const url = button.getAttribute('data-mj-url');
                if (!url) return;
                
                // Check against our updated savedUrls Set
                const isAlreadySaved = savedUrls.has(url);
                
                // Get parent to extract size class info
                const imgContainer = button.parentElement;
                if (!imgContainer) return;
                
                const img = imgContainer.querySelector('img');
                const sizeClass = img ? getButtonSizeClass(img) : '';
                
                // Update button appearance
                button.textContent = isAlreadySaved ? '✓' : '🔖';
                button.className = isAlreadySaved ? 
                    `mj-bookmark-button saved ${sizeClass}`.trim() : 
                    `mj-bookmark-button ${sizeClass}`.trim();
            } catch (btnError) {
                console.warn('Error refreshing button:', btnError);
            }
        });
    } catch (error) {
        console.error('Error refreshing buttons:', error);
    }
}

/**
 * Debounce helper for reducing rapid-fire function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * Initialize extension with improved error handling
 */
function initialize() {
    if (initialized) return;
    
    try {
        // Load saved URLs first - consistent with background.js changes
        updateSavedUrls(function() {
            try {
                // Process images
                processImages();
                
                // Set up observer for dynamically added content
                const observer = new MutationObserver(
                    debounce(function(mutations) {
                        let shouldProcess = false;
                        
                        for (const mutation of mutations) {
                            if (mutation.type === 'childList' && mutation.addedNodes.length) {
                                for (let i = 0; i < mutation.addedNodes.length; i++) {
                                    const node = mutation.addedNodes[i];
                                    if (node.nodeName === 'IMG' || 
                                        (node.getElementsByTagName && node.getElementsByTagName('img').length)) {
                                        shouldProcess = true;
                                        break;
                                    }
                                }
                                if (shouldProcess) break;
                            }
                        }
                        
                        if (shouldProcess) {
                            processImages();
                        }
                    }, DEBOUNCE_DELAY)
                );
                
                // Start observing document
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                
                // Mark as initialized
                initialized = true;
                
                // Set a one-time delayed process for any lazy-loaded images
                // that might have been missed by the initial process
                setTimeout(processImages, 2000);
            } catch (setupError) {
                console.error('Error during initialization setup:', setupError);
            }
        }, true); // Force refresh  
    } catch (error) {
        console.error('Fatal error during initialization:', error);
    }
}

/**
 * Reset processing for all images (useful after URL list updates)
 */
function resetProcessing() {
    try {
        // Reset processed flags
        document.querySelectorAll('[data-mj-processed]').forEach(function(img) {
            img.removeAttribute('data-mj-processed');
        });
        
        // Re-process images
        processImages();
    } catch (error) {
        console.error('Error resetting image processing:', error);
    }
}

// Add this function to content.js
function isExtensionContextValid() {
    try {
        // This will throw if context is invalid
        chrome.runtime.getURL('');
        return true;
    } catch (e) {
        return false;
    }
}

// attemptRecovery function to recover from invalid extension context
function attemptRecovery() {
    if (!isExtensionContextValid()) {
        console.log('Extension context invalid, attempting recovery...');
        
        // Remove all existing buttons
        document.querySelectorAll('[data-mj-bookmark-btn]').forEach(btn => {
            try {
                btn.remove();
            } catch (e) {
                console.error('Error removing button:', e);
            }
        });
        
        // Reset processing flags
        document.querySelectorAll('[data-mj-processed]').forEach(img => {
            try {
                img.removeAttribute('data-mj-processed');
            } catch (e) {
                console.error('Error resetting image:', e);
            }
        });
        
        // Reset initialization state
        initialized = false;
        
        // Attempt to reinitialize
        setTimeout(initialize, 500);
    }
}

// Add a periodic check
setInterval(attemptRecovery, 10000); // Check every 10 seconds

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(message) {
    try {
        if (message.type === 'URLS_UPDATED') {
            // When URLs are updated in background.js, update our local cache
            updateSavedUrls(function() {
                refreshAllButtons();
            }, true); // Force refresh
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
});

// Start the extension when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}