# Midjourney Image Tracker: Development Guide

This guide provides developers with the information needed to set up, modify, test, and contribute to the Midjourney Image Tracker Chrome extension.

**KEY INFO IN THIS DOCUMENT:**  
- Step-by-step setup instructions for new developers  
- Workflow guidance for making and testing changes  
- Debugging techniques across different extension contexts  
- Common issues and troubleshooting steps
- Code style guidelines and best practices  
- Publishing process documentation  

## Development Environment Setup

### Prerequisites

Before you begin development, ensure you have the following installed:

- **Google Chrome** (version 88 or later)
- **Git** for version control
- **Node.js** (optional, for running tests and build scripts)
- **Code editor** (VS Code recommended with these extensions):
  - ESLint
  - Chrome Debugger
  - Prettier (for code formatting)

### Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/dagny099/mj-extension.git
cd mj-extension
```

2. **Load the extension in Chrome**

```
- Open Chrome and navigate to chrome://extensions/
- Enable "Developer mode" in the top-right corner
- Click "Load unpacked" and select the extension directory
```

![Loading Unpacked Extension](./images/load-unpacked.png)

3. **Verify installation**

The extension icon should appear in your Chrome toolbar. Visit [Midjourney](https://www.midjourney.com) to verify that the extension is functioning correctly.

### Project Structure

```
midjourney-extension/
├── manifest.json        # Extension configuration
├── src/
│   ├── js/
│   │   ├── shared.js    # Shared utility functions
│   │   ├── background.js # Background service worker
│   │   ├── content.js   # Content script for page interaction
│   │   ├── popup.js     # Popup functionality
│   │   └── gallery.js   # Gallery page functionality
│   └── css/
│       └── content.css  # Styles for bookmark button
├── popup.html           # Extension popup interface
├── gallery.html         # Gallery view for bookmarked images
├── instructions.html    # How-to-use guide
├── icons/               # Extension icons
├── docs/                # Documentation
└── tests/               # Test files (if implemented)
```

## Development Workflow

### Making Changes

1. **Create a new branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

- Update code in the relevant files
- Test changes locally (see Testing section)
- Update documentation if needed

3. **Commit your changes**

```bash
git add .
git commit -m "Description of changes"
git push origin feature/your-feature-name
```

4. **Create a pull request**

- Navigate to the repository on GitHub
- Click "New pull request"
- Select your branch and provide a description of changes
- Request review from a maintainer

### Reload Extension During Development

After making changes to your code, you need to reload the extension in Chrome:

1. Go to `chrome://extensions/`
2. Find the Midjourney Image Tracker extension
3. Click the refresh icon
4. If you changed the background script, click "Service Worker" for status

![Reloading Extension](./images/reload-extension.png)

For faster development, you can use Chrome's "Automatic reload" feature:

1. On the extension card, click "Details"
2. Toggle on "Allow access to file URLs" (if needed)
3. Toggle on "Automatic reload" (in newer Chrome versions)

## Key Development Areas

### Content Script (`content.js`)

The content script interacts directly with the Midjourney website. When modifying:

- Use `console.log()` for debugging, viewable in the website's DevTools console
- Test on various Midjourney page types (explore, profile, etc.)
- Be careful not to interfere with the site's existing functionality
- Pay attention to variable declarations (use `let` instead of `const` for variables that will be reassigned)

#### Debugging Content Scripts

To debug the content script:

1. Visit Midjourney with the extension enabled
2. Open Chrome DevTools (F12 or right-click > Inspect)
3. Go to the Console tab
4. Filter by "content.js" using the dropdown

### Background Service (`background.js`)

The background service handles persistence and coordination:

- Debug through the extension's dedicated DevTools
- Access by clicking "Service Worker" on the extension's card in `chrome://extensions/`
- Changes require reloading the extension

![Background Service Worker DevTools](./images/service-worker-devtools.png)

### Popup Interface (`popup.html`/`popup.js`)

