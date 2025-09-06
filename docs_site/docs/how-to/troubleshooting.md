# Troubleshooting Guide

This guide helps you resolve common issues with Midjourney Image Tracker. Most problems have simple solutions - let's get you back to bookmarking quickly!

## Quick Diagnostics

Start with these quick checks before diving into specific issues:

<div class="grid cards" markdown>

-   :material-check-circle-outline: **Extension Status**

    ---

    1. Go to `chrome://extensions/`
    2. Find "Midjourney Image Tracker"
    3. Ensure it's **enabled** and **up to date**

-   :material-web: **Page Compatibility**

    ---

    1. Verify you're on `*.midjourney.com`
    2. Check that images are from `cdn.midjourney.com`
    3. Try refreshing the page

-   :material-shield-check: **Permissions**

    ---

    1. Click extension icon → "Manage extensions"
    2. Click "Details" on Midjourney Image Tracker
    3. Verify "Site access" is enabled

-   :material-cached: **Clear Cache**

    ---

    1. Right-click extension icon
    2. Select "Reload extension" if available
    3. Or refresh the Midjourney page

</div>

## Common Issues & Solutions

### Bookmark Button Problems

#### Buttons Don't Appear on Images

??? question "No bookmark buttons show up when hovering"

    **Most Common Causes:**
    
    1. **Wrong domain**: Extension only works on `*.midjourney.com` 
       - ✅ `midjourney.com/create`
       - ❌ `discord.com/channels/...`
    
    2. **Not Midjourney images**: Only `cdn.midjourney.com` images get buttons
       - ✅ `cdn.midjourney.com/uuid/0_0.png`  
       - ❌ `example.com/uploaded-image.jpg`
    
    3. **Extension disabled**: Check `chrome://extensions/`
    
    **Solutions:**
    
    === "Check Domain"
        ```
        Current page: https://www.midjourney.com/explore ✅
        Extension should work here
        
        Current page: https://discord.com/... ❌  
        Extension doesn't work on Discord
        ```
    
    === "Refresh Extension"
        1. Go to `chrome://extensions/`
        2. Find Midjourney Image Tracker
        3. Click the refresh icon
        4. Refresh the Midjourney page
    
    === "Check Page Content"
        1. Right-click on an image
        2. Select "Inspect" or "Inspect Element"  
        3. Look for `cdn.midjourney.com` in the URL
        4. If not present, the extension won't work on that image

#### Buttons Appear But Don't Work

??? question "Bookmark buttons appear but clicking doesn't save"

    **Symptoms:**
    - Button appears on hover
    - Clicking has no effect
    - No success/error feedback
    
    **Solutions:**
    
    === "Extension Context Fix"
        Extension connection may be broken:
        
        1. **Reload the page**: Press `F5` or `Ctrl/Cmd + R`
        2. **Restart browser**: Close and reopen Chrome
        3. **Reload extension**: 
           - Go to `chrome://extensions/`
           - Click reload icon on Midjourney Image Tracker
    
    === "Check Developer Console"
        Look for error messages:
        
        1. Press `F12` to open DevTools
        2. Go to **Console** tab
        3. Look for red error messages
        4. If you see "Extension context invalidated" - reload the page
    
    === "Storage Issues"
        Check if storage is full:
        
        1. Click extension icon
        2. If popup is very slow, storage might be full
        3. Try exporting and clearing some bookmarks
        4. Chrome has a 5MB limit for extension storage

### Collection Management Issues

#### Bookmarks Not Saving

??? question "Clicked bookmark button but image not in collection"

    **Troubleshooting Steps:**
    
    1. **Check for confirmation**: Look for brief success message after clicking
    2. **Wait a moment**: Large collections may take time to update
    3. **Refresh popup**: Close and reopen extension popup
    4. **Check if duplicate**: Image might already be saved (button shows filled state)
    
    **Check Storage Usage:**
    ```javascript
    // Open DevTools Console on any Midjourney page
    chrome.runtime.sendMessage({ type: 'GET_EXTENSION_INFO' }, console.log);
    // Look for storageUsed in the response
    ```
    
    **If storage is nearly full (>4MB):**
    - Export your collection as backup
    - Clear older bookmarks you don't need
    - Consider organizing into multiple themed collections

#### Missing Bookmarks

??? question "Previously saved bookmarks have disappeared"

    **Possible Causes:**
    
    === "Browser Data Cleared"
        - **Check**: Did you recently clear browser data?
        - **Solution**: Restore from exported backup if available
        - **Prevention**: Export collections regularly
    
    === "Different Chrome Profile"
        - **Check**: Are you using a different Chrome profile?
        - **Solution**: Switch back to the correct profile
        - **Location**: Top-right corner of Chrome (profile picture/initial)
    
    === "Extension Reinstalled"
        - **Check**: Was the extension recently reinstalled?
        - **Solution**: Data is lost when extension is removed
        - **Prevention**: Always export before uninstalling
    
    === "Chrome Sync Issues"
        - **Check**: Is Chrome sync enabled but not working?
        - **Solution**: 
          1. Chrome Settings → Sync and Google services
          2. Check if "Extensions" sync is enabled
          3. Try manually syncing or sign out/in to Google account

### Export Problems {#export-issues}

#### HTML Gallery Issues

