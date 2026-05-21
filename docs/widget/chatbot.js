/**
 * Burger Den Chatbot Widget
 * Usage: <script src="chatbot.js" data-api="YOUR_BACKEND_URL"></script>
 * Replace data-api with your deployed Render URL
 */

(function () {
  const script = document.currentScript;
  const API_URL = (script && script.getAttribute("data-api")) || "http://localhost:8000";

  const CONFIG = {
    name: "The Burger Den",
    subtitle: "AI assistant • Online only",
    color: "#c0392b",
    greeting: "Hey! 👋 Welcome to The Burger Den. Ask me anything about our menu or how to order!",
  };

  // ─── Inject styles ─────────────────────────────────────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    #bd-widget-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${CONFIG.color}; border: none; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; transition: transform 0.2s;
    }
    #bd-widget-btn:hover { transform: scale(1.08); }
    #bd-widget-btn svg { width: 26px; height: 26px; fill: white; }

    #bd-chat-window {
      position: fixed; bottom: 92px; right: 24px;
      width: 360px; max-height: 520px;
      background: #fff; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      display: flex; flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px; z-index: 9998;
      transform: scale(0.95) translateY(10px);
      opacity: 0; pointer-events: none;
      transition: all 0.2s ease;
    }
    #bd-chat-window.open {
      transform: scale(1) translateY(0);
      opacity: 1; pointer-events: all;
    }

    #bd-header {
      background: ${CONFIG.color}; border-radius: 16px 16px 0 0;
      padding: 14px 16px; display: flex; align-items: center; gap: 10px;
    }
    #bd-header-avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    #bd-header-name { color: #fff; font-weight: 600; font-size: 14px; }
    #bd-header-sub { color: rgba(255,255,255,0.8); font-size: 11px; }
    #bd-online-dot {
      margin-left: auto; width: 8px; height: 8px;
      border-radius: 50%; background: #2ecc71;
    }

    #bd-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      background: #f5f5f5; max-height: 320px;
    }

    .bd-msg-row {
      display: flex; gap: 8px; align-items: flex-end;
    }
    .bd-msg-row.user { flex-direction: row-reverse; }

    .bd-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: ${CONFIG.color}; display: flex;
      align-items: center; justify-content: center;
      font-size: 13px; flex-shrink: 0;
    }

    .bd-bubble {
      max-width: 78%; padding: 9px 13px; border-radius: 12px;
      line-height: 1.55; font-size: 13px;
    }
    .bd-bubble.bot {
      background: #fff; border-radius: 12px 12px 12px 2px;
      border: 1px solid #e8e8e8; color: #222;
    }
    .bd-bubble.user {
      background: ${CONFIG.color}; border-radius: 12px 12px 2px 12px;
      color: #fff;
    }
    .bd-bubble.typing { color: #999; font-style: italic; }

    #bd-quick-btns {
      padding: 8px 10px 0;
      background: #fafafa;
      display: flex; flex-wrap: wrap; gap: 6px;
    }
    .bd-quick {
      font-size: 11px; padding: 5px 11px; border-radius: 20px;
      background: #fff; border: 1px solid #ddd;
      cursor: pointer; color: #555;
      transition: background 0.15s;
    }
    .bd-quick:hover { background: #f0f0f0; }

    #bd-input-row {
      padding: 10px; display: flex; gap: 8px;
      border-top: 1px solid #eee; background: #fafafa;
      border-radius: 0 0 16px 16px;
    }
    #bd-input {
      flex: 1; padding: 9px 13px; border-radius: 20px;
      border: 1px solid #ddd; font-size: 13px;
      outline: none; background: #fff;
    }
    #bd-input:focus { border-color: ${CONFIG.color}; }
    #bd-send {
      width: 36px; height: 36px; border-radius: 50%;
      background: ${CONFIG.color}; border: none;
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0;
    }
    #bd-send svg { width: 16px; height: 16px; fill: white; }
    #bd-send:hover { opacity: 0.88; }
  `;
  document.head.appendChild(style);

  // ─── Build HTML ────────────────────────────────────────────────────────────
  const btn = document.createElement("button");
  btn.id = "bd-widget-btn";
  btn.setAttribute("aria-label", "Open chat");
  btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;

  const win = document.createElement("div");
  win.id = "bd-chat-window";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", `${CONFIG.name} chat`);
  win.innerHTML = `
    <div id="bd-header">
      <div id="bd-header-avatar">🍔</div>
      <div>
        <div id="bd-header-name">${CONFIG.name}</div>
        <div id="bd-header-sub">${CONFIG.subtitle}</div>
      </div>
      <div id="bd-online-dot"></div>
    </div>
    <div id="bd-messages"></div>
    <div id="bd-quick-btns">
      <button class="bd-quick" onclick="bdQuick('What burgers do you have?')">🍔 Burgers</button>
      <button class="bd-quick" onclick="bdQuick('How do I order?')">📦 How to order</button>
      <button class="bd-quick" onclick="bdQuick('Any veggie options?')">🥦 Veggie</button>
      <button class="bd-quick" onclick="bdQuick('What desserts do you have?')">🍦 Desserts</button>
    </div>
    <div id="bd-input-row">
      <input id="bd-input" type="text" placeholder="Ask me anything..." />
      <button id="bd-send" aria-label="Send">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(win);

  // ─── Logic ─────────────────────────────────────────────────────────────────
  let history = [];
  let isLoading = false;
  const msgsEl = win.querySelector("#bd-messages");

  function addMessage(text, role) {
    const row = document.createElement("div");
    row.className = `bd-msg-row ${role}`;
    if (role === "bot") {
      row.innerHTML = `<div class="bd-avatar">🍔</div><div class="bd-bubble bot">${text}</div>`;
    } else {
      row.innerHTML = `<div class="bd-bubble user">${text}</div>`;
    }
    msgsEl.appendChild(row);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    return row;
  }

  function addTyping() {
    const row = addMessage("Typing...", "bot");
    row.id = "bd-typing";
    row.querySelector(".bd-bubble").classList.add("typing");
    return row;
  }

  function removeTyping() {
    const el = document.getElementById("bd-typing");
    if (el) el.remove();
  }

  async function send(text) {
    if (!text || isLoading) return;
    isLoading = true;
    addMessage(text, "user");
    history.push({ role: "user", content: text });
    addTyping();

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `Chat API returned ${res.status}`);
      }
      removeTyping();
      const reply = data.reply || "Sorry, I couldn't get a response. Please try again!";
      console.debug("[Burger Den chatbot]", { source: data.source || "unknown" });
      addMessage(reply, "bot");
      history.push({ role: "assistant", content: reply });
    } catch (error) {
      console.error("Burger Den chatbot error:", error);
      removeTyping();
      addMessage("Sorry, the chatbot API is not responding correctly. Please check the backend API key.", "bot");
    }
    isLoading = false;
  }

  // Greeting
  addMessage(CONFIG.greeting, "bot");

  // Events
  btn.addEventListener("click", () => {
    win.classList.toggle("open");
    if (win.classList.contains("open")) {
      win.querySelector("#bd-input").focus();
    }
  });

  win.querySelector("#bd-send").addEventListener("click", () => {
    const input = win.querySelector("#bd-input");
    send(input.value.trim());
    input.value = "";
  });

  win.querySelector("#bd-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      send(e.target.value.trim());
      e.target.value = "";
    }
  });

  window.bdQuick = (text) => send(text);
})();
