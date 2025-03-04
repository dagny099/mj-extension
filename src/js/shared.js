// shared.js

/**
 * Standardizes Midjourney URLs to a consistent format
 * Converts various URL formats to https://cdn.midjourney.com/{uuid}/{position}.jpeg
 * 
 * @param {string} url - The URL to standardize
 * @return {string} - The standardized URL
 */
function standardizeMidjourneyUrl(url) {
    if (!url) return url;

    // Convert to lowercase for consistency
    url = url.toLowerCase();

    // Remove any query parameters (e.g., ?someParam=value)
    url = url.split('?')[0];

    // Extract UUID from Midjourney URLs
    const uuidPattern = /cdn\.midjourney\.com\/([a-f0-9-]{36})/i;
    const uuidMatch = url.match(uuidPattern);
    
    if (!uuidMatch) return url; // Not a valid Midjourney URL

    const uuid = uuidMatch[1];

    // Extract position (e.g., /0_0, /1_2, grid_0, etc.)
    const posPattern = /\/(\d+_\d+|grid_\d+)/;
    const posMatch = url.match(posPattern);
    
    if (posMatch) {
        const position = posMatch[1];
        return `https://cdn.midjourney.com/${uuid}/${position}.jpeg`;
    }

    // Fallback: If no position pattern is found, return a base standard URL
    return `https://cdn.midjourney.com/${uuid}/default.jpeg`;
}

/**
 * Checks if a URL is from Midjourney and has the expected UUID format
 * 
 * @param {string} url - The URL to check
 * @return {boolean} - True if the URL is a Midjourney image URL
 */
function isMidjourneyImage(url) {
    if (!url) return false;
    return url.includes('cdn.midjourney.com') && url.match(/[a-f0-9-]{36}/i);
}

// Make these functions available in the global scope
// This approach works for Chrome extensions without needing import/export
if (typeof window !== 'undefined') {
    window.standardizeMidjourneyUrl = standardizeMidjourneyUrl;
    window.isMidjourneyImage = isMidjourneyImage;
}