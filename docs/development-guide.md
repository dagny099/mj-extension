# Midjourney Image Tracker: Development Guide

This guide provides developers with the information needed to set up, modify, test, and contribute to the Midjourney Image Tracker Chrome extension.

## Quick Start

### Prerequisites
- Google Chrome (latest stable version)
- Text editor (VS Code, Sublime Text, etc.)
- Basic understanding of JavaScript, HTML, CSS
- Familiarity with Chrome Extension APIs (helpful but not required)

### Development Setup

#### 1. Clone and Load Extension
```bash
# Clone the repository
git clone https://github.com/dagny099/mj-extension.git
cd mj-extension

# Load in Chrome
# 1. Open Chrome and go to chrome://extensions/
# 2. Enable "Developer mode" (toggle in top-right)
# 3. Click "Load unpacked" and select the project directory
```

#### 2. Verify Installation
- Extension icon should appear in Chrome toolbar
- Click icon to open popup interface
- Visit midjourney.com to test hover functionality

## Development Workflow

### Making Changes

#### Code Structure
```
src/js/
├── shared.js      # Shared utilities (URL functions)
├── background.js  # Service worker (data management)
├── content.js     # Page injection (UI interactions)
├── popup.js       # Popup interface (main UI)
└── gallery.js     # Gallery export (viewing)
```

#### Common Development Tasks

**1. Adding New Features**
```javascript
// Example: Adding new message type
// In background.js
case 'NEW_FEATURE':
    // Handle new functionality
    sendResponse({ success: true, data: result });
    return true;

// In content.js or popup.js
chrome.runtime.sendMessage({ type: 'NEW_FEATURE', payload: data }, (response) => {
    // Handle response
});
```

**2. Modifying UI Components**
- **Popup Interface**: Edit `popup.html` and `src/js/popup.js`
- **Content Injection**: Edit `src/js/content.js` and `src/css/content.css`
- **Gallery Export**: Edit `gallery.html` and `src/js/gallery.js`

**3. Storage Changes**
```javascript
// Always use chrome.storage.local for persistence
chrome.storage.local.set({ key: value }, () => {
    console.log('Data saved');
});

chrome.storage.local.get(['key'], (result) => {
    console.log('Data loaded:', result.key);
});
```

### Testing & Debugging

#### Extension Contexts
Chrome extensions run in multiple contexts. Use appropriate debugging tools:

**1. Background Script (Service Worker)**
```
chrome://extensions/ → Extension Details → "Inspect views: service worker"
```

**2. Content Scripts**
```
Regular Chrome DevTools on the target page (midjourney.com)
Console tab will show content script logs
```

**3. Popup Interface**
```
Right-click extension icon → "Inspect popup"
```

#### Testing Checklist

**Core Functionality**
- [ ] Extension loads without errors
- [ ] Bookmark buttons appear on hover over Midjourney images
- [ ] Clicking bookmark saves URL (check popup for confirmation)
- [ ] Duplicate URLs are prevented
- [ ] URL standardization works correctly
- [ ] Export functions generate valid files

**Edge Cases**
- [ ] Network errors are handled gracefully
- [ ] Extension works on different Midjourney page types
- [ ] Storage limitations are respected
- [ ] Multiple tabs don't interfere with each other

#### Common Debugging Scenarios

**Problem: Bookmark buttons not appearing**
```javascript
// Check content script injection
console.log('Content script loaded:', window.location.href);

// Verify image detection
document.querySelectorAll('img[src*="midjourney"]').forEach(img => {
    console.log('Found MJ image:', img.src);
});
```

**Problem: Storage not persisting**
```javascript
// Test storage directly in background script console
chrome.storage.local.get(null, (data) => {
    console.log('All stored data:', data);
});
```

**Problem: Message passing failures**
```javascript
// Add error handling to all message calls
chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError) {
        console.error('Message error:', chrome.runtime.lastError);
        return;
    }
    console.log('Response:', response);
});
```

### Code Style & Best Practices

