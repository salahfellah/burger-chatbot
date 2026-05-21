# 🍔 AI Chatbot — Burger Den Demo

A reusable AI chatbot widget for restaurants (or any business).
Built with FastAPI + Gemini + embeddable JS widget.

---

## Project Structure

```
burger-chatbot/
├── backend/
│   ├── main.py          ← FastAPI app (edit RESTAURANT_CONFIG to reuse)
│   ├── requirements.txt
│   └── .env.example
├── widget/
│   └── chatbot.js       ← Embeddable widget (drop on any website)
├── demo/
│   └── index.html       ← Demo page
└── render.yaml          ← Render deploy config
```

---

## Run Locally

```bash
cd backend
cp .env.example .env
# Add your Gemini API key to .env

pip install -r requirements.txt
uvicorn main:app --reload
```

Open `demo/index.html` in your browser — the chat widget will appear bottom-right.

---

## Deploy to Render (Free)

1. Push this folder to a GitHub repo
2. Go to https://render.com → New Web Service
3. Connect your GitHub repo
4. Set Root Directory: `backend`
5. Add env variable: `GEMINI_API_KEY = your_key_here`
6. Click Deploy

Once deployed, update the widget script tag in `demo/index.html`:
```html
<script src="chatbot.js" data-api="https://your-app.onrender.com"></script>
```

---

## Reuse for a New Client

Only 3 things to change in `backend/main.py`:

1. Update `RESTAURANT_CONFIG` with the new client's info and menu
2. Update `CONFIG` colors and name in `widget/chatbot.js`
3. Redeploy

That's it. New client, 30 minutes of work.

---

## Get a Gemini API Key (Free)

1. Go to https://aistudio.google.com
2. Sign in with Google
3. Click "Get API Key"
4. Copy it to your `.env` file
