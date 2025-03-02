# URL Standardization Guide

One of the core features of the Midjourney Image Tracker is its ability to standardize URLs, ensuring that the same image is recognized consistently regardless of how it appears on the page. This document explains the URL standardization process in detail.

**KEY INFO IN THIS DOCUMENT:**  
- Process visualization of how URLs are standardized
- Code walkthrough with examples and edge cases
- Integration points showing where standardization is used
- Test cases for verification
- Future improvement possibilities

## Why URL Standardization Matters

Midjourney presents the same image in multiple formats across its interface:

![URL Variations Example](./images/url-variations.png)

For example, the same image might appear as:

- Thumbnail on the gallery page: `https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0_640_N.webp?method=shortest`
- Full-size view: `https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0.png`
- Grid view: `https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/grid_0.png`

Without standardization, these would be treated as separate images, leading to:
- Duplicate bookmarks for the same image
- Inconsistent bookmark status indicators
- Confusion when managing bookmarks

## The Standardization Process

The URL standardization process consists of three main steps:

![URL Standardization Process](./images/url-standardization-process.png)

### 1. UUID Extraction

First, we extract the unique identifier (UUID) from the URL:

```javascript
const uuidPattern = /cdn\.midjourney\.com\/([a-f0-9-]{36})/i;
const uuidMatch = url.match(uuidPattern);

if (!uuidMatch) return url; // Not a Midjourney URL with UUID

const uuid = uuidMatch[1];
```

The UUID is a 36-character string that uniquely identifies the generation job, for example:
`cc4c6c46-bd2a-41da-92c0-a36c2bd2766f`

### 2. Position Pattern Identification

Next, we identify the position pattern that indicates which part of the grid is shown:

```javascript
const posPattern = /\/(\d+_\d+|grid_\d+)/;
const posMatch = url.match(posPattern);

if (!posMatch) return url; // No position pattern found

const position = posMatch[1];
```

Common position patterns include:
- `0_0`, `0_1`, `1_0`, `1_1` - Individual grid positions
- `grid_0` - Full grid view

### 3. URL Reconstruction

Finally, we reconstruct the URL in a standardized format:

```javascript
return `https://cdn.midjourney.com/${uuid}/${position}.jpeg`;
```

This gives us a consistent format that always points to the same image content.

## URL Format Examples

| Original URL | Standardized URL |
|--------------|------------------|
| `https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0_640_N.webp?method=shortest` | `https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0.jpeg` |
| `https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0.png` | `https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0.jpeg` |
| `https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/grid_0.png` | `https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/grid_0.jpeg` |

## Implementation Details

### Complete Function Implementation

```javascript
/**
 * Standardizes Midjourney URLs to a consistent format
 * Converts various URL formats to https://cdn.midjourney.com/{uuid}/{position}.jpeg
 * 
 * @param {string} url - The URL to standardize
 * @return {string} - The standardized URL
 */
