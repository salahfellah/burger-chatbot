from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).with_name(".env"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
MODEL_NAME = "gemini-2.5-flash"

# ─── Restaurant config ───────────────────────────────────────────────────────
# To reuse for another client, just change this block.
RESTAURANT_CONFIG = {
    "name": "The Burger Den",
    "tagline": "When Hunger Strikes",
    "type": "Online only — no physical dine-in",
    "ordering": "Order via theburgerden.com or DoorDash, Uber Eats, Postmates",
    "support": "Contact your delivery platform directly for order issues",
    "menu": """
BEEF BURGERS:
- Double the Fun: Two beef patties, American cheese, caramelized onions, Creamy BBQ sauce on brioche
- Spill the Bourbon: Beef, white cheddar, bacon, mushrooms, fire-roasted peppers, bourbon sauce, lettuce, tomato, pickles
- Wake and Bacon: Beef, hash browns, egg, bacon, American cheese on brioche
- Rodeo Ring: Beef, white cheddar, beer-battered onion rings, BBQ sauce, lettuce, tomato, pickles
- Vibe with Shrooms: Beef, garlic mushrooms, caramelized onions, Swiss cheese, All-American sauce
- Mad for Mozza: Beef, American cheese, Mozzarella Sticks, tomato dipping sauce
- Build Me Up: Customizable — beef, chicken, or veggie patty. Lettuce, tomato, onions, pickles

CHICKEN BURGERS:
- Pig N Chicken: Grilled chicken, Swiss cheese, bacon, honey mustard, lettuce, tomato, pickles
- Raid the Roost: Grilled chicken, white cheddar, bacon, BBQ sauce, lettuce, tomato, pickles
- Baja Beach Chicken: Grilled chicken, avocado, pico de gallo, lettuce, tomato, pickles
- Fire it Up: Fried chicken in buffalo sauce, lettuce, pickles

VEGGIE BURGERS:
- Baja Beach Veggie: Dr. Prager's Veggie Patty, avocado, pico de gallo, lettuce, tomato, pickles
- Rodeo Ring Veggie: Dr. Prager's Veggie Patty, white cheddar, onion rings, BBQ sauce

KIDS:
- Just For Kids: Small beef patty, American cheese

SIDES:
- Wavy-Cut Fries, Seasoned Fries, Onion Rings, Seasonal Fruit

DESSERTS:
- Milkshakes: Vanilla, Chocolate, Strawberry, OREO, Strawberry Cheesecake — with premium ice cream + whipped cream
- New York Cheesecake: Plain or with strawberry topping

ALLERGEN NOTE: Veggie patty may contact animal products. Cheese is not plant-based.
"""
}

def build_system_prompt(config: dict) -> str:
    return f"""You are a friendly AI assistant for {config['name']} — "{config['tagline']}".
Be concise, warm, and helpful. Use short answers. No long lists unless the customer asks.

RESTAURANT INFO:
- Type: {config['type']}
- How to order: {config['ordering']}
- Order issues: {config['support']}

MENU:
{config['menu']}

Rules:
- If asked about prices, say they vary by platform and to check the ordering app directly.
- If asked something you don't know, say you're not sure and suggest they visit the website.
- Never make up information.
- Keep it short and friendly. Max 3-4 sentences per reply.
"""

def get_model():
    return genai.GenerativeModel(
        MODEL_NAME,
        system_instruction=build_system_prompt(RESTAURANT_CONFIG),
        generation_config={
            "temperature": 0.2,
            "max_output_tokens": 220,
        },
    )

# ─── Models ──────────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "restaurant": RESTAURANT_CONFIG["name"]}

@app.post("/chat")
async def chat(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="No messages provided")
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not set. Add a valid Gemini API key to backend/.env.",
        )

    # Build Gemini conversation history
    history = []
    for msg in request.messages[:-1]:
        history.append({
            "role": "user" if msg.role == "user" else "model",
            "parts": [msg.content]
        })

    last_message = request.messages[-1].content

    try:
        chat_session = get_model().start_chat(history=history)
        response = chat_session.send_message(last_message)
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
