# Quick Start Guide

Get up and running with Midjourney Image Tracker in 2 minutes. This guide covers the essential workflow to start building your collection.

## The 3-Step Workflow

<div class="grid cards" markdown>

-   :material-numeric-1-circle: **Browse**

    ---

    Visit any Midjourney page with images (Create, Explore, Community, etc.)

-   :material-numeric-2-circle: **Hover**

    ---

    Move your mouse over any image to reveal the bookmark button

-   :material-numeric-3-circle: **Save**

    ---

    Click the bookmark button to add the image to your collection

</div>

## Your First Bookmark

Let's bookmark your first Midjourney image:

### 1. Navigate to Midjourney

Visit [midjourney.com](https://midjourney.com) and browse to any page with images:

- **Create**: Your generated images
- **Explore**: Trending public creations  
- **Community**: Recent community posts

### 2. Find an Image You Like

Scroll through the available images and find one you'd like to save.

### 3. Hover to Reveal Button

Move your mouse cursor over the image. You'll see a small bookmark button appear:

!!! tip "Button Appearance"
    The bookmark button appears as a small icon in the corner of the image. It only shows when you hover over images that the extension recognizes as Midjourney content.

### 4. Click to Bookmark

Click the bookmark button. You'll see a brief confirmation that the image has been saved.

## Viewing Your Collection

Now let's see your saved bookmark:

### 1. Open Extension Popup

Click the Midjourney Image Tracker icon in your Chrome toolbar (next to the address bar).

### 2. See Your Bookmark

Your popup will show:
- A thumbnail of your saved image
- The total count of bookmarks
- Options to view gallery or export

### 3. Optional: View Full Gallery

Click "View Gallery" to see all your bookmarks in a full-screen, organized layout.

## Understanding URL Standardization {#how-detection-works}

!!! success "Smart Duplicate Prevention"

    The extension automatically prevents duplicate bookmarks through intelligent URL standardization. If you bookmark the same image in different formats (thumbnail, full-size, grid), it will only save one copy.

Here's what happens behind the scenes:

=== "Thumbnail URLs"
    ```
    cdn.midjourney.com/uuid/0_0_640_N.webp?method=shortest
    ```
    Becomes: `cdn.midjourney.com/uuid/0_0.jpeg`

=== "Full-size URLs"
    ```
    cdn.midjourney.com/uuid/0_0.png
    ```
    Becomes: `cdn.midjourney.com/uuid/0_0.jpeg`

=== "Grid URLs"
    ```
    cdn.midjourney.com/uuid/grid_0.png
    ```
    Becomes: `cdn.midjourney.com/uuid/0_0.jpeg`

## Essential Controls

### Removing Bookmarks

To remove a bookmark:

1. Open the extension popup
2. Find the bookmark you want to remove
3. Click the "×" button next to it

### Exporting Your Collection

To export your bookmarks:

1. Open the extension popup
2. Click "Export Gallery" for a standalone HTML file
3. Or click "Export URLs" for a simple text file

### Clearing All Bookmarks

!!! warning "Permanent Action"
    
    This cannot be undone. Consider exporting first.

1. Open the extension popup
2. Click "Clear All"
3. Confirm when prompted

## Best Practices

### Organized Bookmarking

- **Bookmark as you browse**: Save images immediately when you find them
- **Regular exports**: Export your gallery periodically as backup
- **Quality over quantity**: Be selective to maintain a curated collection

### Performance Tips

- The extension works best with a stable internet connection
- Large collections (1000+ bookmarks) may take a moment to load
- Export galleries work offline once saved

## Common Questions

??? question "Why don't all images show the bookmark button?"

    The extension only works on images hosted by Midjourney. Third-party images or screenshots won't show the bookmark button.

??? question "Can I bookmark images from mobile?"

    Currently, the extension only works on Chrome desktop. Mobile support may be added in future versions.

??? question "Where are my bookmarks stored?"

    All bookmarks are stored locally in your Chrome browser. They don't sync across devices unless you use Chrome's sync feature.

??? question "What happens if I clear my browser data?"

    Clearing Chrome's storage data will delete your bookmarks. Always export your gallery before clearing browser data.

## Next Steps

Now that you know the basics:

- **[User Guide](user-guide.md)**: Learn advanced features and detailed workflows
- **[Features Overview](../features/index.md)**: Explore all extension capabilities
- **[Troubleshooting](../how-to/troubleshooting.md)**: Get help with common issues

Ready to build your collection? Start browsing Midjourney and bookmark your favorite creations!