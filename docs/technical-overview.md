# Midjourney Image Tracker: Technical Overview

This document provides a comprehensive technical overview of the Midjourney Image Tracker Chrome extension, explaining its architecture, components, and how they work together.

## Architecture Overview

![Professional System Architecture](./images/professional-system-architecture.svg)

The extension follows a sophisticated Chrome extension Manifest V3 architecture with four main components that communicate through message passing. The diagram above showcases the complete system design including performance optimizations, security measures, and architectural complexity.

### Core Components

#### 1. **Background Service Worker** (`src/js/background.js`)
- **Purpose**: Central data store and message hub
- **Key Responsibilities**:
  - Manages persistent storage of bookmarked URLs
  - Handles URL standardization before storage
  - Prevents duplicate bookmarks
  - Coordinates between content scripts and popup
- **Storage**: Uses `chrome.storage.local` API for persistence
- **Message Handling**: Listens for `SAVE_URL`, `GET_URLS`, `DELETE_URL` messages

#### 2. **Content Script** (`src/js/content.js`)
- **Purpose**: Injects bookmark functionality into Midjourney web pages
- **Key Responsibilities**:
  - Detects Midjourney images on page
  - Creates hover-activated bookmark buttons
  - Manages local cache of saved URLs for performance
  - Handles user interactions (bookmark/unbookmark)
- **Injection Points**: Runs on `*.midjourney.com` domains
- **Performance**: Uses debouncing and caching to minimize API calls

#### 3. **Popup Interface** (`popup.html`, `src/js/popup.js`)
- **Purpose**: Main user interface for managing bookmarks
- **Key Features**:
  - Displays all saved bookmarks with thumbnails
  - Provides export functionality (HTML gallery, text file)
  - Individual bookmark management (view, delete)
  - Extension updates and help information
- **Export Options**:
  - **HTML Gallery**: Standalone, offline-viewable gallery
  - **Text File**: Simple URL list for external tools

#### 4. **Gallery Page** (`gallery.html`, `src/js/gallery.js`)
- **Purpose**: Full-screen view for exported HTML galleries
- **Features**:
  - Responsive grid layout
  - Image lazy loading
  - Metadata display
  - Export timestamp tracking

### Data Flow

```
Midjourney Page → Content Script → Background Worker → Storage
                      ↓                    ↓
                 User Interface ← Popup Interface ← Message API
```

#### URL Processing Pipeline

1. **Detection**: Content script identifies Midjourney images
2. **Standardization**: `standardizeMidjourneyUrl()` converts various formats to canonical form
3. **Validation**: `isMidjourneyImage()` ensures URL meets criteria
4. **Deduplication**: Background worker checks against existing URLs
5. **Storage**: Persisted using Chrome storage API

### URL Standardization System

The extension's core feature is intelligent URL standardization to prevent duplicate bookmarks:

**Input Formats Handled:**
```javascript
// Thumbnail format
"https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0_640_N.webp?method=shortest"

// Full-size format  
"https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0.png"

// Grid format
"https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/grid_0.png"
```

**Standardized Output:**
```javascript
"https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0.jpeg"
```

### Performance Considerations

#### Content Script Optimization
- **Caching**: Maintains in-memory cache with 5-second TTL
- **Debouncing**: 200ms delay on hover events to reduce CPU usage
- **Lazy Loading**: Bookmark buttons created only when needed

#### Storage Efficiency  
- **Data Structure**: Uses Set for O(1) duplicate detection
- **Persistence**: Converts to Array for Chrome storage compatibility
- **Cleanup**: Automatic validation of stored URLs

### Security Measures

#### Permissions Model
```json
{
  "permissions": ["activeTab", "storage", "downloads", "tabs"],
  "host_permissions": ["https://*.midjourney.com/*"]
}
```

#### Content Security Policy
- Restricts script execution to extension context
- Prevents inline script injection
- Allows safe font loading from data URIs

#### Data Privacy
- All data stored locally (no external servers)
- No user authentication or tracking
- Minimal permission set following principle of least privilege

### Error Handling

#### Runtime Error Recovery
- **Extension Context Validation**: Checks for invalid contexts before API calls
- **Message Passing Failures**: Graceful degradation when background script unavailable  
- **Storage Failures**: Error logging with user feedback
- **Network Issues**: Retry logic for image loading

#### User Experience
- **Visual Feedback**: Loading states and success/error indicators
- **Graceful Degradation**: Core functionality maintained even with partial failures
- **Error Messages**: User-friendly notifications for common issues

### Extension Lifecycle

#### Installation/Startup
1. Background worker initializes storage
2. Content scripts inject on relevant pages
3. Popup registers event handlers
4. Cache warming occurs on first interaction

#### Runtime Operations
1. User hovers over Midjourney image
2. Content script creates bookmark button
3. Click triggers message to background worker
4. URL standardization and storage occurs
5. UI updates reflect new state

#### Updates/Maintenance
- Version checking in popup interface
- Migration logic for storage format changes
- Backwards compatibility considerations

### Development Architecture

#### File Organization
```
src/js/
├── shared.js      # URL utilities (used by all contexts)
├── background.js  # Service worker (persistent storage)
├── content.js     # Page interaction (DOM manipulation)
├── popup.js       # Main UI (bookmark management)
└── gallery.js     # Export UI (gallery viewing)
```

#### Message API Design
```javascript
// Save bookmark
{ type: 'SAVE_URL', url: 'https://...' }

// Retrieve bookmarks  
{ type: 'GET_URLS' }

// Remove bookmark
{ type: 'DELETE_URL', url: 'https://...' }

// Cache invalidation
{ type: 'URLS_UPDATED' }
```

This architecture ensures robust, performant bookmark management while maintaining a clean separation of concerns across the extension's components. 