const submitButton = document.getElementById("submitButton");

chrome.storage.local.get("apiKey", (res) => {
  if (res.apiKey) {
    window.location.href = "chat.html";
  }
});

function saveOptions(e) {
  e.preventDefault();
  chrome.storage.local.set(
    {
      apiKey: document.getElementById("apiKey").value,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("Data added to local storage successfully!");
        window.location.href = "chat.html";
      }
    }
  );
}

submitButton.addEventListener("click", saveOptions);
