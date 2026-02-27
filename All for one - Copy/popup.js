const loginBox = document.getElementById("loginBox");
const loggedBox = document.getElementById("loggedBox");
const userText = document.getElementById("userText");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");

// =============================
// CHECK STORAGE ON LOAD
// =============================
chrome.storage.local.get(["user"], (res) => {
  if (res.user) showLoggedIn(res.user.username);
});

// =============================
// LOGIN
// =============================
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert("Fill all fields");
    return;
  }

  const validUsers = {
    "Mohamed Shalaby": "MBDTF",
  };

  if (validUsers[username] && validUsers[username] === password) {
    chrome.storage.local.set({ user: { username, loginTime: new Date().toISOString() } }, () => {
      showLoggedIn(username);
      
    });
  }
});


// =============================
// UI HELPERS
// =============================
function showLoggedIn(username) {
  loginBox.classList.add("hidden");
  loggedBox.classList.remove("hidden");
  userText.textContent = username;
}

const statusMessage = document.getElementById("statusMessage");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !password) {
    alert("Fill all fields");
    return;
  }

  const validUsers = {
    "Mohamed Shalaby": "MBDTF",
  };

  if (validUsers[username] && validUsers[username] === password) {
    chrome.storage.local.set({ user: { username, loginTime: new Date().toISOString() } }, () => {
      // عرض رسالة النجاح
      statusMessage.textContent = "✅ Login success";
      statusMessage.classList.remove("hidden");
      showLoggedIn(username);
    });
  } else {
    alert("❌ Wrong username or password");
  }
});