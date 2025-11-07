// ===== CONFIG - CUSTOMIZE YOUR VALUES HERE =====
// You can change these values or configure them in Settings > API Keys tab
const DISCORD_CLIENT_ID = localStorage.getItem("cloud_ai_discord_client_id") || "1436284588946231306";
const REDIRECT_URI = "https://c22654545-afk.github.io/My/";
const DISCORD_WEBHOOK_URL = localStorage.getItem("cloud_ai_discord_webhook") || "https://discord.com/api/webhooks/1435925134090305738/dOVTECQedUHnXJT4CeQ51VOzCqdZuC4DYncKmMYXx2-D_JuJqY33NJb1o6wTX35TOLhH";
const OPENAI_API_KEY = localStorage.getItem("cloud_ai_openai_key") || "";
const GROQ_API_KEY = localStorage.getItem("cloud_ai_groq_key") || "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";

// ===== ELEMENT SELECTORS =====
const loginPage = document.getElementById("login-page");
const chatPage = document.getElementById("chat-page");
const discordLoginBtn = document.getElementById("discord-login");
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const stopBtn = document.getElementById("stop-btn");
const profileArea = document.getElementById("profile-area");
const profileDropdown = document.getElementById("profile-dropdown");
const logoutBtn = document.getElementById("logout-btn");
const menuBtn = document.getElementById("menu-btn");
const menuDropdown = document.getElementById("menu-dropdown");
const newChatBtn = document.getElementById("new-chat");
const oldChatBtn = document.getElementById("old-chat");
const oldChatModal = document.getElementById("old-chat-modal");
const oldChatList = document.getElementById("old-chat-list");
const closeOldChat = document.getElementById("close-old-chat");
const settingsBtn = document.getElementById("settings-btn");
const settingsModal = document.getElementById("settings-modal");
const closeSettings = document.getElementById("close-settings");
const memoryToggle = document.getElementById("memory-toggle");
const memoryStatus = document.getElementById("memory-status");

// New settings elements
const themeToggle = document.getElementById("theme-toggle");
const typingSpeedRange = document.getElementById("typing-speed");
const autoScrollToggle = document.getElementById("auto-scroll");
const compactModeToggle = document.getElementById("compact-mode");
const userFirstnameInput = document.getElementById("user-firstname");
const userSurnameInput = document.getElementById("user-surname");
const userAgeInput = document.getElementById("user-age");
const userCountrySelect = document.getElementById("user-country");
const aiNameInput = document.getElementById("ai-name");
const aiPersonalitySelect = document.getElementById("ai-personality");
const aiLanguageSelect = document.getElementById("ai-language");
const responseLengthSelect = document.getElementById("response-length");
const fontSizeSelect = document.getElementById("font-size");
const soundEffectsToggle = document.getElementById("sound-effects");
const autoSaveToggle = document.getElementById("auto-save");
const chatWelcome = document.getElementById("chat-welcome");

// Terms & Privacy
const termsModal = document.getElementById("terms-modal");
const closeTermsBtn = document.getElementById("close-terms");
const showTermsLink = document.getElementById("show-terms-link");
const agreementModal = document.getElementById("agreement-modal");
const agreeCheckbox = document.getElementById("agree-checkbox");
const agreementAccept = document.getElementById("agreement-accept");
const viewFullTerms = document.getElementById("view-full-terms");

// ===== STATE =====
let userData = null;
let chatMemory = JSON.parse(localStorage.getItem("cloud_ai_memory") || "[]");
let chatSessions = JSON.parse(localStorage.getItem("cloud_ai_sessions") || "[]");
let currentChatId = (() => {
  const stored = localStorage.getItem("cloud_ai_current_chat");
  return (stored && stored !== "null") ? stored : null;
})();
let globalMemory = JSON.parse(localStorage.getItem("cloud_ai_global_memory") || "[]");
let memoryEnabled = localStorage.getItem("cloud_ai_memory_enabled") !== "false";
const MAX_MEMORY = 9999;

// Settings state
let darkTheme = localStorage.getItem("cloud_ai_dark_theme") === "true";
let typingSpeed = parseInt(localStorage.getItem("cloud_ai_typing_speed") || "12");
let autoScroll = localStorage.getItem("cloud_ai_auto_scroll") !== "false";
let compactMode = localStorage.getItem("cloud_ai_compact_mode") === "true";
let userFirstname = localStorage.getItem("cloud_ai_user_firstname") || "";
let userSurname = localStorage.getItem("cloud_ai_user_surname") || "";
let userAge = localStorage.getItem("cloud_ai_user_age") || "";
let aiName = localStorage.getItem("cloud_ai_ai_name") || "Cloud AI";
let aiPersonality = localStorage.getItem("cloud_ai_personality") || "friendly";
let aiLanguage = localStorage.getItem("cloud_ai_language") || "english";
let responseLength = localStorage.getItem("cloud_ai_response_length") || "medium";
let fontSize = localStorage.getItem("cloud_ai_font_size") || "medium";
let soundEffects = localStorage.getItem("cloud_ai_sound_effects") === "true";
let autoSave = localStorage.getItem("cloud_ai_auto_save") !== "false";
let userCountry = localStorage.getItem("cloud_ai_user_country") || "";
let colorTheme = localStorage.getItem("cloud_ai_color_theme") || "default";
let bubbleStyle = localStorage.getItem("cloud_ai_bubble_style") || "rounded";
let animations = localStorage.getItem("cloud_ai_animations") !== "false";
let backgroundStyle = localStorage.getItem("cloud_ai_background_style") || "gradient";
let showAvatars = localStorage.getItem("cloud_ai_show_avatars") !== "false";

