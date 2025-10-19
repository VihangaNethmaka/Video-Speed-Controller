# ⚡ Quick Speed Controller

**Take instant control of your video playback speed on any website using simple, dedicated keyboard shortcuts.**

Quick Speed Controller is a minimalist browser extension built for efficiency. Stop fumbling with video player settings—start using keyboard shortcuts for precise speed adjustments, whether you're racing through a lecture or just casually viewing content.

---

## ✨ Features

* **Keyboard-Centric:** Instant control with **C**, **X**, and **Z** keys, preventing interference with site's native media players (like YouTube's default controls).
* **Precise Adjustment:** Increase speed with **C** and decrease with **X** in **0.1X increments**.
* **Quick Toggle:** Instantly switch between the current speed and the standard **1.0X** playback rate using **Z**.
* **Non-Intrusive Feedback:** A small, floating Heads-Up Display (HUD) appears briefly upon adjustment, then fades away completely.
* **Universal Compatibility:** Works across HTML5 video players on virtually any website.
* **UI Controls:** A clean, stylish popup UI (accessible via the extension icon) for large-button control and speed presets.
* **Speed Persistence:** The last speed you set is saved per-page, so if you refresh the page or navigate away and return, the playback rate remains consistent.

---

## 🚀 Installation & Usage

### Installation

1.  Download or clone this repository.
2.  Open your browser's extensions page (e.g., `chrome://extensions` for Chrome/Edge).
3.  Enable **Developer mode** (usually a toggle switch in the top right).
4.  Click **Load unpacked**.
5.  Select the directory containing the extension files (`manifest.json`, `popup.html`, etc.).

### Usage (Keyboard Shortcuts)

| Key | Action | Description |
| :--- | :--- | :--- |
| <kbd>C</kbd> | **Increase Speed** | Increments speed by +0.1X. |
| <kbd>X</kbd> | **Decrease Speed** | Decrements speed by -0.1X. |
| <kbd>Z</kbd> | **Toggle Speed** | Toggles playback between the current speed and 1.0X. |

### Usage (Popup UI)

1.  Click the **Quick Speed Controller** icon in your browser toolbar.
2.  Use the **+0.1** and **-0.1** buttons for precise control.
3.  Use the **Jump to Presets** section for instant speed changes (e.g., 1.5X, 2.0X, 5.0X).
4.  The large display shows the **Current Playback Speed** on the active video.

---

## 🛠️ Development

### Project Structure

```

VideoSpeedController/
├── assets/
│   ├── css/
│   │   ├── help.css        # Styling for the Help page
│   │   └── welcome.css     # Styling for the Welcome page
│   ├── img/
│   │   └── creator.jpg     # Creator image
│   └── icons/
│       ├── icon16.png      # 16x16 icon (Favicon, Context menu)
│       ├── icon48.png      # 48x48 icon (Extension management page)
│       └── icon128.png     # 128x128 icon (Web Store, Install prompts)
├── contentScript.js        # Core logic: Finds videos, handles messages, injects HUD
├── background.js           # Handles initial installation/updates (e.g., opens welcome page)
├── popup.js                # Logic for the popup UI
├── help.html               # Dedicated help and shortcut guide page
├── popup.html              # The main extension interface
├── welcome.html            # The page shown after installation
└── manifest.json           # Extension metadata and permissions

```

### Philosophy

This extension follows a philosophy of **simplicity** and **zero friction**. It aims to provide the fastest, most reliable way to adjust video playback without complex menus or redundant features.

---

## 👤 About the Creator

This extension was created by **Vihanga Nethmaka** out of a personal need for better video control while learning online.

* **GitHub:** [VihangaNethmaka](https://github.com/VihangaNethmaka) 🔗
* **LinkedIn:** [Vihanga Nethmaka](https://www.linkedin.com/in/vihanganethmaka/) 💼
* **Telegram:** [VihangaNethmaka](https://t.me/VihangaNethmaka) 💬

Feel free to reach out with suggestions or bug reports!

### License **MIT**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