The popup provides the user-facing UI:

- Right-click on the extension icon and select "Inspect Popup" to debug
- This opens DevTools connected to the popup
- The popup is a separate HTML page with its own DOM

### Shared Utilities (`shared.js`)

When modifying shared utilities:

- Ensure changes don't break existing functionality
- Test across all components that use the utility
- Keep functions focused and pure when possible

## Common Issues and Solutions

### Extension Context Invalidation

The error "Extension context invalidated" occurs when the extension is reloaded or updated while pages are still using it. To handle this:

1. **Add a context validation function**:
```javascript
function isExtensionContextValid() {
  try {
    chrome.runtime.getURL('');
    return true;
  } catch (e) {
    return false;
  }
}
```

2. **Check context before using Chrome APIs**:
```javascript
if (isExtensionContextValid()) {
  chrome.runtime.sendMessage({...});
}
```

3. **Implement a recovery mechanism**:
```javascript
function attemptRecovery() {
  if (!isExtensionContextValid()) {
    console.log('Extension context invalid, attempting recovery...');
    // Clean up and reinitialize
  }
}

setInterval(attemptRecovery, 10000); // Check every 10 seconds
```

### Button Event Handlers Not Working

If button click events aren't working consistently:

1. **Check for closure variable issues**: Use the button's own state rather than variables captured at creation time.
2. **Ensure proper event propagation**: Use `e.stopPropagation()` and `e.preventDefault()`.
3. **Add debugging console logs**: Log each step of the click handler to pinpoint issues.
4. **Check for variable reassignment errors**: Ensure you're using `let` instead of `const` for variables that will be reassigned.

### Multiple Buttons Appearing

To prevent duplicate buttons on the same image:

1. **Add checks for existing buttons**:
```javascript
// Skip if this image already has a bookmark button
const existingButton = img.parentElement.querySelector('[data-mj-bookmark-btn]');
if (existingButton) {
  return null;
}
```

2. **Use data attributes for tracking**: Mark processed images and containers.

## Testing Your Changes

### Manual Testing

For each change, test the following scenarios:

1. **Midjourney Detection**
   - Do bookmark buttons appear on all Midjourney images?
   - Are non-Midjourney images ignored?

2. **Bookmark Functionality**
   - Does clicking the bookmark button save the URL?
   - Does the button change state correctly?
   - Are duplicate bookmarks prevented?
   - Can you unbookmark images after bookmarking them?
   - Test bookmarking the same image multiple times rapidly

3. **URL Standardization**
   - Test with various URL formats to ensure proper standardization
   - Verify that the same image in different contexts is recognized

4. **Popup Interface**
   - Do all bookmarked images appear in the popup?
   - Is the bookmark count displayed correctly?
   - Can you remove individual bookmarks?
   - Does the export function work properly?
   - Does clearing all bookmarks work?

5. **Cross-context Testing**
   - Bookmark an image from the thumbnail view
   - Navigate to full-size view of the same image
   - Verify the bookmark status is consistent

6. **Error Handling**
   - Test with invalid URLs
   - Test export with large numbers of bookmarks
   - Test with slow network connections
   - Reload the extension while using it to test recovery mechanisms

### Creating Automated Tests (Future Enhancement)

Guidelines for adding automated tests:

1. Create tests in the `tests/` directory
2. Use Jest or Mocha for unit testing
3. Structure tests to match the file they test
4. Run tests before committing changes

```javascript
// Example test for URL standardization
describe('URL Standardization', () => {
  test('Converts thumbnail URL to standard format', () => {
    const input = "https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0_640_N.webp?method=shortest";
    const expected = "https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0.jpeg";
    expect(standardizeMidjourneyUrl(input)).toBe(expected);
  });
  
  // Add more test cases...
});
```

## Chrome Extension APIs Reference

The extension uses several Chrome APIs. Here's a quick reference:

### Storage API