// Stop functionality
let currentAbortController = null;
let isGenerating = false;

// ===== UTIL =====
function saveMemory(){ localStorage.setItem("cloud_ai_memory", JSON.stringify(chatMemory)); }
function saveSessions(){ localStorage.setItem("cloud_ai_sessions", JSON.stringify(chatSessions)); }
function saveCurrentChatId(){ 
  if(currentChatId){
    localStorage.setItem("cloud_ai_current_chat", currentChatId);
  } else {
    localStorage.removeItem("cloud_ai_current_chat");
  }
}
function saveGlobalMemory(){ 
  localStorage.setItem("cloud_ai_global_memory", JSON.stringify(globalMemory)); 
}
function saveMemoryEnabled(){ 
  localStorage.setItem("cloud_ai_memory_enabled", memoryEnabled ? "true" : "false"); 
}
function addToGlobalMemory(message){
  if(!memoryEnabled) return;
  globalMemory.push(message);
  if(globalMemory.length > MAX_MEMORY){
    globalMemory = globalMemory.slice(-MAX_MEMORY);
  }
  saveGlobalMemory();
  updateMemoryStatus();
}
function updateMemoryStatus(){
  if(memoryStatus){
    memoryStatus.textContent = `Memory: ${memoryEnabled ? "Enabled" : "Disabled"} | Messages: ${globalMemory.length} / ${MAX_MEMORY}`;
  }
}
function backfillGlobalMemory(messages){
  if(!memoryEnabled) return;
  messages.forEach(msg => {
    const exists = globalMemory.some(m => 
      m.content === msg.content && 
      m.role === msg.role && 
      Math.abs((m.timestamp || 0) - (msg.timestamp || 0)) < 1000
    );
    if(!exists){
      globalMemory.push({ ...msg, timestamp: msg.timestamp || Date.now() });
    }
  });
  if(globalMemory.length > MAX_MEMORY){
    globalMemory = globalMemory.slice(-MAX_MEMORY);
  }
  saveGlobalMemory();
  updateMemoryStatus();
}

function generateChatName(firstMessage){
  const maxLen = 40;
  if(firstMessage.length <= maxLen) return firstMessage;
  return firstMessage.slice(0, maxLen) + "...";
}

function customConfirm(message, isDelete = false){
  return new Promise((resolve) => {
    const dialog = document.getElementById("custom-dialog");
    const dialogMessage = document.getElementById("dialog-message");
    const okBtn = document.getElementById("dialog-ok");
    const cancelBtn = document.getElementById("dialog-cancel");

    dialogMessage.textContent = message;

    if(isDelete){
      okBtn.classList.add("delete");
    } else {
      okBtn.classList.remove("delete");
    }

    dialog.style.display = "flex";

    const handleOk = () => {
      dialog.style.display = "none";
      okBtn.removeEventListener("click", handleOk);
      cancelBtn.removeEventListener("click", handleCancel);
      resolve(true);
    };

    const handleCancel = () => {
      dialog.style.display = "none";
      okBtn.removeEventListener("click", handleOk);
      cancelBtn.removeEventListener("click", handleCancel);
      resolve(false);
    };

    okBtn.addEventListener("click", handleOk);
    cancelBtn.addEventListener("click", handleCancel);
  });
}

function customPrompt(message, defaultValue = ""){
  return new Promise((resolve) => {
    const dialog = document.getElementById("custom-prompt-dialog");
    const dialogMessage = document.getElementById("prompt-message");
    const inputField = document.getElementById("prompt-input");
    const okBtn = document.getElementById("prompt-ok");
    const cancelBtn = document.getElementById("prompt-cancel");

    dialogMessage.textContent = message;
    inputField.value = defaultValue;

    dialog.style.display = "flex";
    setTimeout(() => inputField.focus(), 100);

    const handleOk = () => {
      const value = inputField.value;
      dialog.style.display = "none";
      okBtn.removeEventListener("click", handleOk);
      cancelBtn.removeEventListener("click", handleCancel);
      resolve(value);
    };

    const handleCancel = () => {
      dialog.style.display = "none";
      okBtn.removeEventListener("click", handleOk);
      cancelBtn.removeEventListener("click", handleCancel);
      resolve(null);
    };

    okBtn.addEventListener("click", handleOk);
    cancelBtn.addEventListener("click", handleCancel);
    inputField.addEventListener("keypress", (e) => {
      if(e.key === "Enter") handleOk();
    });
  });
}