#### JavaScript Standards
```javascript
// Use const/let instead of var
const savedUrls = new Set();
let lastUpdateTime = 0;

// Error handling for all async operations
try {
    const result = await chrome.storage.local.get(['urls']);
    // Handle result
} catch (error) {
    console.error('Storage error:', error);
}

// Validate extension context before API calls
function isExtensionContextValid() {
    return !!(chrome && chrome.runtime && chrome.runtime.id);
}
```

#### HTML/CSS Guidelines
```css
/* Use consistent naming conventions */
.mj-bookmark-btn {
    /* Extension-specific prefixes prevent conflicts */
}

/* Responsive design considerations */
@media (max-width: 768px) {
    .popup-content {
        width: 300px;
    }
}
```

#### Security Considerations
```javascript
// Always sanitize user input
function sanitizeUrl(url) {
    try {
        const parsed = new URL(url);
        return parsed.href;
    } catch (e) {
        return null;
    }
}

// Use textContent instead of innerHTML for untrusted data
element.textContent = userInput; // Safe
element.innerHTML = userInput;   // Potential XSS risk
```

### Manifest Configuration

#### Key Settings Explained
```json
{
  "manifest_version": 3,         // Latest version
  "permissions": [
    "activeTab",                 // Access current tab only
    "storage",                   // Local storage access
    "downloads"                  // File export capability
  ],
  "host_permissions": [
    "https://*.midjourney.com/*" // Restrict to MJ domains only
  ],
  "content_scripts": [{
    "matches": ["https://*.midjourney.com/*"],
    "js": ["src/js/shared.js", "src/js/content.js"],
    "run_at": "document_end"     // After DOM loads
  }]
}
```

### Performance Optimization

#### Content Script Efficiency
```javascript
// Use debouncing for frequent events
let debounceTimer;
function debounce(func, delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
}

// Cache DOM queries
const imageElements = document.querySelectorAll('img');
// Don't repeat expensive DOM operations
```

#### Memory Management
```javascript
// Clean up event listeners
function cleanup() {
    document.removeEventListener('mouseover', handleMouseOver);
    // Clear intervals/timeouts
    clearInterval(updateInterval);
}

// Use WeakMap for object associations
const elementData = new WeakMap();
```

### Publishing Process

#### Pre-Publication Checklist
- [ ] All features tested in multiple browsers/environments
- [ ] Version number updated in `manifest.json`
- [ ] Icons properly sized (16x16, 48x48, 128x128)
- [ ] Permissions minimal and justified
- [ ] Privacy policy updated if data handling changes
- [ ] Screenshots and store listing prepared

#### Chrome Web Store Submission
1. **Package Extension**
   ```bash
   # Create ZIP file excluding development files
   zip -r extension.zip . -x "*.git*" "*.DS_Store*" "docs/*" "README.md"
   ```

2. **Developer Dashboard**
   - Upload ZIP to Chrome Web Store Developer Dashboard
   - Complete store listing (description, screenshots, categories)
   - Submit for review (typically 1-3 business days)

#### Version Management
```json
// Update version in manifest.json
{
  "version": "1.1.0",  // Major.Minor.Patch
  "version_name": "1.1.0 - Enhanced Export Features"
}
```

### Troubleshooting Common Issues

#### Extension Won't Load
- Check manifest.json syntax (use JSON validator)
- Verify all referenced files exist
- Check browser console for specific error messages

#### Content Script Not Injecting
- Verify host permissions match target sites
- Check if site uses CSP that blocks scripts
- Ensure content script files are properly referenced

#### Storage Issues
- Check storage quota limits (chrome.storage.local has ~5MB limit)
- Verify data is being properly serialized
- Test with smaller datasets first

### Contributing Guidelines

#### Pull Request Process
1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Make changes with appropriate tests
4. Update documentation if needed
5. Submit pull request with clear description

#### Code Review Criteria
- Functionality works as expected
- Performance impact is minimal
- Security best practices followed
- Code is well-commented and maintainable
- Documentation updated appropriately

## Additional Resources

- [Chrome Extension APIs Documentation](https://developer.chrome.com/docs/extensions/reference/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/to-service-workers/)
- [Extension Security Best Practices](https://developer.chrome.com/docs/extensions/mv3/security/)

## Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Code Questions**: Include relevant console output and steps to reproduce
- **Documentation**: Check existing docs before asking questions

Happy coding! 🚀 