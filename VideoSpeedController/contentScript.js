/**
 * contentScript.js
 * * Injects into the webpage to find and control the HTML5 video element.
 * Handles keyboard shortcuts and communication with the extension popup.
 */

// --- Configuration Constants ---
const SPEED_INCREMENT = 0.1;
const MAX_SPEED = 12.0;
const MIN_SPEED = 0.1;
const MIN_DECREASE_SPEED = 0.2; // Lowest speed limit when using the 'x' decrease key

// --- Global State Variables ---
let videoElement = null;
let currentSpeed = 1.0;
let previousSpeed = 1.0;
let overlayElement = null;
let messageTimeout = null;

// ----------------------------------------------------------------------
// --- CORE DOM MANIPULATION AND UTILITIES ---
// ----------------------------------------------------------------------

/**
 * Removes persistent UI elements (overlay, feedback message) from the DOM.
 * Necessary for single-page applications to prevent element duplication on navigation.
 */
function cleanupExistingElements() {
    ['feedback-message', 'speed-overlay'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.remove();
        }
    });
    // Reset the local reference to force recreation on next update.
    overlayElement = null;
}


/**
 * Identifies the main video element on the page by finding the largest, ready video.
 * @returns {HTMLVideoElement | null} The primary video element.
 */
function findVideo() {
    const videos = Array.from(document.querySelectorAll('video'));
    if (videos.length === 0) return null;

    let largestVideo = null;
    let largestArea = 0;

    for (const video of videos) {
        const area = video.clientWidth * video.clientHeight;
        // Check size and ensure the video has loaded at least metadata (readyState >= 1).
        if (area > largestArea && video.readyState >= 1) {
            largestArea = area;
            largestVideo = video;
        }
    }

    return largestVideo;
}

/**
 * Applies the requested playback rate to the video element, enforcing limits.
 * @param {number} newRate The target speed.
 * @returns {boolean} True if speed was applied.
 */
function setSpeed(newRate) {
    if (!videoElement) {
        videoElement = findVideo();
        if (!videoElement) {
            displayMessage("No video found on the page.", "bg-red-600");
            return false;
        }
    }

    // Store the current non-default speed as the previous speed before changing.
    if (newRate.toFixed(1) !== currentSpeed.toFixed(1) && currentSpeed.toFixed(1) !== '1.0') {
        previousSpeed = currentSpeed;
    }

    // Apply global speed limits.
    newRate = Math.min(Math.max(newRate, MIN_SPEED), MAX_SPEED);

    // Set the speed, rounded to one decimal place for consistency.
    currentSpeed = Math.round(newRate * 10) / 10;
    videoElement.playbackRate = currentSpeed;

    updateOverlay();
    return true;
}

/**
 * Displays a temporary UI feedback message, typically after a speed change.
 * Uses Tailwind CSS utility classes for styling (injected at the end of the script).
 * @param {string} text The message content.
 * @param {string} bgColor Tailwind CSS class for background color.
 */
function displayMessage(text, bgColor = "bg-indigo-600") {
    let messageElement = document.getElementById('feedback-message');
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.id = 'feedback-message';
        // Apply fixed, centered, high Z-index styling.
        messageElement.className = `fixed top-10 left-1/2 transform -translate-x-1/2 
                                     p-2 px-4 text-white text-base font-semibold 
                                     rounded-full shadow-lg opacity-0 scale-90 
                                     transition-all duration-150 ease-out z-[2147483648] 
                                     pointer-events-none`;
        document.body.appendChild(messageElement);
    }

    clearTimeout(messageTimeout);

    // Update message content and color class.
    messageElement.textContent = text;
    messageElement.className = messageElement.className.replace(/bg-[a-z]+-[0-9]+/g, bgColor);

    // Show message with transition.
    messageElement.style.opacity = 1;
    messageElement.style.transform = 'translate(-50%, 0) scale(1)';

    // Set timeout to hide the message.
    messageTimeout = setTimeout(() => {
        messageElement.style.opacity = 0;
        messageElement.style.transform = 'translate(-50%, 0) scale(0.9)';
    }, 800);
}

/**
 * Creates or updates the persistent speed indicator overlay in the bottom-left corner.
 */