function escapeHtml(s=""){ return String(s).replace(/[&<>"'`=\/]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'}[ch])); }

/* create message DOM element and return the message element (so we can update bot text) */
function createMessageElement(text, sender, avatarUrl=""){
  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${sender}`;
  if(compactMode) wrapper.classList.add("compact");

  const avatar = document.createElement("div");
  avatar.className = `avatar ${sender}`;

  if(sender === "user"){
    if(avatarUrl){
      const img = document.createElement("img");
      img.src = avatarUrl;
      img.alt = "pfp";
      img.style.width = compactMode ? "28px" : "36px";
      img.style.height = compactMode ? "28px" : "36px";
      img.style.borderRadius = "50%";
      avatar.appendChild(img);
    }
  } else {
    avatar.textContent = "☁️";
  }

  const msg = document.createElement("div");
  msg.className = "message";
  msg.textContent = text;

  if(sender === "user"){
    wrapper.appendChild(msg);
    wrapper.appendChild(avatar);
  } else {
    wrapper.appendChild(avatar);
    wrapper.appendChild(msg);
  }

  chatBox.appendChild(wrapper);
  if(autoScroll) chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

// ===== AUTH FLOW =====
discordLoginBtn.addEventListener("click", () => {
  const scope = "identify%20email";
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${scope}`;
  window.location.href = url;
});

async function initAuth(){
  // Apply theme
  applyTheme();

  // grab token from hash if present (implicit flow)
  if(window.location.hash.includes("access_token")){
    const token = new URLSearchParams(window.location.hash.substring(1)).get("access_token");
    if(token) {
      localStorage.setItem("discord_token", token);

      // Start fresh with new chat
      chatMemory = [];
      currentChatId = null;
      saveMemory();
      saveCurrentChatId();
    }
    // tidy url
    history.replaceState(null, "", REDIRECT_URI);
  }

  const token = localStorage.getItem("discord_token");
  if(!token){
    // not logged in
    loginPage.style.display = "block";
    chatPage.style.display = "none";
    return;
  }

  try{
    const res = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: `Bearer ${token}` } });
    if(!res.ok){
      localStorage.removeItem("discord_token");
      loginPage.style.display = "block";
      chatPage.style.display = "none";
      return;
    }
    userData = await res.json();

    // Always start with new chat when reopening
    chatMemory = [];
    currentChatId = null;
    saveMemory();
    saveCurrentChatId();

    showChatUI();
    sendWebhook("login", userData);
  } catch(err){
    console.error("Auth error", err);
    localStorage.removeItem("discord_token");
    loginPage.style.display = "block";
    chatPage.style.display = "none";
  }
}

