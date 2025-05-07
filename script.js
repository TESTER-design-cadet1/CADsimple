
const DISPATCH_CREDENTIALS = {
  "dispatch1": "password123",
  "dispatch2": "secure456"
};

let users = JSON.parse(localStorage.getItem("mdt_users") || "{}");
let currentUser = JSON.parse(localStorage.getItem("mdt_current_user") || "null");

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const isDispatcher = DISPATCH_CREDENTIALS[username] && DISPATCH_CREDENTIALS[username] === password;

  const user = users[username] || {
    username,
    team: isDispatcher ? "Dispatch" : "Police",
    rank: "Officer",
    role: "None",
    freq: "1",
    dispatcher: isDispatcher
  };

  users[username] = user;
  currentUser = user;

  localStorage.setItem("mdt_users", JSON.stringify(users));
  localStorage.setItem("mdt_current_user", JSON.stringify(user));

  loadDashboard();
}

function loadDashboard() {
  if (!currentUser) return;
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("dashboard").style.display = "block";

  document.getElementById("displayName").innerText = currentUser.username;
  document.getElementById("displayTeam").innerText = currentUser.team;
  document.getElementById("displayRank").innerText = currentUser.rank;
  document.getElementById("displayRole").innerText = currentUser.role;

  document.getElementById("radioFreq").value = currentUser.freq;

  if (currentUser.dispatcher) {
    document.getElementById("dispatcherPanel").style.display = "block";
  }

  renderChat();
}

function logout() {
  currentUser = null;
  localStorage.removeItem("mdt_current_user");
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginPage").style.display = "block";
}

function changeFrequency() {
  currentUser.freq = document.getElementById("radioFreq").value;
  users[currentUser.username] = currentUser;
  localStorage.setItem("mdt_users", JSON.stringify(users));
  localStorage.setItem("mdt_current_user", JSON.stringify(currentUser));
}

function sendMessage() {
  const message = document.getElementById("chatMessage").value;
  const chatLog = JSON.parse(localStorage.getItem("chat_log") || "[]");

  const privateOnly = document.getElementById("privateMessageToggle")?.checked;

  chatLog.push({
    user: currentUser.username,
    message,
    freq: currentUser.freq,
    private: currentUser.dispatcher ? privateOnly : false,
    timestamp: new Date().toISOString()
  });

  localStorage.setItem("chat_log", JSON.stringify(chatLog));
  renderChat();
}

function renderChat() {
  const chatBox = document.getElementById("chatBox");
  const chatLog = JSON.parse(localStorage.getItem("chat_log") || "[]");

  chatBox.innerHTML = "";

  chatLog.forEach(entry => {
    const isVisible = !entry.private || currentUser.dispatcher || entry.freq === currentUser.freq;
    if (isVisible) {
      const p = document.createElement("p");
      p.textContent = `[${entry.freq}] ${entry.user}: ${entry.message}`;
      chatBox.appendChild(p);
    }
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

function assignRoleRank() {
  const username = document.getElementById("assignUser").value;
  const role = document.getElementById("assignRole").value;
  const rank = document.getElementById("assignRank").value;

  if (users[username]) {
    users[username].role = role;
    users[username].rank = rank;
    localStorage.setItem("mdt_users", JSON.stringify(users));
    alert("Assigned successfully!");
  } else {
    alert("User not found.");
  }
}

function speakMessage() {
  const message = document.getElementById("chatMessage").value;
  const utter = new SpeechSynthesisUtterance(message);
  speechSynthesis.speak(utter);
}

if (currentUser) {
  loadDashboard();
}
