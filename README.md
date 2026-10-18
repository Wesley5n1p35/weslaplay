# ⚡ WeslaPlay — Tesla YouTube, Plex & Netflix In-Car Portal

A zero-cost, serverless web portal built specifically for Tesla touchscreen browsers (Model 3, Model Y, Model S, Model X, Cybertruck).

---

## 💡 How It Works & Why It Works While Driving

1. **In-Browser vs. Tesla Theater**:
   - **Tesla Theater** (the native fullscreen app) is hardcoded by Tesla's OS to close when shifted into Drive.
   - **The Regular Web Browser** stays active on the center screen while driving! When web video is played inside the regular browser window, video and audio streams continue playing on the road.
2. **No Hardware or Subscription**:
   - Unlike subscription services that charge $14/month for cloud proxy servers, WeslaPlay runs **100% on GitHub Pages** using standard web players (YouTube IFrame Player API, Plex Web, and direct Netflix Web navigation).
3. **Passenger Safety Gate**:
   - Includes a mandatory confirmation modal: *"I confirm I am a passenger, NOT the driver"* before enabling video playback controls.

---

## 🚀 How to Host on GitHub Pages for Free (2 Minutes)

### Step 1: Create a GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Set the repository name to `weslaplay` (or any name you choose).
3. Make sure the repository is **Public**.

### Step 2: Push the Files
Open your terminal and run:
```bash
cd /Users/wesleymartinez/.gemini/antigravity-ide/scratch/TESLAWOAH/weslaplay
git push -u origin main
```

### Step 3: Turn on GitHub Pages
1. In your GitHub repository, open **Settings** > **Pages** (under the "Code and automation" menu on the left).
2. Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
3. Select branch **`main`** and folder **`/ (root)`**, then click **Save**.
4. In ~60 seconds, your portal is live at:
   ```
   https://Wesley5n1p35.github.io/weslaplay/
   ```

---

## 🚗 How to Use in Your Tesla

1. **Open the Web Browser** on your Tesla touchscreen (from the bottom app bar).
2. Enter your GitHub Pages URL:
   ```
   https://Wesley5n1p35.github.io/weslaplay/
   ```
3. Tap the **Star / Bookmark** icon in the browser to save it to your home shortcuts.
4. Complete the one-time **Passenger Safety Confirmation**.
5. Pick your watcher:
   - **▶️ YouTube**: Paste any link or search keyword, or tap any preset (Lofi, NASA, car reviews). Plays right inside the browser window.
   - **🎬 Plex**: Launches Plex Web (`app.plex.tv/desktop`) or your custom server address.
   - **🍿 Netflix**: Launches Netflix Web directly in the browser.

---

## 🔒 Safety Notice
In-car video entertainment must be operated and viewed strictly by passengers. The driver must always remain attentive and focused on driving.