// show chat UI and populate saved messages
function showChatUI(){
  loginPage.style.display = "none";
  chatPage.style.display = "block";
  chatBox.innerHTML = "";
  backfillGlobalMemory(chatMemory);
  const avatarUrl = userData && userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator||'0')%5}.png`;
  chatMemory.forEach(m => {
    const sender = m.role === "assistant" ? "bot" : "user";
    createMessageElement(m.content, sender, avatarUrl);
  });
  // show PFP and hook dropdown
  profileArea.innerHTML = `<img src="${avatarUrl}" alt="pfp">`;
  profileArea.onclick = (e) => {
    e.stopPropagation();
    // toggle small logout dropdown
    profileDropdown.style.display = profileDropdown.style.display === "block" ? "none" : "block";
  };
  // logout button
  logoutBtn.onclick = async () => {
    if(await customConfirm("Logout now?")){
      sendWebhook("logout", userData);
      localStorage.removeItem("discord_token");
      userData = null;
      loginPage.style.display = "block";
      chatPage.style.display = "none";
      profileDropdown.style.display = "none";
    }
  };
}

// close dropdowns when clicking outside
document.addEventListener("click", () => {
  if(menuDropdown) menuDropdown.style.display = "none";
  if(profileDropdown) profileDropdown.style.display = "none";
});

// ===== ENHANCED WEBHOOK LOGGING (login/logout/new/delete/settings) =====
async function sendWebhook(kind, usr = {}, extraData = null) {
  if(!DISCORD_WEBHOOK_URL) return;

  const colorMap = {
    'login': 3066993,      // Green
    'logout': 15158332,    // Red
    'delete': 15548997,    // Orange
    'new': 3447003,        // Blue
    'settings': 10181046,  // Purple
    'error': 16711680      // Bright Red
  };
  const color = colorMap[kind] || 3447003;

  const fields = [
    { name: "👤 Username", value: `${usr.username || "Unknown"}#${usr.discriminator || "0000"}`, inline: true },
    { name: "🆔 User ID", value: usr.id || "Unknown", inline: true },
    { name: "📧 Email", value: usr.email || "No email", inline: false }
  ];

  // Add account creation date
  if(usr.id){
    try {
      const snowflake = BigInt(usr.id);
      const timestamp = Number((snowflake >> 22n) + 1420070400000n);
      const accountCreated = new Date(timestamp).toLocaleString();
      fields.push({ name: "📅 Account Created", value: accountCreated, inline: false });
    } catch(e){
      console.warn("Could not parse account creation date", e);
    }
  }

  // Add user settings info
  const userInfo = [];
  if(userFirstname || userSurname){
    const fullName = [userFirstname, userSurname].filter(n => n).join(" ");
    userInfo.push(`**Name:** ${fullName}`);
  }
  if(userAge) userInfo.push(`**Age:** ${userAge}`);
  if(userInfo.length > 0){
    fields.push({ name: "🧑 User Profile", value: userInfo.join("\n"), inline: false });
  }

  // Add AI configuration
  const aiInfo = [
    `**AI Name:** ${aiName}`,
    `**Personality:** ${aiPersonality}`,
    `**Language:** ${aiLanguage}`,
    `**Response Length:** ${responseLength}`
  ];
  
  if(kind === "login"){
    fields.push(
      { name: "💾 Total Memory", value: `${globalMemory.length} / ${MAX_MEMORY} messages`, inline: true },
      { name: "💬 Active Chats", value: `${chatSessions.length} sessions`, inline: true },
      { name: "⏰ Login Time", value: new Date().toLocaleString(), inline: false },
      { name: "🤖 AI Configuration", value: aiInfo.join("\n"), inline: false },
      { name: "🎨 Theme", value: darkTheme ? "Dark 🌙" : "Light ☀️", inline: true },
      { name: "🔢 Font Size", value: fontSize.toUpperCase(), inline: true },
      { name: "💾 Memory Status", value: memoryEnabled ? "Enabled ✅" : "Disabled ❌", inline: true }
    );
  }

  if(kind === "logout"){
    fields.push(
      { name: "⏰ Logout Time", value: new Date().toLocaleString(), inline: false },
      { name: "💬 Session Stats", value: `Chats: ${chatSessions.length} | Messages: ${globalMemory.length}`, inline: false }
    );
  }

  if(kind === "settings"){
    fields.push(
      { name: "⚙️ Settings Changed", value: extraData || "Updated settings", inline: false },
      { name: "🤖 AI Configuration", value: aiInfo.join("\n"), inline: false },
      { name: "⏰ Update Time", value: new Date().toLocaleString(), inline: false }
    );
  }

  const titleMap = {
    'login': "🟢 User Logged In",
    'logout': "🔴 User Logged Out", 
    'delete': "🗑️ Chat Deleted",
    'new': "✨ New Chat Created",
    'settings': "⚙️ Settings Updated",
    'error': "❌ Error Occurred"
  };

  const embed = {
    title: titleMap[kind] || "📋 Activity Log",
    description: kind === "login" ? `Welcome back to Cloud AI! 🎉` : kind === "logout" ? `User has logged out from Cloud AI` : null,
    color,
    fields,
    timestamp: new Date().toISOString(),
    footer: {
      text: "Cloud AI - Advanced AI Chat Assistant",
      icon_url: "https://cdn.discordapp.com/embed/avatars/0.png"
    }
  };

  if(kind === "delete" && extraData){
    const chatContent = JSON.stringify(extraData, null, 2);
    const blob = new Blob([chatContent], { type: "application/json" });
    const formData = new FormData();
    formData.append("payload_json", JSON.stringify({ embeds: [embed] }));
    formData.append("file", blob, `deleted_chat_${Date.now()}.json`);

    fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      body: formData
    }).catch(e => console.warn("Webhook send error", e));
  } else {
    fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] })
    }).catch(e => console.warn("Webhook send error", e));
  }
}


// ===== SENDING MESSAGES WITH STOP BUTTON =====
sendBtn.addEventListener("click", handleSend);
userInput.addEventListener("keypress", e => { if(e.key === "Enter" && !e.shiftKey){ e.preventDefault(); handleSend(); } });

stopBtn?.addEventListener("click", () => {
  if(currentAbortController){
    currentAbortController.abort();
    currentAbortController = null;
    isGenerating = false;
    stopBtn.style.display = "none";
    sendBtn.style.display = "inline-block";
  }
});

