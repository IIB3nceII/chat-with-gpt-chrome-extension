const DUMMY_RES = new Promise((resolve, reject) => {
  fetch("./dummy-response.json")
    .then((respond) => {
      resolve(respond.json());
    })
    .catch((err) => {
      reject(err);
    });
});

/* -------------------- */
/* ----RECOGNITION----- */
/* -------------------- */
let recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.lang = "en-US";

/* -------------------- */
/* --------REFS-------- */
/* -------------------- */
const chatBox = document.getElementById("chat");
const chatInputContainer = document.getElementById("chatInputContainer");

const delKeyButton = document.getElementById("delKey");
const transScriptButton = document.getElementById("transScriptButton");
const chatSubmitButton = document.getElementById("chatSubmitButton");
const chatInput = document.getElementById("chatInput");
const delIcon = document.getElementById("delIcon");

/* -------------------- */
/* ---------VARS------- */
/* -------------------- */
let isMicActive = false;
let apiKey = null;
const messages = [];
const DEV_ACTIVE = false;

for (let i = 0; i < messages.length; i++) {
  printMessage(messages[i].content, messages[i].role);
}

chrome.storage.local.get("apiKey", (res) => {
  if (res.apiKey) {
    apiKey = res.apiKey;
  } else {
    window.location.href = "index.html";
  }
});

/* -------------------- */
/* -----FUNCTIONS------ */
/* -------------------- */
function printMessage(content, role = "system") {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");
  messageContainer.classList.add(
    role === "user" ? "user-container" : "bot-container"
  );
  const chatMessage = document.createElement("p");
  messageContainer.appendChild(chatMessage);
  chatMessage.classList.add(role === "user" ? "user-message" : "bot-message");
  chatMessage.innerHTML = content;
  chatBox.appendChild(messageContainer);
  chatBox.scrollTo({ behavior: "smooth", top: chatBox.scrollHeight });
}

function sendMessage() {
  const message = chatInput.value;
  if (message.length) {
    messages.push({
      role: "user",
      content: message,
    });

    printMessage(message, "user");

    const url = `https://api.openai.com/v1/chat/completions`;
    const data = {
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 200,
    };

    delKeyButton.disabled = true;
    transScriptButton.disabled = true;
    chatInput.disabled = true;
    chatSubmitButton.disabled = true;
    (DEV_ACTIVE
      ? new Promise((resolve) => setTimeout(() => resolve(DUMMY_RES), 2000))
      : fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(data),
        })
    )
      .then((res) => (DEV_ACTIVE ? res : res.json()))
      .then((res) => {
        console.log(res);

        delKeyButton.disabled = false;
        transScriptButton.disabled = false;
        chatInput.disabled = false;
        chatSubmitButton.disabled = false;
        const response = res.choices[0].message;
        printMessage(response.content);

        messages.push({
          role: response.role,
          content: response.content,
        });
        chatInput.value = "";
      })
      .catch((err) => {
        console.log(err);
        delKeyButton.disabled = false;
        transScriptButton.disabled = false;
        chatInput.disabled = false;
        chatSubmitButton.disabled = false;
      });
  }
}

/* -------------------- */
/* -----LISTENERS------ */
/* -------------------- */
recognition.onstart = function () {
  isMicActive = true;
};

recognition.onend = function () {
  isMicActive = false;
};

recognition.onerror = function () {
  isMicActive = false;
};

transScriptButton.addEventListener("click", () => {
  if (isMicActive) {
    recognition.stop();
    delIcon.classList.remove("red-icon");
  } else {
    try {
      recognition.start();
      recognition.onresult = (event) => {
        const result = event.results[event.results.length - 1][0].transcript;
        chatInput.value.length
          ? (chatInput.value += " " + result)
          : (chatInput.value = result);
      };

      delIcon.classList.add("red-icon");
    } catch (err) {
      console.log(err);
      delIcon.classList.add("red-icon");
    }
  }
});

chatSubmitButton.addEventListener("click", () => sendMessage());

delKeyButton.addEventListener("click", () => {
  chrome.storage.local.remove("apiKey", () => {
    window.location.href = "index.html";
  });
});
