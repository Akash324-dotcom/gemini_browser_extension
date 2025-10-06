document.querySelector("#askBtn").addEventListener("click", () => {
  const question = document.querySelector("#questionInput").value;

  chrome.runtime.sendMessage({ type: "askGemini", question }, (response) => {
    document.querySelector("#answerOutput").textContent = response.answer;
  });
});