async function handleSend(){
  const text = userInput.value.trim();
  if(!text || isGenerating) return;

  isGenerating = true;
  sendBtn.style.display = "none";
  stopBtn.style.display = "inline-block";

  currentAbortController = new AbortController();

  const avatarUrl = userData && userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128` : "";
  // show user message
  createMessageElement(text, "user", avatarUrl);
  const userMsg = { role: "user", content: text, timestamp: Date.now() };
  chatMemory.push(userMsg);
  addToGlobalMemory(userMsg);

  if(!currentChatId){
    currentChatId = "chat_" + Date.now();
    const chatName = generateChatName(text);
    chatSessions.push({
      id: currentChatId,
      name: chatName,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    saveSessions();
    saveCurrentChatId();
  }

  saveMemory();
  userInput.value = "";

  // Hide welcome message on first message
  if(chatWelcome && chatWelcome.style.display !== "none"){
    chatWelcome.style.display = "none";
  }

  // create bot typing element and keep reference to replace
  const botEl = createMessageElement("Thinking...", "bot");
  botEl.classList.add("typing");

  // Simple local auto replies
  if(/who are you|what's your name|your name/i.test(text)){
    const reply = `I'm ${aiName}, your friendly assistant powered by advanced AI.`;
    replaceBot(botEl, reply);
    const botMsg = { role: "assistant", content: reply, timestamp: Date.now() };
    chatMemory.push(botMsg);
    addToGlobalMemory(botMsg);
    saveMemory();
    finishGeneration();
    return;
  }
  if(/who am i|what's my name|my name|who is this|do you know my name/i.test(text)){
    let reply;
    if(userFirstname && userSurname){
      let ageInfo = userAge ? ` and you're ${userAge} years old` : '';
      reply = `You are ${userFirstname} ${userSurname}${ageInfo}! Your information is saved in your Personal Settings. Nice to meet you! 😊`;
    } else if(userFirstname){
      reply = `Your name is ${userFirstname}! I found this in your Personal Settings. 😊`;
    } else if(userSurname){
      reply = `Your surname is ${userSurname}! This is saved in your Personal Settings.`;
    } else {
      reply = "I don't have your name yet! Please click on Settings ⚙️ and go to the Personal tab to add your name so I can remember you. 😊";
    }
    replaceBot(botEl, reply);
    const botMsg = { role: "assistant", content: reply, timestamp: Date.now() };
    chatMemory.push(botMsg);
    addToGlobalMemory(botMsg);
    saveMemory();
    finishGeneration();
    return;
  }
  if(/who is your owner|your owner|your creator/i.test(text)){
    const reply = "I'm owned by Calvin, my owner and developer.";
    replaceBot(botEl, reply);
    const botMsg = { role: "assistant", content: reply, timestamp: Date.now() };
    chatMemory.push(botMsg);
    addToGlobalMemory(botMsg);
    saveMemory();
    finishGeneration();
    return;
  }
  if(/model|which model/i.test(text)){
    const reply = `I'm ${aiName} — I use the Groq API with openai/gpt-oss-20b model.`;
    replaceBot(botEl, reply);
    const botMsg = { role: "assistant", content: reply, timestamp: Date.now() };
    chatMemory.push(botMsg);
    addToGlobalMemory(botMsg);
    saveMemory();
    finishGeneration();
    return;
  }

  // Use Groq API if key is set
  if(GROQ_API_KEY){
    try{
      // Remove timestamp from messages for API compatibility
      const apiMessages = chatMemory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Build system message with user info, AI name, personality, and language
      let systemMessage = `You are ${aiName}, a helpful AI assistant.`;
      
      // Add personality
      const personalityMap = {
        'friendly': 'Be warm, friendly, and casual in your responses.',
        'professional': 'Be professional, formal, and precise in your responses.',
        'humorous': 'Be funny, lighthearted, and entertaining in your responses.',
        'concise': 'Be brief, direct, and to the point in your responses.'
      };
      if(personalityMap[aiPersonality]){
        systemMessage += ` ${personalityMap[aiPersonality]}`;
      }
      
      // Add language preference
      const languageMap = {
        'urdu': 'Respond in Urdu language.',
        'hindi': 'Respond in Hindi language.',
        'spanish': 'Respond in Spanish language.',
        'french': 'Respond in French language.',
        'german': 'Respond in German language.',
        'arabic': 'Respond in Arabic language.'
      };
      if(aiLanguage !== 'english' && languageMap[aiLanguage]){
        systemMessage += ` ${languageMap[aiLanguage]}`;
      }
      
      // Add response length
      const lengthMap = {
        'short': 'Keep responses brief and concise.',
        'medium': 'Provide balanced, moderate-length responses.',
        'long': 'Provide detailed and comprehensive responses.'
      };
      if(lengthMap[responseLength]){
        systemMessage += ` ${lengthMap[responseLength]}`;
      }
      
      // Add user info
      if(userFirstname || userSurname){
        const fullName = [userFirstname, userSurname].filter(n => n).join(" ");
        systemMessage += ` You are chatting with ${fullName}`;
        if(userAge){
          systemMessage += ` (age ${userAge})`;
        }
        systemMessage += '.';
      }
      
      const messagesWithSystem = [
        { role: "system", content: systemMessage },
        ...apiMessages
      ];
      
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({ 
          model: "openai/gpt-oss-20b",
          messages: messagesWithSystem,
          temperature: 1,
          max_tokens: 8192,
          top_p: 1,
          stream: false
        }),
        signal: currentAbortController.signal
      });

      if(response.ok){
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content || "No response";
        replaceBot(botEl, reply);
        const botMsg = { role: "assistant", content: reply, timestamp: Date.now() };
        chatMemory.push(botMsg);
        addToGlobalMemory(botMsg);
        saveMemory();
        finishGeneration();
        return;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`;
        console.error("Groq API error:", errorMsg, errorData);
        replaceBot(botEl, `Error: ${errorMsg}`);
        finishGeneration();
        return;
      }
    }catch(err){
      if(err.name === 'AbortError'){
        replaceBot(botEl, "Response stopped by user.");
        finishGeneration();
        return;
      }
      console.error("Groq error:", err);
      replaceBot(botEl, `Connection error: ${err.message}. Please check your internet connection.`);
      finishGeneration();
      return;
    }
  }

  // If no API key is set
  const errorMsg = "Please add your Groq API key at the top of script.js (GROQ_API_KEY)";
  replaceBot(botEl, errorMsg);
  const botMsg = { role: "assistant", content: errorMsg, timestamp: Date.now() };
  chatMemory.push(botMsg);
  addToGlobalMemory(botMsg);
  saveMemory();
  finishGeneration();
}

function finishGeneration(){
  isGenerating = false;
  currentAbortController = null;
  stopBtn.style.display = "none";
  sendBtn.style.display = "inline-block";
}

function replaceBot(botEl, text){
  botEl.classList.remove("typing");
  botEl.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    if(!isGenerating){
      clearInterval(interval);
      botEl.textContent = text;
      return;
    }
    botEl.textContent += text.charAt(i) || "";
    i++;
    if(i > text.length) clearInterval(interval);
  }, typingSpeed);
}

// ===== MENU & OLD CHATS UI =====
menuBtn.addEventListener("click", e => {
  e.stopPropagation();
  menuDropdown.style.display = menuDropdown.style.display === "block" ? "none" : "block";
});

newChatBtn.addEventListener("click", async () => {
  if(!await customConfirm("Start a new chat? This will clear current conversation locally.")) return;

  if(chatMemory.length > 0 && currentChatId){
    const existingSession = chatSessions.find(s => s.id === currentChatId);
    if(existingSession){
      existingSession.messages = chatMemory;
      existingSession.updatedAt = Date.now();
    }
    saveSessions();
  }

  chatMemory = [];
  currentChatId = null;
  saveMemory();
  saveCurrentChatId();
  chatBox.innerHTML = "";
  sendWebhook("new", userData || {});
  menuDropdown.style.display = "none";
});

oldChatBtn.addEventListener("click", () => {
  renderOldChats();
  oldChatModal.style.display = "flex";
  menuDropdown.style.display = "none";
});

closeOldChat?.addEventListener("click", () => { oldChatModal.style.display = "none"; });

function renderOldChats(){
  if(!oldChatList) return;
  oldChatList.innerHTML = "";

  if(chatSessions.length === 0){
    const li = document.createElement("li");
    li.textContent = "No saved chats yet.";
    oldChatList.appendChild(li);
    return;
  }

  chatSessions.sort((a, b) => b.updatedAt - a.updatedAt);

  chatSessions.forEach((session, idx) => {
    const li = document.createElement("li");
    li.textContent = session.name;
    li.style.cursor = "pointer";

    li.addEventListener("click", () => {
      loadChatSession(session.id);
      oldChatModal.style.display = "none";
    });

    li.addEventListener("contextmenu", async (ev) => {
      ev.preventDefault();
      if(!await customConfirm("Would you delete this chat?", true)) return;
      const deletedChat = {
        chatName: session.name,
        chatId: session.id,
        createdAt: new Date(session.createdAt).toLocaleString(),
        deletedAt: new Date().toLocaleString(),
        messages: session.messages || chatMemory,
        user: userData
      };
      chatSessions.splice(idx, 1);
      saveSessions();
      if(currentChatId === session.id){
        chatMemory = [];
        currentChatId = null;
        saveMemory();
        saveCurrentChatId();
        chatBox.innerHTML = "";
      }
      renderOldChats();
      sendWebhook("delete", userData || {}, deletedChat);
    });

    let pressTimer = null;
    li.addEventListener("touchstart", () => {
      pressTimer = setTimeout(async () => {
        if(await customConfirm("Would you delete this chat?", true)) {
          const deletedChat = {
            chatName: session.name,
            chatId: session.id,
            createdAt: new Date(session.createdAt).toLocaleString(),
            deletedAt: new Date().toLocaleString(),
            messages: session.messages || chatMemory,
            user: userData
          };
          chatSessions.splice(idx, 1);
          saveSessions();
          if(currentChatId === session.id){
            chatMemory = [];
            currentChatId = null;
            saveMemory();
            saveCurrentChatId();
            chatBox.innerHTML = "";
          }
          renderOldChats();
          sendWebhook("delete", userData || {}, deletedChat);
        }
      }, 700);
    });
    li.addEventListener("touchend", () => { if(pressTimer) clearTimeout(pressTimer); });

    oldChatList.appendChild(li);
  });
}

function loadChatSession(sessionId){
  if(chatMemory.length > 0 && currentChatId){
    const existingSession = chatSessions.find(s => s.id === currentChatId);
    if(existingSession){
      existingSession.messages = chatMemory;
      existingSession.updatedAt = Date.now();
      saveSessions();
    }
  }

  const session = chatSessions.find(s => s.id === sessionId);
  if(!session) return;

  currentChatId = sessionId;
  chatMemory = session.messages || [];
  backfillGlobalMemory(chatMemory);
  saveMemory();
  saveCurrentChatId();

  chatBox.innerHTML = "";
  const avatarUrl = userData && userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${parseInt(userData.discriminator||'0')%5}.png`;
  chatMemory.forEach(m => {
    const sender = m.role === "assistant" ? "bot" : "user";
    createMessageElement(m.content, sender, avatarUrl);
  });
}

