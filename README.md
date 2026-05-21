# AI Chatbot - Burger Den Demo

A reusable AI chatbot widget for restaurants or other businesses.
Built with FastAPI, Gemini, and an embeddable JavaScript widget.

## Project Structure

```text
burger-chatbot/
├── backend/
│   ├── main.py          # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   ├── index.html       # GitHub Pages demo page
│   └── widget/
│       └── chatbot.js   # Widget served by GitHub Pages
└── render.yaml          # Render deploy config
```

## Run Locally

```bash
cd backend
cp .env.example .env
# Add your Gemini API key to .env

pip install -r requirements.txt
uvicorn main:app --reload
```

Open `docs/index.html` in your browser. The chat widget will appear bottom-right.

## Deploy Backend To Render

1. Push this folder to a GitHub repo.
2. Go to Render and create a new web service.
3. Connect your GitHub repo.
4. Use the repo root with the `render.yaml` blueprint, or set Root Directory to `backend`.
5. Add `GEMINI_API_KEY` as an environment variable.
6. Deploy.

Once deployed, update the widget script tag in `docs/index.html`:

```html
<script src="./widget/chatbot.js" data-api="https://your-app.onrender.com"></script>
```

## Deploy Frontend To GitHub Pages

Set GitHub Pages to serve from the `docs/` folder on the `main` branch.

## Reuse For A New Client

Only a few things need to change:

1. Update `RESTAURANT_CONFIG` in `backend/main.py`.
2. Update `CONFIG` colors and name in `docs/widget/chatbot.js`.
3. Redeploy the backend and GitHub Pages site.

## Get A Gemini API Key

1. Go to https://aistudio.google.com
2. Sign in with Google.
3. Click "Get API Key".
4. Add it to `backend/.env` locally and to Render as `GEMINI_API_KEY`.