```javascript
// Save data
chrome.storage.local.set({ key: value }, callback);

// Retrieve data
chrome.storage.local.get(['key'], (result) => {
  console.log(result.key);
});
```

### Message Passing API

```javascript
// Send a message
chrome.runtime.sendMessage({ type: 'ACTION_TYPE', data: payload }, response => {
  console.log(response);
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ACTION_TYPE') {
    // Handle message
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});
```

### Content Scripts API

```javascript
// In manifest.json
"content_scripts": [
  {
    "matches": ["https://*.midjourney.com/*"],
    "js": ["src/js/shared.js", "src/js/content.js"]
  }
]
```

### Downloads API

```javascript
chrome.downloads.download({
  url: dataUrl,
  filename: 'bookmarks.txt',
  saveAs: false
}, downloadId => {
  console.log('Download started:', downloadId);
});
```

## Performance Best Practices

When contributing to the extension, follow these performance guidelines:

1. **DOM Manipulation**
   - Batch DOM operations to minimize reflows
   - Use document fragments for multiple insertions
   - Avoid unnecessary style calculations

2. **Resource Management**
   - Minimize memory usage, especially in the background service
   - Use event delegation for handling multiple similar events
   - Release resources when they're no longer needed

3. **Storage Optimization**
   - Store only essential data
   - Use efficient data structures (Sets for unique collections)
   - Consider the storage limits of chrome.storage.local (5MB)

4. **Event Handling**
   - Debounce or throttle frequent events like scroll or resize
   - Use passive event listeners when appropriate
   - Remove event listeners when they're no longer needed
   - Use `e.stopPropagation()` and `e.preventDefault()` to prevent unwanted behavior

5. **Error Handling**
   - Add robust error handling for Chrome API calls
   - Check extension context validity before using Chrome APIs
   - Implement recovery mechanisms for extension context invalidation

## Code Style Guidelines

### JavaScript Coding Style

- Use ES6+ features when appropriate
- Follow standard JavaScript conventions:
  - 2-space indentation
  - Semicolons at the end of statements
  - Single quotes for strings
  - Camel case for variables and functions
  - Clear, descriptive variable names
- Use `let` instead of `const` for variables that will be reassigned

```javascript
// Good example
function processUrlData(rawUrl) {
  const standardizedUrl = standardizeMidjourneyUrl(rawUrl);
  return {
    url: standardizedUrl,
    timestamp: Date.now()
  };
}
```

### Documentation Guidelines

- Add JSDoc comments for functions:

```javascript
/**
 * Standardizes Midjourney URLs to a consistent format
 * 
 * @param {string} url - The URL to standardize
 * @returns {string} The standardized URL
 */
function standardizeMidjourneyUrl(url) {
  // Implementation
}
```

- Include inline comments for complex logic
- Update README.md when adding new features

## Common Development Challenges

### Extension Context Isolation

The extension operates in three separate JavaScript contexts:

1. **Content script context** - Has access to the web page DOM but limited access to extension APIs
2. **Background context** - Has full access to extension APIs but no direct DOM access
3. **Popup context** - Has its own DOM and access to extension APIs

Communication between these contexts requires message passing:

```javascript
// From content script to background
chrome.runtime.sendMessage({ type: 'ACTION', data: payload }, response => {
  // Handle response
});

// From background to content script
chrome.tabs.sendMessage(tabId, { type: 'ACTION', data: payload }, response => {
  // Handle response
});
```

### Debugging Across Contexts

To debug across contexts:

1. Open separate DevTools for each context
2. Use console.log with context prefixes:

```javascript
console.log('[BACKGROUND]', 'Data received:', data);
console.log('[CONTENT]', 'Processing image:', imageUrl);
console.log('[POPUP]', 'Rendering bookmarks:', bookmarks.length);
```

3. Add debugging logs at each step of critical operations:

```javascript
function createBookmarkButton(img) {
  console.log('Creating button for image:', img.src);
  // Implementation...
  
  button.addEventListener('click', function(e) {
    console.log('Button clicked for URL:', standardizedImgUrl);
    console.log('Current saved state:', isAlreadySaved);
    // Handle click...
  });
}
```