// ===== SETTINGS =====
// Settings tabs switching
document.querySelectorAll('.settings-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    document.getElementById('personal-settings').style.display = tabName === 'personal' ? 'block' : 'none';
    document.getElementById('general-settings').style.display = tabName === 'general' ? 'block' : 'none';
    document.getElementById('appearance-settings').style.display = tabName === 'appearance' ? 'block' : 'none';
    document.getElementById('advanced-settings').style.display = tabName === 'advanced' ? 'block' : 'none';
    document.getElementById('privacy-settings').style.display = tabName === 'privacy' ? 'block' : 'none';
    document.getElementById('contact-settings').style.display = tabName === 'contact' ? 'block' : 'none';
  });
});

settingsBtn?.addEventListener("click", () => {
  updateMemoryStatus();
  memoryToggle.checked = memoryEnabled;
  themeToggle.checked = darkTheme;
  typingSpeedRange.value = typingSpeed;
  autoScrollToggle.checked = autoScroll;
  compactModeToggle.checked = compactMode;
  userFirstnameInput.value = userFirstname;
  userSurnameInput.value = userSurname;
  userAgeInput.value = userAge;
  if(userCountrySelect) userCountrySelect.value = userCountry;
  aiNameInput.value = aiName;
  aiPersonalitySelect.value = aiPersonality;
  aiLanguageSelect.value = aiLanguage;
  responseLengthSelect.value = responseLength;
  fontSizeSelect.value = fontSize;
  soundEffectsToggle.checked = soundEffects;
  autoSaveToggle.checked = autoSave;
  settingsModal.style.display = "flex";
  profileDropdown.style.display = "none";
});

