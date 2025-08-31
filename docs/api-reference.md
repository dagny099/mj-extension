# API Reference - Midjourney Image Tracker

This document provides a comprehensive reference for the internal message passing API used within the Midjourney Image Tracker Chrome extension. Understanding this API is essential for contributing to the project or extending its functionality.

## Overview

The extension uses Chrome's `chrome.runtime.sendMessage()` API for communication between different contexts:
- **Background Service Worker** ↔ **Content Scripts**
- **Background Service Worker** ↔ **Popup Interface** 
- **Background Service Worker** ↔ **Gallery Page**

All messages follow a consistent JSON structure with typed message handlers and standardized response formats.

## Message Structure

### Request Format
```javascript
{
  type: string,           // Required: Message type identifier
  payload?: any,         // Optional: Message-specific data
  [key: string]: any     // Optional: Additional message-specific properties
}
```

### Response Format
```javascript
{
  success: boolean,       // Required: Operation success status
  data?: any,            // Optional: Response payload
  message?: string,      // Optional: Human-readable message
  error?: string         // Optional: Error description
}
```

## Core API Messages

### 1. URL Management

#### `SAVE_URL`
Saves a Midjourney image URL to the bookmark collection.

**Request:**
```javascript
{
  type: 'SAVE_URL',
  url: string             // Midjourney image URL to bookmark
}
```

**Response:**
```javascript
{
  success: boolean,       // true if saved, false if duplicate
  message?: string        // 'URL already saved' for duplicates
}
```

**Usage Example:**
```javascript
// Content Script → Background
chrome.runtime.sendMessage({
  type: 'SAVE_URL',
  url: 'https://cdn.midjourney.com/abc123.../0_0.png'
}, (response) => {
  if (response.success) {
    console.log('Bookmark saved successfully');
  } else {
    console.log('Duplicate bookmark:', response.message);
  }
});
```

**Implementation Details:**
- URL is automatically standardized using `standardizeMidjourneyUrl()`
- Duplicate detection uses Set-based O(1) lookup
- Triggers `URLS_UPDATED` broadcast to active tabs
- Persists data to `chrome.storage.local`

---

#### `GET_URLS`
Retrieves all saved bookmark URLs.

**Request:**
```javascript
{
  type: 'GET_URLS'
}
```

**Response:**
```javascript
{
  success: true,
  urls: string[]          // Array of standardized bookmark URLs
}
```

**Usage Example:**
```javascript
// Popup → Background
chrome.runtime.sendMessage({ type: 'GET_URLS' }, (response) => {
  const bookmarks = response.urls;
  console.log(`Found ${bookmarks.length} saved bookmarks`);
  // Render bookmarks in UI
});
```

**Implementation Details:**
- Returns URLs in chronological order (oldest first)
- All URLs are pre-standardized
- Response includes empty array if no bookmarks exist

---

#### `DELETE_URL`
Removes a specific URL from the bookmark collection.

**Request:**
```javascript
{
  type: 'DELETE_URL',
  url: string             // URL to remove (will be standardized)
}
```

**Response:**
```javascript
{
  success: boolean,       // true if deleted, false if not found
  message?: string        // Error message if deletion failed
}
```

**Usage Example:**
```javascript
// Popup → Background
chrome.runtime.sendMessage({
  type: 'DELETE_URL',
  url: bookmarkUrl
}, (response) => {
  if (response.success) {
    // Remove from UI
    removeBookmarkFromUI(bookmarkUrl);
  }
});
```

**Implementation Details:**
- URL is standardized before lookup
- Triggers storage update and tab notifications
- Safe to call with non-existent URLs

---

#### `CLEAR_ALL_URLS`
Removes all bookmarks from storage.

**Request:**
```javascript
{
  type: 'CLEAR_ALL_URLS'
}
```

**Response:**
```javascript
{
  success: boolean,
  message: string         // Confirmation message
}
```

**Usage Example:**
```javascript
// Popup → Background (after user confirmation)
chrome.runtime.sendMessage({ type: 'CLEAR_ALL_URLS' }, (response) => {
  if (response.success) {
    location.reload(); // Refresh UI
  }
});
```

### 2. System Messages

#### `URLS_UPDATED`
Broadcast message sent to content scripts when bookmark data changes.

**Message:**
```javascript
{
  type: 'URLS_UPDATED'
}
```

**Usage Example:**
```javascript
// Content Script listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'URLS_UPDATED') {
    // Refresh local cache
    updateSavedUrls(() => {
      updateBookmarkButtons();
    }, true); // Force refresh
  }
});
```

**When Triggered:**
- After successful `SAVE_URL` operation
- After successful `DELETE_URL` operation  
- After `CLEAR_ALL_URLS` operation

---

#### `GET_EXTENSION_INFO`
Retrieves extension metadata and system information.

**Request:**
```javascript
{
  type: 'GET_EXTENSION_INFO'
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    version: string,      // Extension version from manifest
    name: string,         // Extension name
    permissions: string[], // Active permissions
    storageUsed: number   // Bytes used in storage
  }
}
```

**Usage Example:**
```javascript
// Popup → Background (for debug/about dialog)
chrome.runtime.sendMessage({ type: 'GET_EXTENSION_INFO' }, (response) => {
  const info = response.data;
  document.getElementById('version').textContent = `v${info.version}`;
});
```

## Error Handling

### Common Error Patterns

