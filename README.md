# 🤖 SQL Intelligence — Natural Language Data Analytics

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![LangChain](https://img.shields.io/badge/AI-LangChain-121011?style=flat-square)](https://www.langchain.com/)
[![Groq](https://img.shields.io/badge/LLM-Llama%204%20Scout%2017B-orange?style=flat-square)](https://groq.com/)

**SQL Intelligence** is a production-grade AI-powered data assistant that lets anyone query a database using plain English. It translates natural language questions into SQL, executes them securely, visualizes results as interactive charts, and surfaces key insights — no SQL knowledge required.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗣️ **Natural Language Queries** | Ask questions in plain English — get SQL, charts, and summaries. |
| 📊 **Auto Data Visualization** | Intelligent chart selection (bar, line, pie) with Recharts based on data shape. |
| 💡 **Automated Insights** | AI generates concise, actionable insights based on the retrieved data patterns. |
| 🔍 **Follow-up Suggestions** | AI-generated follow-up questions for deeper continuous analysis. |
| ⚡ **Response Caching** | Built-in query caching layer to accelerate repeated queries. |
| 🔑 **Frictionless Auth** | JWT-based auth with instant signup and a secure 4-digit PIN for password recovery (no email required). |
| 🗄️ **Multi-DB Support** | Connect to the built-in SQLite demo dataset or your own external MySQL database. |
| 📜 **Session History** | Persisted chat sessions per user with full context memory. |
| 🔎 **Live Schema Inspection** | Dynamic schema explorer to view available tables, columns, and row counts. |

---

## 🛠️ Tech Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | React 18, Vite, Tailwind CSS v4, shadcn/ui, Recharts |
| **Backend** | FastAPI, Python 3.11+, Uvicorn |
| **AI** | LangChain, Groq (Llama-4-Scout-17b) |
| **Auth** | JWT (python-jose), bcrypt, Custom PIN-based recovery |
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
│   ├── services/            # Business logic (LLM, auth, session, cache)
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

## 🧠 Architecture & Data Flow

```
User Query → React Frontend
     ↓ POST /api/chat
FastAPI Backend (Session context retrieval)
     ↓ schema inspection
SQLAlchemy → SQLite/MySQL schema context
     ↓ prompt construction
LangChain + Groq (Llama-4-Scout-17b)
     ↓ SQL generation + execution
Backend Services (Data extraction, Cache check, Insight generation)
     ↓ 
Result → Chart data + Tabular Data + Insights + Follow-up questions
     ↓
React Frontend renders charts, data tables, and summaries
```

---

## 🚧 Current Limitations
- **External Databases**: Currently only supports MySQL and SQLite. PostgreSQL support is not yet implemented.
- **Data Export**: No built-in functionality to export retrieved tabular data or charts (e.g., CSV/PDF export).
- **Advanced Querying**: Heavily relies on the LLM's capability to understand complex multi-join natural language queries.

## 🗺️ Roadmap
- Implement PostgreSQL database support.
- Add CSV data export functionality for query results.
- Implement specialized AI agents for deep data analysis (Agentic workflows).
- Add support for local LLM inference via Ollama.
- Add Model Context Protocol (MCP) integrations.

---

## 📄 License

MIT License — see `LICENSE` for details.