??? question "Exported HTML gallery doesn't display properly"

    **Common Issues:**
    
    === "Images Not Loading"
        **Cause**: Internet connection required for images
        
        **Solution**: 
        - Ensure you have internet when viewing gallery
        - Images are hosted on Midjourney's CDN, not embedded
        - Gallery works offline for layout, but needs internet for images
    
    === "File Won't Open"
        **Cause**: Browser security restrictions
        
        **Solutions**:
        1. **Try different browser**: Firefox or Safari often work better
        2. **Use local server**: 
           ```bash
           # If you have Python installed
           python -m http.server 8000
           # Then open http://localhost:8000/your-gallery.html
           ```
        3. **Upload to web hosting**: Put file on any web server
    
    === "Styling Issues"
        **Cause**: CSS not loading properly
        
        **Solution**:
        - Don't move the HTML file after export
        - If you must move it, keep it in the same folder structure
        - Try re-exporting to fix corrupted files

#### Text Export Issues

??? question "Text export is empty or malformed"

    **Troubleshooting:**
    
    1. **Check collection**: Ensure you have bookmarks saved
    2. **File encoding**: Open with text editor that supports UTF-8
    3. **Line endings**: Different OS may display differently (normal)
    4. **Re-export**: Try exporting again if file seems corrupted

### Performance Issues

#### Slow Loading

??? question "Extension popup takes a long time to load"

    **Causes & Solutions:**
    
    === "Large Collection"
        **If you have 500+ bookmarks:**
        
        - Loading is normal but slow
        - Consider exporting and clearing some bookmarks  
        - Organize into smaller themed collections
        - Be patient - extension is loading all thumbnails
    
    === "Network Issues"
        **If thumbnails won't load:**
        
        - Check internet connection
        - Midjourney CDN might be slow
        - Try again later
        - Thumbnails are loaded from Midjourney servers
    
    === "Browser Performance"  
        **If Chrome is slow overall:**
        
        - Close unnecessary tabs
        - Restart Chrome
        - Clear browser cache
        - Check for Chrome updates

#### High Memory Usage

??? question "Chrome using too much memory with extension"

    **Memory Optimization:**
    
    1. **Limit collection size**: Export and clear old bookmarks
    2. **Close unused tabs**: Each tab with bookmarks uses memory
    3. **Restart browser**: Fresh start clears accumulated memory
    4. **Monitor usage**: Use Chrome Task Manager (`Shift + Esc`)

## Advanced Troubleshooting

### Developer Tools Debugging

For technical users who want to investigate issues:

#### Enable Extension Console Logging

1. **Background Script Console**:
   - Go to `chrome://extensions/`
   - Click "Inspect views: service worker" under Midjourney Image Tracker
   - Check Console tab for messages

2. **Content Script Console**:
   - Press `F12` on any Midjourney page
   - Go to Console tab
   - Look for messages from the extension

#### Common Error Messages

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| `Extension context invalidated` | Connection lost to extension | Refresh page |
| `chrome.runtime.lastError` | Communication failure | Restart browser |
| `Failed to fetch` | Network connectivity issue | Check internet |
| `Storage quota exceeded` | Too much data stored | Export and clear bookmarks |

### Manual Fixes

#### Reset Extension Data

!!! warning "Data Loss Warning"
    
    This will delete all bookmarks. Export first!

```javascript
// Open DevTools Console on any Midjourney page
chrome.runtime.sendMessage({ type: 'CLEAR_ALL_URLS' }, console.log);
```

#### Check Storage Usage

```javascript
// Check how much storage is being used
chrome.runtime.sendMessage({ type: 'GET_EXTENSION_INFO' }, (info) => {
  console.log(`Storage used: ${info.data.storageUsed} bytes`);
  console.log(`Collection size: ${Math.floor(info.data.storageUsed / 1024)}KB`);
});
```

#### Force Cache Refresh

```javascript
// Force content script to refresh its cache
chrome.runtime.sendMessage({ type: 'URLS_UPDATED' });
```

## Browser-Specific Issues

### Chrome Issues

**Manifest V3 Changes**: This extension uses the latest standards
- **Older Chrome versions** (<88): Extension won't work
- **Solution**: Update Chrome to latest version

**Extension Sync**: If bookmarks aren't syncing across devices
- **Check**: Chrome Settings → Sync → Extensions enabled
- **Solution**: Sign out and back into Chrome account

### Edge/Chromium Issues

**Compatibility**: Extension works on Chromium-based browsers
- **Installation**: May need to enable "Allow extensions from other stores"
- **Features**: All features should work identically to Chrome

### Unsupported Browsers

**Firefox/Safari**: Extension is Chrome-only currently
- **Alternative**: Use browser bookmarks as temporary solution
- **Planned**: Firefox version may be developed in future

## Getting Additional Help

### Self-Help Resources

1. **[User Guide](../getting-started/user-guide.md)**: Comprehensive usage instructions
2. **[Quick Start](../getting-started/quick-start.md)**: Basic workflow reminder
3. **[Installation Guide](../getting-started/installation.md)**: Setup troubleshooting

### Community Support

If problems persist after trying these solutions:

1. **GitHub Issues**: [Report a bug](https://github.com/dagny099/mj-extension/issues/new?template=bug_report.md)
2. **Include Details**: 
   - Chrome version
   - Extension version  
   - Exact error messages
   - Steps to reproduce
   - Screenshots if helpful

3. **Feature Requests**: [Suggest improvements](https://github.com/dagny099/mj-extension/issues/new?template=feature_request.md)

### Emergency Data Recovery

If you've lost important bookmarks:

1. **Check Chrome Sync**: Data might be in cloud backup
2. **Local Backups**: Look for previously exported files
3. **Browser History**: Use Chrome history to find previously visited images
4. **Midjourney Account**: Check your Midjourney creation history

---

Remember: Most issues are resolved by refreshing the page or restarting the browser. The extension is designed to be robust, but browser extensions sometimes lose their connection and need a fresh start.