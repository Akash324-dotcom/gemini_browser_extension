const CONTEXT_MENU_ID = "ask-gemini-context";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=";
const API_KEY = "<Your_API_Key>";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Ask Gemini about \"%s\"",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID && info.selectionText) {
    const selectedText = info.selectionText.trim();
    sendMessageToContentScript(tab.id, selectedText, "Loading...", true);
    queryGemini(selectedText, tab.id);
  }
});

function sendMessageToContentScript(tabId, question, answer, loading) {
  chrome.tabs.sendMessage(tabId, {
    type: "displaySidebarAnswer",
    question,
    answer,
    loading
  }).catch(err => {
    console.warn("Could not send message to content script:", err);
  });
}

async function queryGemini(selectedText, tabId) {
  const prompt = `Explain the following text concisely...\\n\\n---\\n\\n${selectedText}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: "You are a highly helpful..." }] },
    tools: [{ google_search: {} }]
  };
  const url = GEMINI_API_URL + API_KEY;

  let attempt = 0;
  const maxRetries = 5;
  let finalAnswer = "An error occurred while getting the response from Gemini.";
  let success = false;

  while (attempt < maxRetries && !success) {
    if (attempt > 0) {
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `API returned status ${response.status}. Body: ${errorBody.substring(0, 200)}...`;
        if (response.status === 400) {
          try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.error?.message) {
              errorMessage = `API Error: ${errorJson.error.message}`;
            }
          } catch (_) { /* ignore */ }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate?.content?.parts?.[0]?.text) {
        finalAnswer = candidate.content.parts[0].text;
        success = true;
      } else {
        throw new Error("No candidate text in response.");
      }
    } catch (err) {
      finalAnswer = `Retry ${attempt + 1}/${maxRetries} failed: ${err.message}`;
      attempt++;
    }
  }

  sendMessageToContentScript(tabId, selectedText, finalAnswer, false);
}

// Optional: support popup.js path
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "askGemini" && req.question) {
    // If using popup, no tabId to update; just return answer
    (async () => {
      try {
        const answer = await queryGeminiDirect(req.question);
        sendResponse({ answer });
      } catch (e) {
        sendResponse({ answer: `Error: ${e.message}` });
      }
    })();
    return true; // keep channel open
  }
});

async function queryGeminiDirect(text) {
  const payload = { contents: [{ parts: [{ text }]}] };
  const url = GEMINI_API_URL + API_KEY;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "omit",
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || "No answer.";
}
