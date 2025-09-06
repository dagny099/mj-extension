# Installation Guide

Get Midjourney Image Tracker up and running in just a few minutes. Choose your preferred installation method below.

## Chrome Web Store Installation (Recommended)

!!! info "Coming Soon"
    The extension is currently under review for the Chrome Web Store. This section will be updated with the direct installation link once approved.

<div class="installation-step">
  <div class="step-number">1</div>
  <div class="step-content">
    <strong>Visit Chrome Web Store</strong><br>
    Navigate to the Midjourney Image Tracker listing in the Chrome Web Store.
  </div>
</div>

<div class="installation-step">
  <div class="step-number">2</div>
  <div class="step-content">
    <strong>Add to Chrome</strong><br>
    Click "Add to Chrome" and confirm the installation when prompted.
  </div>
</div>

<div class="installation-step">
  <div class="step-number">3</div>
  <div class="step-content">
    <strong>Start Bookmarking</strong><br>
    Visit Midjourney and start bookmarking your favorite images immediately.
  </div>
</div>

## Developer Installation

For early access, development, or if you prefer to install from source:

### Prerequisites

- Google Chrome browser (version 88 or higher)
- Basic familiarity with Chrome extensions

### Installation Steps

<div class="installation-step">
  <div class="step-number">1</div>
  <div class="step-content">
    <strong>Download the Extension</strong><br>
    <a href="https://github.com/dagny099/mj-extension/archive/main.zip" class="md-button">Download ZIP</a>
    <br><br>
    Or clone the repository:
    <pre><code>git clone https://github.com/dagny099/mj-extension.git</code></pre>
  </div>
</div>

<div class="installation-step">
  <div class="step-number">2</div>
  <div class="step-content">
    <strong>Extract Files</strong><br>
    If you downloaded the ZIP file, extract it to a folder on your computer. Remember the location.
  </div>
</div>

<div class="installation-step">
  <div class="step-number">3</div>
  <div class="step-content">
    <strong>Open Chrome Extensions</strong><br>
    In Chrome, navigate to <code>chrome://extensions/</code> or use the menu:
    <em>Chrome menu → More Tools → Extensions</em>
  </div>
</div>

<div class="installation-step">
  <div class="step-number">4</div>
  <div class="step-content">
    <strong>Enable Developer Mode</strong><br>
    Toggle the "Developer mode" switch in the top-right corner of the extensions page.
  </div>
</div>

<div class="installation-step">
  <div class="step-number">5</div>
  <div class="step-content">
    <strong>Load Unpacked Extension</strong><br>
    Click "Load unpacked" and select the folder containing the extension files.
  </div>
</div>

<div class="installation-step">
  <div class="step-number">6</div>
  <div class="step-content">
    <strong>Verify Installation</strong><br>
    You should see the Midjourney Image Tracker icon in your Chrome toolbar.
  </div>
</div>

## Permissions Explained

When installing the extension, Chrome will request these permissions:

!!! info "Required Permissions"

    **ActiveTab** - Allows the extension to interact with the current tab when you click the extension icon
    
    **Storage** - Enables saving your bookmarked images locally in Chrome
    
    **Downloads** - Required for exporting your gallery as HTML or text files
    
    **Tabs** - Needed to detect when you're on Midjourney pages

!!! success "Privacy First"
    
    The extension only requests access to `*.midjourney.com` domains and stores all data locally in your browser. No external servers are contacted.

## Verification

After installation, verify everything is working:

1. **Visit Midjourney**: Go to [midjourney.com](https://midjourney.com)
2. **Test Hover**: Hover over any image to see the bookmark button
3. **Check Extension**: Click the extension icon to view your (empty) bookmarks list

## Troubleshooting Installation

### Extension Not Visible

If the extension icon doesn't appear in your toolbar:

1. Click the extensions puzzle piece icon in Chrome's toolbar
2. Find "Midjourney Image Tracker" in the list
3. Click the pin icon to pin it to your toolbar

### Permission Issues

If you see permission errors:

1. Go to `chrome://extensions/`
2. Find Midjourney Image Tracker
3. Click "Details" → "Extension options"
4. Verify all required permissions are granted

### Manifest Version Issues

This extension uses Manifest V3 (the latest standard). If you see manifest-related errors, ensure you're using Chrome 88 or higher.

## Updating the Extension

### Chrome Web Store Updates
Extensions from the Chrome Web Store update automatically. Chrome will notify you when updates are available.

### Developer Installation Updates
For manual installations:

1. Download the latest version from GitHub
2. Replace the old extension folder with the new one
3. Go to `chrome://extensions/`
4. Click the refresh icon on the Midjourney Image Tracker card

## Uninstalling

To remove the extension:

1. Go to `chrome://extensions/`
2. Find Midjourney Image Tracker
3. Click "Remove" and confirm

!!! warning "Data Loss"
    
    Uninstalling will permanently delete all your bookmarked images. Consider exporting your gallery first if you want to keep your collection.

## Next Steps

Ready to start bookmarking? Check out our [Quick Start Guide](quick-start.md) to learn the basics in 2 minutes.

For detailed usage instructions, see the [User Guide](user-guide.md).