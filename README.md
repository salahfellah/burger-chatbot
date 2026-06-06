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

