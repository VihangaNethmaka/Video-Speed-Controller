// Identifies the active tab to send messages to its content script
async function getActiveTab() {
    // Queries the currently active tab in the current window
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

// Sends a message to the content script and handles the response
async function sendMessageToContent(action, value = null) {
    const tab = await getActiveTab();
    // Exit if no active tab is found (e.g., popup opened on a chrome:// page)
    if (!tab) return;

    try {
        // 1. Send the command to the content script (in the active tab)
        const response = await chrome.tabs.sendMessage(tab.id, { action: action, value: value });
        
        // 2. Handle the successful response from the content script (which returns the new speed)
        if (response && response.newSpeed) {
            updateSpeedDisplay(response.newSpeed);
            // Update status message for success
            const statusElement = document.getElementById('status-message');
            statusElement.textContent = `Speed is ${response.newSpeed}X.`;
            statusElement.classList.remove('text-red-500');
            statusElement.classList.add('text-gray-400');
            // Note: Removed redundant class manipulation from original, relying on the state change.
        } else if (response && response.error) {
            // Handle error response from content script (e.g., no video found)
            updateSpeedDisplay("--");
            const statusElement = document.getElementById('status-message');
            statusElement.textContent = response.error;
            statusElement.classList.add('text-red-500');
            statusElement.classList.remove('text-gray-400');
        }
    } catch (error) {
        // Handle communication errors (e.g., content script isn't injected, permission issues)
        updateSpeedDisplay("--");
        const statusElement = document.getElementById('status-message');
        statusElement.textContent = 'Error: Cannot communicate. Try refreshing the page.';
        statusElement.classList.add('text-red-500');
        statusElement.classList.remove('text-gray-400');
        console.error("Communication error:", error);
    }
}

// Updates the speed shown in the popup UI
function updateSpeedDisplay(speed) {
    const speedElement = document.getElementById('current-speed');
    if (speedElement) {
        // Format the speed to one decimal place, or use the default placeholder
        const formattedSpeed = speed && !isNaN(speed) ? parseFloat(speed).toFixed(1) : '--';
        speedElement.textContent = `${formattedSpeed}X`;
    }
}

// Initializes button listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial fetch of current speed when popup opens
    sendMessageToContent('GET_SPEED');
    
    // --- Control Buttons ---
    // Increase speed by 0.1X
    document.getElementById('increase-btn').addEventListener('click', () => {
        sendMessageToContent('INCREASE');
    });

    // Decrease speed by 0.1X
    document.getElementById('decrease-btn').addEventListener('click', () => {
        sendMessageToContent('DECREASE');
    });

    // Toggle between 1.0X and previous speed
    document.getElementById('toggle-btn').addEventListener('click', () => {
        sendMessageToContent('TOGGLE');
    });

    // --- Preset Buttons ---
    // Attaches listeners to all preset buttons
    document.querySelectorAll('.preset-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            // Read the speed value from the data-speed attribute
            const speed = parseFloat(event.target.dataset.speed);
            sendMessageToContent('SET_SPEED', speed);
        });
    });
});