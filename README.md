# 🌐 Gemini Context Extension

Ask **Gemini** about any selected text on any webpage — instantly.  
Right-click highlighted text → “Ask Gemini …” → get an AI-generated answer in a beautiful slide-in sidebar.

---

## 🚀 Overview

**Gemini Context Extension** is a Chrome extension built using **Manifest V3** that connects to Google’s Gemini API.  
It allows users to highlight text on any webpage, right-click, and get a concise explanation, definition, or context directly on the page.

The extension includes:

- 🖱️ **Context menu integration** (“Ask Gemini about …”)  
- 💬 **Slide-in sidebar UI** with a loading animation and formatted results  
- ⚙️ **Manifest V3 background service worker** for API calls and logic  
- 🧩 **Optional popup** for direct queries  
- 🔒 **Secure local proxy server** to protect your API key

---

## 📁 Repository Structure

| File | Purpose |
|------|----------|
| `manifest.json` | Chrome MV3 configuration, permissions, scripts, and popup definition |
| `background.js` | Handles context menu actions, network requests, and message passing |
| `content_script.js` | Injects sidebar UI and displays results from Gemini |
| `popup.html` / `popup.js` | Optional popup interface for direct questions |
| `package.json` | Node.js dependencies and local server setup |
| `server/index.js` | Local proxy server that forwards requests securely to Gemini |
| `README.md` | Project documentation |

---

## 🧰 Installation & Setup

### 1️⃣ Clone this repository
```bash
git clone https://github.com/<your-username>/gemini-context-extension.git
cd gemini-context-extension
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Create `.env` file
Create a `.env` file in the root directory:
```
GEMINI_API_KEY=your-key-here
PORT=3000
```

> ⚠️ **Never commit your real API key**. Use `.env.example` as a reference.

---

## 🧠 Option A — Local Proxy Server (Recommended)

This method keeps your **Gemini API key secure** on the server side and prevents it from being exposed in the browser.

### ➕ Create `server/index.js`
Use the following implementation:
```js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash-preview-05-20";

app.post("/api/ask", async (req, res) => {
  try {
    const { text, systemInstruction } = req.body || {};
    if (!text) return res.status(400).json({ error: "Missing text" });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text }] }],
      ...(systemInstruction
        ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
        : {}),
      tools: [{ google_search: {} }]
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const bodyText = await r.text();
    if (!r.ok) return res.status(r.status).send(bodyText);

    res.type("application/json").send(bodyText);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
```

### 🖥️ Run the server
```bash
npm start
```
Your proxy server will now run locally at `http://localhost:3000/api/ask`.

---

## 🌐 Option B — Direct API Key (Local-Only)

For quick local testing only.

In `background.js`, replace:
```js
const API_KEY = "<YOUR-API-KEY>";
```

> ⚠️ **Never distribute or commit a file containing a real API key.**  
> This method exposes your key and should only be used privately.

---

## 🧩 Load the Extension in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select your extension’s folder
5. Open any webpage → highlight text → right-click → **Ask Gemini about “…”**

A sidebar will slide in from the right showing Gemini’s response.

---

## 💡 Troubleshooting

| Issue | Fix |
|-------|-----|
| **Sidebar not showing** | Ensure `content_script.js` is correctly referenced in `manifest.json` |
| **Server error (500)** | Confirm your proxy server is running and `.env` key is valid |
| **401/403 errors** | Verify API key permissions and model access |
| **No context menu** | Reload the extension and check `chrome://extensions → Service Worker console` |
| **Popup not needed** | You can remove `"default_popup": "popup.html"` from `manifest.json` |

---

## 🔒 Security

- Never hardcode or expose API keys in frontend code.  
- Use `.env` files and a local proxy server to handle all Gemini API requests securely.
- Add `.env` to `.gitignore` to avoid accidental commits.

---

## 🧱 Example Manifest Permissions

```json
"permissions": [
  "contextMenus",
  "activeTab",
  "tabs",
  "scripting"
],
"host_permissions": [
  "http://localhost:3000/*",
  "<all_urls>"
]
```

---

## 📜 License

This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute it under the same terms.

---

## ✨ Credits

Developed by **Akash Maity**  
Built with ❤️ using the Gemini API, Manifest V3, and Express.

---

### 💬 Example Flow
1. Highlight: “Quantum computing basics”
2. Right-click → *Ask Gemini about …*
3. Sidebar shows:  
   > “Quantum computing uses qubits instead of bits, allowing superposition and parallel computation…”

---

**Enjoy building smarter browsing experiences with Gemini 🚀**