### State Management

To avoid state inconsistencies:

1. Use the DOM element's state rather than closure variables:

```javascript
// Instead of this:
const isAlreadySaved = savedUrls.has(standardizedImgUrl);
button.addEventListener('click', function(e) {
  if (isAlreadySaved) { // ❌ Using closure variable
    // Remove...
  }
});

// Do this:
button.addEventListener('click', function(e) {
  const isCurrentlySaved = button.classList.contains('saved'); // ✅ Using current state
  if (isCurrentlySaved) {
    // Remove...
  }
});
```

2. Always refresh data after operations:

```javascript
chrome.runtime.sendMessage({ type: 'SAVE_URL', url: standardizedImgUrl }, function(response) {
  // Force refresh saved URLs to ensure consistent state
  updateSavedUrls(function() {
    // Update UI based on fresh data
  }, true); // Force refresh
});
```

### Handling Asynchronous Operations

Chrome extension APIs are often asynchronous. Use callbacks or promises:

```javascript
// Using callbacks
chrome.storage.local.get(['savedUrls'], result => {
  processUrls(result.savedUrls || []);
});

// Using promises (with utility function)
function chromeStorageGet(keys) {
  return new Promise(resolve => {
    chrome.storage.local.get(keys, resolve);
  });
}

async function loadData() {
  const result = await chromeStorageGet(['savedUrls']);
  processUrls(result.savedUrls || []);
}
```

## Publishing Your Changes

### Creating a Release Build

Currently, the extension doesn't have a build process. To prepare for publishing:

1. Ensure all files are properly formatted and documented
2. Update the version number in `manifest.json`
3. Create a ZIP file of the extension directory

### Testing Before Publication

Before publishing:

1. Test on multiple Chrome versions (stable, beta, canary)
2. Test on different operating systems if possible
3. Verify all functionality with a clean install
4. Check for any console errors or warnings
5. Test with both fresh installs and updates from previous versions

### Submission to Chrome Web Store

To publish to the Chrome Web Store:

1. Create a Developer account at the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Pay the one-time registration fee
3. Create a new item and upload your ZIP file
4. Fill in store listing information
5. Submit for review

![Chrome Web Store Submission](./images/webstore-submission.png)

### Creating Good Store Listing Materials

For an effective Chrome Web Store listing:

1. **Icon** - Create a distinctive 128x128 icon
2. **Screenshots** - Capture 5-10 screenshots showing key functionality
3. **Description** - Write a clear, concise description with key features
4. **Promotional Images** - Create promo tiles (optional)

## Future Development Roadmap

Consider contributing to these planned features:

1. **Metadata Integration**
   - Extract and store metadata from Midjourney images
   - Enable filtering by parameters

2. **Advanced Organization**
   - Implement tagging system
   - Create collections/folders

3. **Sync Support**
   - Enable cross-device synchronization
   - Implement Chrome sync API

4. **UI Enhancements**
   - Add dark mode support
   - Implement grid/list view options

5. **Export Formats**
   - Add support for JSON export
   - Enable CSV export with metadata

6. **Improved Error Handling**
   - Add user-friendly error messages
   - Implement automatic recovery mechanisms

## Appendix: Useful Resources

### Chrome Extension Documentation

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Overview](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension Samples](https://github.com/GoogleChrome/chrome-extensions-samples)

### Learning Resources

- [Chrome Extension Tutorial](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
- [JavaScript MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)

### Tools

- [Chrome Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid) - Auto-reload extensions during development
- [Extension CSS Analyzer](https://chrome.google.com/webstore/detail/cssviewer/ggfgijbpiheegefliciemofobhmofgce) - Helps debug CSS issues

---

This development guide should help you get started with contributing to the Midjourney Image Tracker extension. If you have questions, feel free to open an issue on GitHub.

Buena suerte!