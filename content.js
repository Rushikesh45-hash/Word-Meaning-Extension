chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showMeaning") {
    console.log("📩 Received message in content.js:", message);

    const word = message.word || "Unknown word";
    const definitions = message.definitions || [];
    let currentIndex = 0;

    // Remove any existing popup
    const oldPopup = document.getElementById("comicPopup");
    if (oldPopup) oldPopup.remove();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const left = rect.left + window.scrollX;

    const popup = document.createElement("div");
    popup.id = "comicPopup";
    popup.className = "comic-popup";
    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;

    document.body.appendChild(popup);

    const renderMeaning = () => {
      const def = definitions[currentIndex];
      popup.innerHTML = `
        <strong>📘 ${word}</strong><br>
        ${def.meaning}<br>
        <em>${def.example}</em><br><br>
        <button id="repeatBtn">🔁 Repeat</button>
        <button id="copyBtn">📋 Copy</button>
      `;
    };

    renderMeaning();

    // Add CSS styling
    const style = document.createElement("style");
    style.textContent = `
      .comic-popup {
        position: absolute;
        background: #f80c0cff;
        border: 4px solid #000;
        border-radius: 25px;
        padding: 15px 20px;
        font-family: 'Comic Neue', 'Comic Sans MS', cursive;
        font-size: 16px;
        line-height: 1.4;
        box-shadow: 4px 4px 0px #000;
        max-width: 300px;
        z-index: 9999;
      }

      .comic-popup::after {
        content: "";
        position: absolute;
        bottom: -20px;
        left: 30px;
        width: 0;
        height: 0;
        border: 15px solid transparent;
        border-top-color: #000;
        border-bottom: 0;
        margin-left: -15px;
      }

      .comic-popup::before {
        content: "";
        position: absolute;
        bottom: -17px;
        left: 31px;
        width: 0;
        height: 0;
        border: 14px solid transparent;
        border-top-color: #fa0c0cff;
        border-bottom: 0;
        margin-left: -14px;
        box-shadow: 4px 4px 0px #000;

      }

      #repeatBtn, #copyBtn {
        margin-top: 8px;
        margin-right: 5px;
        padding: 5px 10px;
        font-size: 13px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
      #repeatBtn {
        background-color: #1dd1a1;
        color: white;
      }
      #copyBtn {
        background-color: #1dd1a1;
        color: white;
      }
    `;
    document.head.appendChild(style);

    // Add event listeners
    popup.addEventListener("click", (e) => {
      if (e.target.id === "repeatBtn") {
        currentIndex = (currentIndex + 1) % definitions.length;
        renderMeaning();
      }
      if (e.target.id === "copyBtn") {
        const def = definitions[currentIndex];
        const fullText = `${word}: ${def.meaning}\nExample: ${def.example}`;
        navigator.clipboard.writeText(fullText)
          .then(() => e.target.textContent = "☑️ Copied!")
          .catch(() => e.target.textContent = "❌ Error");
      }
    });
    let popupTimeout = setTimeout(() => popup.remove(), 5000);
    const repeatBtn = popup.querySelector("#repeatBtn");
    repeatBtn.addEventListener("click", () => {
        clearTimeout(popupTimeout); 
        chrome.runtime.sendMessage({
        action: "repeatMeaning",
        word: word
    });
    popupTimeout = setTimeout(() => popup.remove(), 5000);
  });
  }
});