function standardizeMidjourneyUrl(url) {
    if (!url) return url;
    
    // Extract the UUID and position part
    const uuidPattern = /cdn\.midjourney\.com\/([a-f0-9-]{36})/i;
    const uuidMatch = url.match(uuidPattern);
    
    if (!uuidMatch) return url; // Not a Midjourney URL with UUID
    
    const uuid = uuidMatch[1];
    
    // Find the position pattern (e.g., /0_0, /1_2, grid_0, etc.)
    const posPattern = /\/(\d+_\d+|grid_\d+)/;
    const posMatch = url.match(posPattern);
    
    if (posMatch) {
        const position = posMatch[1];
        return `https://cdn.midjourney.com/${uuid}/${position}.jpeg`;
    }
    
    // If no position match found, return original
    return url;
}
```

### Integration Points

The URL standardization function is used at several key points in the extension:

1. **When detecting if an image is already bookmarked**
   ```javascript
   const standardizedImgUrl = standardizeMidjourneyUrl(img.src);
   const isAlreadySaved = savedUrls.has(standardizedImgUrl);
   ```

2. **When saving a new bookmark**
   ```javascript
   // In background.js
   case 'SAVE_URL':
       const standardizedUrl = standardizeMidjourneyUrl(message.url);
       // Check if URL already exists
       if (savedUrls.has(standardizedUrl)) {
           sendResponse({ success: false, message: 'URL already saved' });
           return true;
       }
       // Add new URL
       savedUrls.add(standardizedUrl);
       // ...
   ```

3. **When removing a bookmark**
   ```javascript
   // In background.js
   case 'REMOVE_URL':
       const urlToRemove = standardizeMidjourneyUrl(message.url);
       savedUrls.delete(urlToRemove);
       // ...
   ```

4. **When displaying bookmarks in the popup**
   ```javascript
   // In popup.js
   urlList.innerHTML = urls.map(({ url, timestamp }) => {
       const standardizedUrl = standardizeMidjourneyUrl(url);
       return `
           <div class="url-item">
               <img src="${standardizedUrl}" alt="thumbnail" class="thumbnail">
               <div class="url-text">${standardizedUrl}</div>
               <button class="remove-url" data-url="${standardizedUrl}">×</button>
           </div>
       `;
   }).join('');
   ```

## Edge Cases and Handling

### Handling Non-Midjourney URLs

If a URL doesn't match the expected Midjourney pattern, the function returns the original URL unchanged:

```javascript
if (!uuidMatch) return url; // Not a Midjourney URL with UUID
```

### Handling Missing Position Patterns

If a URL has a valid UUID but no recognizable position pattern, the function returns the original URL:

```javascript
if (!posMatch) return url; // No position pattern found
```

### Verification

To verify that URL standardization is working correctly:

1. Bookmark an image from the thumbnail view
2. Navigate to the same image in full-size view
3. The bookmark button should show as "already bookmarked"
4. Check the popup to confirm only one entry exists for this image

## Test Cases

Here are some test cases to verify the URL standardization function:

```javascript
// Test basic thumbnail URL
test("https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0_640_N.webp?method=shortest")
// Expected: "https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_0.jpeg"

// Test PNG format
test("https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_1.png")
// Expected: "https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/0_1.jpeg"

// Test grid view
test("https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/grid_0.png")
// Expected: "https://cdn.midjourney.com/cc4c6c46-bd2a-41da-92c0-a36c2bd2766f/grid_0.jpeg"
```

## Future Improvements

### Pattern Recognition Enhancements

Future versions could improve pattern recognition for:

- Additional position formats
- Special view types
- Variant indicators

### Metadata Extraction

The URL standardization process could be extended to extract metadata:

```javascript
function extractMidjourneyMetadata(url) {
    const standardUrl = standardizeMidjourneyUrl(url);
    if (standardUrl === url) return null;
    
    const uuidPattern = /cdn\.midjourney\.com\/([a-f0-9-]{36})/i;
    const uuidMatch = url.match(uuidPattern);
    const uuid = uuidMatch[1];
    
    const posPattern = /\/(\d+_\d+|grid_\d+)/;
    const posMatch = url.match(posPattern);
    const position = posMatch[1];
    
    return {
        uuid,
        position,
        standardUrl,
        originalUrl: url,
        timestamp: Date.now()
    };
}
```

### Performance Optimization

For applications dealing with large numbers of URLs, performance could be improved by:

1. Caching previously standardized URLs
2. Using compiled regular expressions
3. Early-exit optimizations for common cases

## Troubleshooting

### Common Issues

1. **URL Not Standardizing**
   - Check if the URL matches the expected Midjourney format
   - Verify the UUID is valid (36 characters in the expected format)
   - Ensure the position pattern is recognized

2. **Inconsistent Bookmark Status**
   - Ensure URL standardization is applied consistently across all components
   - Check for any custom URL handling that might bypass standardization

3. **Same Image Shows as Different Bookmarks**
   - Verify the standardization function correctly identifies position patterns
   - Ensure saved URLs in storage are also standardized

## Conclusion

URL standardization is a critical feature that ensures consistent behavior when tracking Midjourney images. By converting various URL formats to a standard format, the extension can recognize the same image across different views and prevent duplicate bookmarks.

Understanding the URL standardization process helps with debugging, extending the extension, and ensuring proper functionality across all Midjourney URL variants.