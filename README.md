# Midjourney Image Tracker - Chrome Extension

A Chrome extension for tracking and saving Midjourney-generated images with metadata support.

## Features

- Automatically detects Midjourney images on the page
- Adds "Save Image URL" context menu item for right-click actions
- Tracks image URLs, job IDs, and timestamps
- Saves session data to local text files
- Prevents duplicate tracking within sessions
- Includes basic metadata enrichment framework

## Requirements

### Development Environment
- Google Chrome (version 88 or later)
- Text editor (VS Code recommended)
- Basic understanding of:
  - JavaScript (ES6+)
  - Chrome Extension APIs
  - HTML/CSS
  - Async/await patterns
  - JSON

### Chrome APIs Used
- `chrome.contextMenus`
- `chrome.downloads`
- `chrome.runtime`
- `chrome.storage` (for future use)

## Project Structure

```
midjourney-extension/
├── manifest.json      # Extension configuration
├── shared.js         # Shared utilities
├── background.js     # Background service worker
├── content.js        # Content script for page interaction
├── popup.html        # Extension popup interface
├── popup.js          # Popup functionality
└── README.md         # Documentation
```

## Installation (Development)

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd midjourney-extension
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `midjourney-extension` directory

3. Verify installation:
   - Extension icon should appear in Chrome toolbar
   - Visit Midjourney website
   - Right-click an image to see "Save Image URL" option

## Usage

1. Visit Midjourney website and log in
2. Extension will automatically track images as you browse
3. Right-click any image to save its data
4. Click extension icon to see tracking summary
5. Use "Save Session" to download tracked data

## Development Notes

### Key Files and Their Purposes

- `manifest.json`: Defines extension structure and permissions
- `shared.js`: Contains utility functions and data validation
- `content.js`: Handles page interaction and image detection
- `background.js`: Manages context menu and file downloads
- `popup.html/js`: Provides user interface for session management


### Error Handling

The extension implements basic error handling for:
- Invalid image URLs
- Failed downloads
- Message passing errors


## Deployment

### Testing
1. Manual testing checklist:
   - Image detection
   - Context menu functionality
   - File downloads
   - Popup interface
   - Error scenarios

2. Cross-version testing:
   - Test on Chrome stable and beta
   - Verify manifest V3 compatibility


### Publishing to Chrome Web Store

1. Prepare for submission:
   - Create 128x128 icon
   - Write detailed description
   - Take screenshots
   - Create promotional materials

2. Create package:
   - ZIP extension directory
   - Remove development files

3. Submit to Chrome Web Store:
   - Create developer account
   - Pay one-time registration fee
   - Upload package
   - Provide store listing details
   - Submit for review

4. Post-publication:
   - Monitor user feedback
   - Track error reports
   - Plan updates


## Future Enhancements

1. Immediate Roadmap:
   - Integration with Vision API metadata
   - Local storage implementation
   - Enhanced error reporting
   - User configuration options

2. Planned Features:
   - Batch download support
   - Custom metadata fields
   - Export format options
   - Session management


## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
Your Name - @dagny099

Project Link: https://github.com/dagny099/midjourney-toolkit