closeSettings?.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

memoryToggle?.addEventListener("change", () => {
  memoryEnabled = memoryToggle.checked;
  saveMemoryEnabled();
  updateMemoryStatus();
});

themeToggle?.addEventListener("change", () => {
  darkTheme = themeToggle.checked;
  localStorage.setItem("cloud_ai_dark_theme", darkTheme ? "true" : "false");
  applyTheme();
});

typingSpeedRange?.addEventListener("input", () => {
  typingSpeed = parseInt(typingSpeedRange.value);
  localStorage.setItem("cloud_ai_typing_speed", typingSpeed.toString());
});

autoScrollToggle?.addEventListener("change", () => {
  autoScroll = autoScrollToggle.checked;
  localStorage.setItem("cloud_ai_auto_scroll", autoScroll ? "true" : "false");
});

compactModeToggle?.addEventListener("change", () => {
  compactMode = compactModeToggle.checked;
  localStorage.setItem("cloud_ai_compact_mode", compactMode ? "true" : "false");
  // Refresh chat display
  if(userData) showChatUI();
});

userFirstnameInput?.addEventListener("input", () => {
  userFirstname = userFirstnameInput.value.trim();
  localStorage.setItem("cloud_ai_user_firstname", userFirstname);
});

userSurnameInput?.addEventListener("input", () => {
  userSurname = userSurnameInput.value.trim();
  localStorage.setItem("cloud_ai_user_surname", userSurname);
});

aiNameInput?.addEventListener("input", () => {
  aiName = aiNameInput.value.trim() || "Cloud AI";
  localStorage.setItem("cloud_ai_ai_name", aiName);
});

