/**
 * background.js
 * * Manages extension lifecycle events and application state.
 * This script runs in the background and controls logic independent of web page content.
 */

// Listener fires when the extension is first installed, updated, or Chrome is updated.
chrome.runtime.onInstalled.addListener((details) => {
    // Check if the extension was just installed.
    if (details.reason === 'install') {
        // Retrieve a flag from local storage to check if the welcome page has been displayed.
        chrome.storage.local.get('has_seen_welcome', (data) => {
            // If the flag is not set (i.e., this is the first install), open the welcome page.
            if (!data.has_seen_welcome) {
                chrome.tabs.create({ url: 'welcome.html' });
                // Set the flag to prevent the welcome page from opening on subsequent updates.
                chrome.storage.local.set({ has_seen_welcome: true });
            }
        });
    }
});