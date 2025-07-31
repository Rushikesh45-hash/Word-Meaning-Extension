console.log(" background.js loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or updated");
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "findMeaning",
      title: "Find Meaning",
      contexts: ["selection"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(" Context menu error:", chrome.runtime.lastError.message);
      } else {
        console.log(" Context menu created successfully");
      }
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "findMeaning" && info.selectionText) {
    const selectedWord = info.selectionText.trim();
    console.log("🔍 You selected:", selectedWord);

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectedWord}`)
      .then(res => res.json())
      .then(data => {
        console.log("API response data:", data);

        const definitions = [];
        data[0]?.meanings?.forEach(meaning => {
          meaning.definitions.forEach(def => {
            definitions.push({
              meaning: def.definition,
              example: def.example || "No example available"
            });
          });
        });

        if (definitions.length === 0) {
          definitions.push({ meaning: "No meaning found", example: "" });
        }

        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }, () => {
          chrome.tabs.sendMessage(tab.id, {
            action: "showMeaning",
            word: selectedWord,
            definitions: definitions
          });
        });
      })
      .catch(err => {
        console.error(" Error fetching meaning:", err);
      });
  }
});