#### Runtime Errors
```javascript
chrome.runtime.sendMessage(message, (response) => {
  if (chrome.runtime.lastError) {
    console.error('Communication error:', chrome.runtime.lastError.message);
    // Handle disconnected extension context
    return;
  }
  
  // Process response
});
```

#### Extension Context Validation
```javascript
function isExtensionContextValid() {
  return !!(chrome && chrome.runtime && chrome.runtime.id);
}

// Use before sending messages
if (!isExtensionContextValid()) {
  console.warn('Extension context invalid');
  return;
}
```

#### Message Timeout Handling
```javascript
function sendMessageWithTimeout(message, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Message timeout'));
    }, timeoutMs);

    chrome.runtime.sendMessage(message, (response) => {
      clearTimeout(timeout);
      
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}
```

## Message Flow Patterns

### Bookmark Creation Flow
```
1. User hovers over image (Content Script)
   └── Display bookmark button

2. User clicks bookmark button (Content Script)
   └── Send SAVE_URL → Background Script
       ├── Standardize URL
       ├── Check for duplicates  
       ├── Save to storage
       └── Broadcast URLS_UPDATED

3. Background sends URLS_UPDATED (Background Script)
   └── Content Scripts receive update
       └── Refresh bookmark button states
```

### Popup Load Flow
```
1. User opens extension popup (Popup Script)
   └── Send GET_URLS → Background Script
       └── Return all bookmarked URLs

2. Popup renders bookmark list (Popup Script)
   ├── Generate thumbnails
   ├── Create delete buttons
   └── Setup export functions
```

### Export Operation Flow
```
1. User clicks export button (Popup Script)
   └── Send GET_URLS → Background Script
       └── Return bookmark URLs

2. Generate export file (Popup Script)
   ├── HTML Gallery: Embed images and metadata
   ├── Text File: Plain URL list
   └── Trigger download via chrome.downloads API
```

## Advanced Usage Patterns

### Batched Operations
```javascript
// Efficient multiple URL operations
async function saveMultipleUrls(urls) {
  const results = await Promise.all(
    urls.map(url => 
      sendMessageWithTimeout({ type: 'SAVE_URL', url })
    )
  );
  
  return results.filter(r => r.success).length;
}
```

### Reactive UI Updates
```javascript
// Content Script: Auto-update bookmark buttons
let savedUrlsCache = new Set();

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'URLS_UPDATED') {
    refreshBookmarkStates();
  }
});

function refreshBookmarkStates() {
  chrome.runtime.sendMessage({ type: 'GET_URLS' }, (response) => {
    savedUrlsCache = new Set(response.urls);
    
    // Update all bookmark buttons on page
    document.querySelectorAll('.mj-bookmark-btn').forEach(updateButtonState);
  });
}
```

### Storage Quota Management
```javascript
// Monitor storage usage
chrome.runtime.sendMessage({ type: 'GET_EXTENSION_INFO' }, (response) => {
  const { storageUsed } = response.data;
  const maxStorage = 5 * 1024 * 1024; // 5MB Chrome limit
  
  if (storageUsed > maxStorage * 0.8) {
    console.warn('Storage nearly full:', storageUsed, 'bytes');
    // Suggest user export/cleanup
  }
});
```

## Testing & Debugging

### Message Inspection
```javascript
// Background Script: Log all messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', {
    type: message.type,
    from: sender.tab ? 'content script' : 'popup',
    payload: message
  });
  
  // ... handle message
  
  console.log('Sending response:', response);
  sendResponse(response);
});
```

### Mock Message Testing
```javascript
// Test message handlers without UI
function testSaveUrl() {
  const testMessage = {
    type: 'SAVE_URL',
    url: 'https://cdn.midjourney.com/test-uuid/0_0.png'
  };
  
  chrome.runtime.sendMessage(testMessage, (response) => {
    console.assert(response.success, 'Save URL should succeed');
  });
}
```

### Performance Monitoring
```javascript
// Measure message round-trip time
function benchmarkMessage(message, iterations = 100) {
  console.time(`Message ${message.type}`);
  
  let completed = 0;
  for (let i = 0; i < iterations; i++) {
    chrome.runtime.sendMessage(message, () => {
      if (++completed === iterations) {
        console.timeEnd(`Message ${message.type}`);
      }
    });
  }
}
```

## Security Considerations

### Message Validation
```javascript
// Background Script: Validate all incoming messages
function isValidMessage(message) {
  if (!message || typeof message.type !== 'string') {
    return false;
  }
  
  // Type-specific validation
  switch (message.type) {
    case 'SAVE_URL':
      return typeof message.url === 'string' && message.url.length > 0;
    case 'DELETE_URL':
      return typeof message.url === 'string';
    default:
      return true;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isValidMessage(message)) {
    sendResponse({ success: false, error: 'Invalid message format' });
    return;
  }
  
  // Process valid message...
});
```

### URL Sanitization
```javascript
// Always sanitize URLs before processing
function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch (e) {
    console.warn('Invalid URL provided:', url);
    return null;
  }
}
```

## Migration & Versioning

### Message Format Evolution
When updating message formats, maintain backward compatibility:

```javascript
// Handle both old and new message formats
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'SAVE_URL':
      // v1.0 format: { type, url }
      // v1.1 format: { type, url, metadata }
      
      const url = message.url;
      const metadata = message.metadata || {}; // Default for v1.0
      
      // Process with unified format
      break;
  }
});
```

This API provides a robust foundation for extension communication while maintaining flexibility for future enhancements.