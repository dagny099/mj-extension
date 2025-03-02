// content.js

// Keep track of saved URLs
let savedUrls = new Set();

// Fetch the current list of saved URLs
function updateSavedUrls(callback) {
    try {
        chrome.runtime.sendMessage({ type: 'GET_URLS' }, (response) => {
            if (response && response.urls) {
                // Extract just the URLs from the response and standardize them
                savedUrls = new Set(response.urls.map(item => {
                    const url = typeof item === 'object' ? item.url : item;
                    return standardizeMidjourneyUrl(url);
                }));
                
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        });
    } catch (error) {
        console.error('Error updating saved URLs:', error);
    }
}

// Create the bookmark button in a way that won't interfere with image clicks
function createBookmarkButton(img) {
    if (!img || !img.src) {
        return null;
    }
    
    const button = document.createElement('button');
    
    // Standardize the image URL for comparison
    const standardizedImgUrl = standardizeMidjourneyUrl(img.src);
    
    // Check if this image is already saved
    const isAlreadySaved = savedUrls.has(standardizedImgUrl);
    
    // Use CSS classes instead of inline styles
    button.className = isAlreadySaved ? 'mj-bookmark-button saved' : 'mj-bookmark-button';
    button.textContent = isAlreadySaved ? '✓' : '🔖';
    
    // Handle bookmarking without affecting image clicks
    button.addEventListener('click', function(e) {
        // Using function() instead of arrow to avoid "this" binding issues
        e.stopPropagation();
        e.preventDefault();
        
        if (isAlreadySaved) {
            // If already saved, remove it
            chrome.runtime.sendMessage({
                type: 'REMOVE_URL',
                url: standardizedImgUrl // Send standardized URL
            }, function(response) {
                if (response && response.success) {
                    button.textContent = '🔖';
                    button.className = 'mj-bookmark-button'; // Remove 'saved' class
                    // Update our local tracking
                    savedUrls.delete(standardizedImgUrl);
                }
            });
        } else {
            // If not saved, add it
            chrome.runtime.sendMessage({
                type: 'SAVE_URL',
                url: standardizedImgUrl, // Send standardized URL
                timestamp: Date.now()
            }, function(response) {
                if (response && response.success) {
                    button.textContent = '✓';
                    button.className = 'mj-bookmark-button saved'; // Add 'saved' class
                    // Update our local tracking
                    savedUrls.add(standardizedImgUrl);
                }
            });
        }
    });
    
    // Handle button visibility
    const showButton = function() { button.style.display = 'block'; };
    const hideButton = function() { button.style.display = 'none'; };
    
    // Add visibility handlers
    img.addEventListener('mouseenter', showButton);
    img.addEventListener('mouseleave', hideButton);
    button.addEventListener('mouseenter', showButton);
    button.addEventListener('mouseleave', hideButton);
    
    return button;
}

// Add this debugging function to your content.js file
function analyzeImageStructure() {
    const images = Array.from(document.querySelectorAll('img')).filter(img => 
        img.src && isMidjourneyImage(img.src)
    );
    
    console.log(`Found ${images.length} Midjourney images`);
    
    // Analyze the first image if available
    if (images.length > 0) {
        const img = images[0];
        console.log('Image analysis:', {
            src: img.src,
            standardized: standardizeMidjourneyUrl(img.src),
            parentElement: img.parentElement.tagName,
            parentClasses: img.parentElement.className,
            clickableAncestor: img.closest('a, button, [onclick]')?.tagName || 'None',
            hasOnClick: !!img.onclick,
            hasClickListeners: !!img.getAttribute('data-has-click-listener'),
            cssPosition: window.getComputedStyle(img.parentElement).position
        });
        
        // See if there are any click handlers on parent elements
        let parent = img.parentElement;
        while (parent && parent !== document.body) {
            if (parent.onclick || parent.getAttribute('data-has-click-listener')) {
                console.log('Found click handler on ancestor:', parent.tagName, parent.className);
            }
            parent = parent.parentElement;
        }
    }
}

// Process each image on the page - with improved handling
function processImages() {
    // Get all images
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Skip invalid images or already processed ones
        if (!img || !img.src || img.hasAttribute('data-mj-processed') || !isMidjourneyImage(img.src)) {
            return;
        }
        
        // Mark as processed
        img.setAttribute('data-mj-processed', 'true');
        
        // Ensure the image is in a valid container
        const container = img.parentElement;
        if (!container) return;
        
        // Store original position style
        const originalPosition = getComputedStyle(container).position;
        
        // Only set position relative if needed
        if (originalPosition === 'static' || !originalPosition) {
            container.style.position = 'relative';
        }
        
        // Create and add bookmark button
        const button = createBookmarkButton(img);
        if (button) {
            container.appendChild(button);
        }
        
        // CRITICAL: Ensure we're not breaking the original click behavior
        // Let's preserve any existing click handlers on the image
        const existingClick = img.onclick;
        
        // Only if we need to add our own click handler, preserve existing behavior
        if (existingClick) {
            img.addEventListener('click', function(e) {
                // We're explicitly NOT calling preventDefault or stopPropagation
                // Let the original handler work
                console.log('Image clicked, allowing original behavior');
            });
        }
    });
}

// Initialize extension
function initialize() {
    // Load saved URLs first
    updateSavedUrls(function() {
        // Then process images
        processImages();
        
        // Set up observer for dynamically added content
        const observer = new MutationObserver(function(mutations) {
            let shouldProcess = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeName === 'IMG' || 
                            (node.getElementsByTagName && node.getElementsByTagName('img').length)) {
                            shouldProcess = true;
                            break;
                        }
                    }
                }
            });
            
            if (shouldProcess) {
                processImages();
            }
        });
        
        // Start observing document
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// Call this function after the page loads
setTimeout(analyzeImageStructure, 2000);

// Listen for messages from background script
chrome.runtime.onMessage.addListener(function(message) {
    if (message.type === 'URLS_UPDATED') {
        updateSavedUrls(function() {
            // Clean up existing buttons
            document.querySelectorAll('.mj-bookmark-button').forEach(function(button) {
                button.remove();
            });
            
            // Reset processed flags
            document.querySelectorAll('[data-mj-processed]').forEach(function(img) {
                img.removeAttribute('data-mj-processed');
            });
            
            // Re-process images
            processImages();
        });
    }
});

// Start the extension when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}