function updateOverlay() {
    if (!overlayElement) {
        overlayElement = document.createElement('div');
        overlayElement.id = 'speed-overlay';

        // Apply critical fixed positioning and high Z-index via inline styles (using !important to override site styles).
        overlayElement.style.cssText = `
            position: fixed !important; 
            bottom: 16px !important; 
            left: 16px !important;
            z-index: 2147483647 !important;
            padding: 8px;
            color: white; 
            font-size: 1.125rem; 
            font-weight: 600;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); 
            background-color: rgba(4, 4, 4, 0.8);
            transition: opacity 0.5s ease-in-out;
        `;

        // Embed SVG icon and text container.
        overlayElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" 
                     style="height: 20px; width: 20px; color: #4dc0b5; fill: currentColor;" 
                     viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clip-rule="evenodd" />
                </svg>
                <span id="speed-display">1.0X</span>
            </div>
        `;
        document.body.appendChild(overlayElement);
        // Hide overlay initially.
        overlayElement.style.opacity = 0;
    }

    // Update the speed display text.
    const speedDisplay = document.getElementById('speed-display');
    if (speedDisplay) {
        speedDisplay.textContent = currentSpeed.toFixed(1) + 'X';
    }

    // Make overlay visible briefly on update and set timeout to hide.
    overlayElement.style.opacity = 1;
    clearTimeout(overlayElement.fadeTimeout);
    overlayElement.fadeTimeout = setTimeout(() => {
        overlayElement.style.opacity = 0;
    }, 2000);
}

// ----------------------------------------------------------------------
// --- EVENT HANDLERS ---
// ----------------------------------------------------------------------

/**
 * Handles keyboard shortcuts for speed control ('c', 'x', 'z').
 * @param {KeyboardEvent} event The keydown event object.
 */
function handleKeyDown(event) {
    // Ignore key presses when focus is inside an editable element.
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
        return;
    }

    const key = event.key.toLowerCase();

    switch (key) {
        case 'c': // Increase speed
        case 'x': // Decrease speed
        case 'z': // Toggle speed (between 1.0X and previous speed)
            // Prevent the website or browser from handling these keys (critical for functionality).
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();

            if (!videoElement) {
                videoElement = findVideo();
            }

            if (!videoElement) {
                displayMessage("No video found to control.", "bg-red-600");
                return;
            }

            let success = false;
            if (key === 'c') {
                success = setSpeed(currentSpeed + SPEED_INCREMENT);
                displayMessage(`Speed: ${currentSpeed.toFixed(1)}X`, "bg-green-600");

            } else if (key === 'x') {
                let newDecreaseSpeed = Math.max(currentSpeed - SPEED_INCREMENT, MIN_DECREASE_SPEED);
                if (newDecreaseSpeed < MIN_DECREASE_SPEED) {
                    displayMessage("Minimum speed reached (0.2X)", "bg-yellow-600");
                } else {
                    success = setSpeed(newDecreaseSpeed);
                    displayMessage(`Speed: ${currentSpeed.toFixed(1)}X`, "bg-yellow-600");
                }
            } else if (key === 'z') {
                let targetSpeed;
                if (currentSpeed.toFixed(1) !== '1.0') {
                    // Set to 1.0X and save the current speed as previous.
                    previousSpeed = currentSpeed;
                    targetSpeed = 1.0;
                    displayMessage(`Speed Reset to 1.0X`, "bg-indigo-600");
                } else {
                    // Restore previous non-1.0X speed.
                    targetSpeed = previousSpeed;
                    displayMessage(`Speed Restored to ${previousSpeed.toFixed(1)}X`, "bg-indigo-600");
                }
                setSpeed(targetSpeed);
            }
            break;
    }
}

/**
 * Listens for messages from the extension popup (popup.js) to control the video.
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        videoElement = findVideo();
        if (!videoElement) {
            sendResponse({ error: 'No video element found on the page.' });
            return true;
        }

        let success = false;
        let message = '';

        switch (request.action) {
            case 'GET_SPEED':
                sendResponse({ newSpeed: currentSpeed });
                return true;

            case 'INCREASE':
                success = setSpeed(currentSpeed + SPEED_INCREMENT);
                message = `Speed: ${currentSpeed.toFixed(1)}X`;
                break;

            case 'DECREASE':
                let newDecreaseSpeed = Math.max(currentSpeed - SPEED_INCREMENT, MIN_DECREASE_SPEED);
                success = setSpeed(newDecreaseSpeed);
                message = `Speed: ${currentSpeed.toFixed(1)}X`;
                break;

            case 'TOGGLE':
                if (currentSpeed.toFixed(1) !== '1.0') {
                    previousSpeed = currentSpeed;
                    success = setSpeed(1.0);
                    message = `Speed Reset to 1.0X`;
                } else {
                    success = setSpeed(previousSpeed);
                    message = `Speed Restored to ${previousSpeed.toFixed(1)}X`;
                }
                break;

            case 'SET_SPEED':
                const targetSpeed = parseFloat(request.value);
                // Save current speed if the change is a jump to a preset.
                if (currentSpeed.toFixed(1) !== targetSpeed.toFixed(1) && currentSpeed.toFixed(1) !== '1.0') {
                    previousSpeed = currentSpeed;
                }
                success = setSpeed(targetSpeed);
                message = `Jumped to ${targetSpeed.toFixed(1)}X`;
                break;
        }

        if (success) {
            displayMessage(message, "bg-indigo-600");
            sendResponse({ newSpeed: currentSpeed });
        } else {
            sendResponse({ error: 'Could not apply speed change.' });
        }

        return true; // Indicates an asynchronous response will be sent
    }
);

// ----------------------------------------------------------------------
// --- INITIALIZATION ---
// ----------------------------------------------------------------------

// Inject Tailwind CSS for utility styling of the overlay and feedback messages.
const tailwindScript = document.createElement('script');
tailwindScript.src = "https://cdn.tailwindcss.com";
document.head.appendChild(tailwindScript);

// Remove any existing UI elements before injection.
cleanupExistingElements();

// Event listener for when the page has fully loaded.
window.addEventListener('load', () => {
    videoElement = findVideo();
    if (videoElement) {
        // Initialize speed variables from the video's actual playback rate.
        currentSpeed = videoElement.playbackRate;
        previousSpeed = currentSpeed;
        updateOverlay();
        
        // Add listener to update the overlay if the site's own controls change the speed.
        videoElement.addEventListener('ratechange', () => {
            currentSpeed = videoElement.playbackRate;
            updateOverlay();
        });
    }
});

// Attach the global keyboard listener to the capture phase to ensure it runs before site listeners.
document.addEventListener('keydown', handleKeyDown, true);

// Fallback check: try to find the video a second later in case of late loading.
setTimeout(() => {
    if (!videoElement) {
        videoElement = findVideo();
        if (videoElement) {
            currentSpeed = videoElement.playbackRate;
            previousSpeed = currentSpeed;
            updateOverlay();
        }
    }
}, 1000);