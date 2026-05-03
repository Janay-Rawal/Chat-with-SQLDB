# 🤖 SQL Intelligence — Natural Language Data Analytics

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![LangChain](https://img.shields.io/badge/AI-LangChain-121011?style=flat-square)](https://www.langchain.com/)
[![Groq](https://img.shields.io/badge/LLM-Llama%203.3%2070B-orange?style=flat-square)](https://groq.com/)

**SQL Intelligence** is a production-grade AI-powered data assistant that lets anyone query a database using plain English. It translates natural language questions into SQL, executes them securely, visualizes results as interactive charts, and surfaces key insights — no SQL knowledge required.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗣️ **Natural Language Queries** | Ask questions in plain English — get SQL, charts, and summaries |
| 📊 **Auto Data Visualization** | Intelligent chart selection (bar, line, pie) with Recharts |
| 🔍 **Follow-up Suggestions** | AI-generated follow-up questions for deeper analysis |
| 🔑 **Auth System** | JWT-based signup/login with email verification |
| 🗄️ **Multi-DB Support** | Connect to the built-in SQLite demo or your own MySQL database |
| 📜 **Session History** | Persisted chat sessions per user with full context memory |
| 🎨 **Dark/Light Mode** | Full theme toggle with a premium SaaS design |
| 📱 **Responsive** | Works across desktop and mobile |

### Example Queries
> *"Show me the top 5 customers by total spending"*  
> *"Which product category generates the most revenue?"*  
> *"How many orders were placed each month in 2024?"*

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18, Vite, Tailwind CSS v4, shadcn/ui, Recharts |
| **Backend** | FastAPI, Python 3.11+, Uvicorn |
| **AI** | LangChain, Groq (Llama 3.3 70B) |
| **Auth** | JWT (python-jose), bcrypt, email verification via Gmail SMTP |
| **Database** | SQLite (demo + user data), MySQL (external connections) |
| **ORM** | SQLAlchemy 2.0 |

---

## 📂 Project Structure

```
Chat-with-SQLDB/
├── backend/
│   ├── db/                  # DB connection modules (app_db, query_db)
│   ├── models/              # SQLAlchemy models (User, ChatHistory)
│   ├── routes/              # API endpoints (chat, schema, auth)
│   ├── services/            # Business logic (LLM, auth, email, session, cache)
│   ├── main.py              # FastAPI entry point
│   ├── student.db           # Demo dataset (SQLite)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (ChatWindow, AuthScreen, Dashboard, etc.)
│   │   └── App.jsx          # Main app with routing
│   ├── .env                 # Local dev env
│   └── package.json
└── render.yaml              # Render.com deployment config
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- A [Groq API key](https://console.groq.com/)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) enabled

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET_KEY=your_random_secret_here
SENDER_EMAIL=your_gmail@gmail.com
SENDER_APP_PASSWORD=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173
```

```bash
uvicorn main:app --reload
# API available at http://localhost:8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## 🚀 Deployment

This project is configured to deploy:
- **Backend → [Render](https://render.com)** (via `render.yaml`)
- **Frontend → [Vercel](https://vercel.com)**

### Backend (Render)
1. Connect your GitHub repo in the Render dashboard
2. Render will detect `render.yaml` automatically
3. Set the following **Environment Variables** in the Render dashboard:
   - `GROQ_API_KEY`
   - `JWT_SECRET_KEY`
   - `SENDER_APP_PASSWORD`
   - `FRONTEND_URL` → your Vercel URL (e.g. `https://your-app.vercel.app`)
   - `ALLOWED_ORIGINS` → same as above

### Frontend (Vercel)
1. Import the GitHub repo in Vercel
2. Set **Root Directory** to `frontend`
3. Set the environment variable:
   - `VITE_API_URL` → your Render backend URL (e.g. `https://chat-with-sqldb-backend.onrender.com`)
4. Deploy

---

## 🧠 How It Works

```
User Query → React Frontend
     ↓ POST /api/chat
FastAPI Backend
     ↓ schema inspection
SQLAlchemy → SQLite/MySQL schema context
     ↓ prompt construction
LangChain + Groq (Llama 3.3 70B)
     ↓ SQL generation + execution
Result → Chart data + Insights + Follow-up questions
     ↓
React Frontend renders charts, tables, and summaries
```

---

## 📄 License

MIT License — see `LICENSE` for details.

---

**Developed by [Janay Rawal](https://github.com/Janay-Rawal)** · *Bridging the gap between AI and traditional software engineering.*