userAgeInput?.addEventListener("input", () => {
  userAge = userAgeInput.value.trim();
  localStorage.setItem("cloud_ai_user_age", userAge);
});

userCountrySelect?.addEventListener("change", () => {
  userCountry = userCountrySelect.value;
  localStorage.setItem("cloud_ai_user_country", userCountry);
});

aiPersonalitySelect?.addEventListener("change", () => {
  aiPersonality = aiPersonalitySelect.value;
  localStorage.setItem("cloud_ai_personality", aiPersonality);
});

aiLanguageSelect?.addEventListener("change", () => {
  aiLanguage = aiLanguageSelect.value;
  localStorage.setItem("cloud_ai_language", aiLanguage);
});

responseLengthSelect?.addEventListener("change", () => {
  responseLength = responseLengthSelect.value;
  localStorage.setItem("cloud_ai_response_length", responseLength);
});

fontSizeSelect?.addEventListener("change", () => {
  fontSize = fontSizeSelect.value;
  localStorage.setItem("cloud_ai_font_size", fontSize);
  applyFontSize();
});

soundEffectsToggle?.addEventListener("change", () => {
  soundEffects = soundEffectsToggle.checked;
  localStorage.setItem("cloud_ai_sound_effects", soundEffects ? "true" : "false");
});

autoSaveToggle?.addEventListener("change", () => {
  autoSave = autoSaveToggle.checked;
  localStorage.setItem("cloud_ai_auto_save", autoSave ? "true" : "false");
});

function applyTheme(){
  if(darkTheme){
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }
}

function applyFontSize(){
  const chatBoxEl = document.getElementById("chat-box");
  if(!chatBoxEl) return;
  chatBoxEl.classList.remove("font-small", "font-medium", "font-large", "font-xlarge");
  chatBoxEl.classList.add(`font-${fontSize}`);
}

// Save Personal Settings Button
const savePersonalSettingsBtn = document.getElementById("save-personal-settings");
savePersonalSettingsBtn?.addEventListener("click", async () => {
  const settingsData = {
    firstname: userFirstname,
    surname: userSurname,
    age: userAge,
    country: userCountry,
    aiName: aiName,
    aiPersonality: aiPersonality,
    aiLanguage: aiLanguage,
    responseLength: responseLength
  };
  
  const settingsInfo = [];
  if(userFirstname || userSurname){
    const fullName = [userFirstname, userSurname].filter(n => n).join(" ");
    settingsInfo.push(`**Name:** ${fullName || "Not set"}`);
  }
  if(userAge) settingsInfo.push(`**Age:** ${userAge}`);
  if(userCountry) settingsInfo.push(`**Country:** ${userCountry.charAt(0).toUpperCase() + userCountry.slice(1)}`);
  settingsInfo.push(`**AI Name:** ${aiName}`);
  settingsInfo.push(`**Personality:** ${aiPersonality}`);
  settingsInfo.push(`**Language:** ${aiLanguage}`);
  settingsInfo.push(`**Response Length:** ${responseLength}`);
  
  sendWebhook("settings", userData, settingsInfo.join("\n"));
  
  const notification = document.createElement("div");
  notification.textContent = "✅ Settings saved successfully!";
  notification.style.cssText = "position:fixed;top:20px;right:20px;background:#10b981;color:#fff;padding:16px 24px;border-radius:12px;font-weight:600;box-shadow:0 4px 20px rgba(16,185,129,0.4);z-index:9999;animation:slideIn 0.3s ease-out;";
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-in";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
});

// ===== TERMS & PRIVACY =====
function checkTermsAgreement(){
  const agreed = localStorage.getItem("cloud_ai_terms_agreed") === "true";
  if(!agreed){
    agreementModal.style.display = "flex";
  }
}

agreeCheckbox?.addEventListener("change", () => {
  agreementAccept.disabled = !agreeCheckbox.checked;
});

agreementAccept?.addEventListener("click", () => {
  if(agreeCheckbox.checked){
    localStorage.setItem("cloud_ai_terms_agreed", "true");
    agreementModal.style.display = "none";
  }
});


showTermsLink?.addEventListener("click", (e) => {
  e.preventDefault();
  termsModal.style.display = "flex";
});

viewFullTerms?.addEventListener("click", (e) => {
  e.preventDefault();
  agreementModal.style.display = "none";
  termsModal.style.display = "flex";
});

closeTermsBtn?.addEventListener("click", () => {
  termsModal.style.display = "none";
  const agreed = localStorage.getItem("cloud_ai_terms_agreed") === "true";
  if(!agreed){
    agreementModal.style.display = "flex";
  }
});

// Initialize memory status
updateMemoryStatus();

// Check terms agreement first
checkTermsAgreement();

// initialize
initAuth();
