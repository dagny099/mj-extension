// gallery.js 

document.addEventListener('DOMContentLoaded', () => {
    // Fetch stored URLs from Chrome storage
    chrome.runtime.sendMessage({ type: 'GET_URLS' }, (response) => {
        if (!response || !response.urls || response.urls.length === 0) {
            document.getElementById('gallery').innerHTML = "<p style='text-align: center;'>No bookmarked images.</p>";
            return;
        }

        document.getElementById('exportTimestamp').textContent = `Exported on ${new Date().toLocaleString()}`;

        // Create gallery images - assuming we get an array of URL strings
        document.getElementById('gallery').innerHTML = response.urls.map(url => `
            <div class="item">
                <a href="${url}" target="_blank">
                    <img src="${url}" alt="Midjourney Image">
                </a>
                <div class="item-footer">
                    <a href="${url}" target="_blank">${url}</a>
                </div>
            </div>
        `).join('');
    });

    // Implement "Download This Page" with timestamped filename
    document.getElementById('downloadGallery').addEventListener('click', () => {
        // Create a timestamp in YYYY-MM-DD-HHMM format
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
        
        // Create filename with timestamp
        const filename = `midjourney-gallery-${timestamp}.html`;
        
        // Create the blob and download it
        const blob = new Blob([document.documentElement.outerHTML], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});