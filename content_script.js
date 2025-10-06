const SIDEBAR_ID = "gemini-extension-sidebar";
const CONTAINER_ID = "gemini-extension-container";

function createSidebar() {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.style.cssText = `
      position: fixed; top: 0; right: 0; width: 380px; height: 100%;
      z-index: 99999; transition: transform 0.3s ease-in-out;
      transform: translateX(100%); box-shadow: -5px 0 15px rgba(0,0,0,0.2);
      font-family: Arial, sans-serif; box-sizing: border-box;
      background-color: #f7f7f7; border-left: 1px solid #ddd;
    `;
    document.body.appendChild(container);

    const sidebar = document.createElement("div");
    sidebar.id = SIDEBAR_ID;
    sidebar.style.cssText = `
      padding: 20px; height: 100%; overflow-y: auto;
      display: flex; flex-direction: column;
    `;
    container.appendChild(sidebar);
  }
  return container;
}

function updateSidebarContent(question, answer, loading) {
  const container = createSidebar();
  const sidebar = document.getElementById(SIDEBAR_ID);
  sidebar.innerHTML = "";

  const header = document.createElement("div");
  header.style.cssText = `
    display: flex; justify-content: space-between; align-items: center;
    padding-bottom: 15px; margin-bottom: 15px;
    border-bottom: 2px solid ${loading ? "#3b82f6" : "#2563eb"};
  `;
  const title = document.createElement("h3");
  title.textContent = "Gemini Insight";
  title.style.cssText = "margin:0;color:#2563eb;font-weight:700;font-size:1.25rem;";
  const closeButton = document.createElement("button");
  closeButton.textContent = "✕";
  closeButton.style.cssText = "background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;";
  closeButton.onclick = () => container.style.transform = "translateX(100%)";
  header.appendChild(title);
  header.appendChild(closeButton);
  sidebar.appendChild(header);

  if (question && !loading) {
    const qContainer = document.createElement("div");
    qContainer.style.cssText = "margin-bottom:15px;padding:10px;background:#e5e7eb;border-radius:8px;border-left:3px solid #6b7280;";
    const qLabel = document.createElement("p");
    qLabel.textContent = "Context:";
    qLabel.style.cssText = "font-size:0.9rem;color:#4b5563;margin:0 0 5px 0;";
    const qText = document.createElement("p");
    qText.textContent = question;
    qText.style.cssText = "margin:0;font-style:italic;font-size:1rem;color:#1f2937;max-height:100px;overflow-y:auto;";
    qContainer.appendChild(qLabel);
    qContainer.appendChild(qText);
    sidebar.appendChild(qContainer);
  }

  const aContainer = document.createElement("div");
  aContainer.style.flexGrow = "1";
  const aLabel = document.createElement("h4");
  aLabel.textContent = loading ? "Thinking..." : "Answer:";
  aLabel.style.cssText = `color:${loading ? "#3b82f6" : "#10b981"};margin:0 0 10px 0;font-weight:600;font-size:1.1rem;`;
  const aText = document.createElement("p");
  aText.innerHTML = loading ? "..." : (answer || "").replace(/\n/g, "<br/>");
  aText.style.cssText = "white-space:pre-wrap;line-height:1.6;color:#374151;";
  aContainer.appendChild(aLabel);
  aContainer.appendChild(aText);
  sidebar.appendChild(aContainer);

  if (loading && !document.getElementById("gemini-loading-style")) {
    const style = document.createElement("style");
    style.id = "gemini-loading-style";
    style.textContent = `
      @keyframes pulse { 0%{opacity:0.5}50%{opacity:1}100%{opacity:0.5} }
      .loading-animation { display:inline-block; animation:pulse 1.5s infinite ease-in-out; font-weight:bold; color:#3b82f6; }
    `;
    document.head.appendChild(style);
  }

  container.style.transform = "translateX(0)";
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "displaySidebarAnswer") {
    updateSidebarContent(request.question, request.answer, request.loading);
  }
});
