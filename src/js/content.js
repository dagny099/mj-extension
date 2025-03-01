// content.js

// Utility function to check if an image is from Midjourney
function isMidjourneyImage(url) {
    return url.includes('cdn.midjourney.com') && url.match(/[a-f0-9-]{36}/i);
}

// Keep track of saved URLs
let savedUrls = new Set();

// Fetch the current list of saved URLs
function updateSavedUrls(callback) {
    chrome.runtime.sendMessage({ type: 'GET_URLS' }, (response) => {
        if (response && response.urls) {
            // Extract just the URLs from the response
            savedUrls = new Set(response.urls.map(item => typeof item === 'object' ? item.url : item));
            
            if (callback) {
                callback();
            }
        }
    });
}

// Create and style the bookmark button
function createBookmarkButton(img) {
    const button = document.createElement('button');
    button.className = 'mj-bookmark-button';
    
    // Check if this image is already saved
    const isAlreadySaved = savedUrls.has(img.src);
    button.textContent = isAlreadySaved ? '✓' : '🔖';
    
    button.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 5px 10px;
        background: ${isAlreadySaved ? 'rgba(76, 175, 80, 0.8)' : 'rgba(0, 0, 0, 0.7)'};
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: none;
        z-index: 1000;
        box-sizing: content-box;
        margin: 0;
        line-height: 1;
        font-size: 16px;
        text-align: center;
        transform: none;
        width: auto;
        height: auto;
    `;
    
    // Show/hide button on hover - target the image itself
    img.addEventListener('mouseenter', () => button.style.display = 'block');
    img.addEventListener('mouseleave', () => button.style.display = 'none');
    
    // Also show button when hovering the button itself
    button.addEventListener('mouseenter', () => button.style.display = 'block');
    button.addEventListener('mouseleave', () => button.style.display = 'none');
    
    // Handle click
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isAlreadySaved) {
            // If already saved, remove it
            chrome.runtime.sendMessage({
                type: 'REMOVE_URL',
                url: img.src
            }, (response) => {
                if (response && response.success) {
                    button.textContent = '🔖';
                    button.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    // Update our local tracking
                    savedUrls.delete(img.src);
                }
            });
        } else {
            // If not saved, add it
            chrome.runtime.sendMessage({
                type: 'SAVE_URL',
                url: img.src,
                timestamp: Date.now()
            }, (response) => {
                if (response && response.success) {
                    button.textContent = '✓';
                    button.style.backgroundColor = 'rgba(76, 175, 80, 0.8)';
                    // Update our local tracking
                    savedUrls.add(img.src);
                }
            });
        }
    });
    
    return button;
}

// Process each image on the page
function processImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Skip if already processed or not a Midjourney image
        if (
            img.hasAttribute('data-mj-processed') || 
            !isMidjourneyImage(img.src)
        ) {
            return;
        }
        
        // Mark as processed
        img.setAttribute('data-mj-processed', 'true');
        
        // Instead of creating a new container, preserve the original layout
        // Just ensure the parent has position relative
        let container = img.parentElement;
        
        // Store original styles
        const originalPosition = container.style.position;
        
        // Only set position relative if not already positioned
        if (!originalPosition || originalPosition === 'static') {
            container.style.position = 'relative';
        }
        
        // Add bookmark button directly to the parent
        container.appendChild(createBookmarkButton(img));
    });
}

// Initialize: fetch saved URLs first, then process images
updateSavedUrls(() => {
    // Initial processing
    processImages();
    
    // Watch for new images
    const observer = new MutationObserver((mutations) => {
        if (mutations.some(mutation => 
            Array.from(mutation.addedNodes).some(node => 
                node.nodeName === 'IMG' || 
                (node.getElementsByTagName && node.getElementsByTagName('img').length)
            )
        )) {
            processImages();
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Listen for updates to the saved URLs
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'URLS_UPDATED') {
        updateSavedUrls(() => {
            // Refresh all buttons
            document.querySelectorAll('.mj-bookmark-button').forEach(button => {
                button.remove();
            });
            document.querySelectorAll('[data-mj-processed]').forEach(img => {
                img.removeAttribute('data-mj-processed');
            });
            processImages();
        });
    }
});