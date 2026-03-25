# 🤖 Chat-with-SQLDB: Natural Language Data Analytics

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![LangChain](https://img.shields.io/badge/AI-LangChain-121011?style=flat-square)](https://www.langchain.com/)
[![Groq](https://img.shields.io/badge/LLM-Llama_3.3_70B-orange?style=flat-square)](https://groq.com/)

**Chat-with-SQLDB** is an intelligent data interface that bridges the gap between non-technical users and structured databases. By leveraging **LLMs (Llama 3.3)** and **LangChain Agents**, it translates complex natural language questions into optimized SQL queries, executes them securely, and returns human-readable insights.

## 💡 Why This Project?
Data is only useful if it's accessible. Traditional BI tools require SQL knowledge or complex interfaces. **Chat-with-SQLDB** democratizes data access by allowing anyone to "talk" to their database. It handles the "translation layer" so business users can get insights in seconds, not hours.

### 💬 Example Queries You Can Ask:
> "Show me all orders over $500 from the last 30 days."
> "Who are the top 3 customers in New York based on total spending?"
> "List products that have less than 10 items in stock."
---

## 🚀 Key Features

* **Natural Language to SQL:** Transform "Who are our top 5 customers by spend?" into complex JOINs and aggregations automatically.
* **Context-Aware Memory:** Maintains session history to allow follow-up questions (e.g., "Now filter those by city").
* **Dynamic Schema Exploration:** Automatically inspects database metadata to build context for the LLM without manual mapping.
* **Security Focused:** Uses read-only database connections and Pydantic validation to ensure API integrity.

---

## 🛠️ Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | Component-based UI & State Management |
| **Backend** | FastAPI | High-performance asynchronous API |
| **AI Orchestration** | LangChain | Agentic workflow & SQL Chain management |
| **LLM** | Groq (Llama 3.3 70B) | High-speed inference for SQL generation |
| **Database** | SQLite / MySQL | Structured data storage |
| **ORM** | SQLAlchemy | Database abstraction & Connection pooling |

## 📂 Project Structure

* **Chat-with-SQLDB/**
    * **backend/** — *FastAPI Server*
        * **db/** — Database connection & seed scripts
        * **models/** — Pydantic schemas for API validation
        * **routes/** — REST Endpoints (Chat, Schema)
        * **services/** — AI Logic (LLM Agent, Sessions)
        * **main.py** — Application entry point
    * **frontend/** — *React + Vite App*
        * **src/**
            * **components/** — Modular UI (Sidebar, Chat, Charts)
            * **App.jsx** — Main application logic
    * **package.json** — Frontend dependencies


## ⚙️ Setup & Installation

### 1. Backend Setup
* Navigate to the backend directory: **cd backend**
* Install dependencies: **pip install -r requirements.txt**
* Create a **.env** file and add your credentials:
    * **GROQ_API_KEY** = your_api_key_here
    * **DATABASE_URL** = sqlite:///./student.db
* Start the server: **uvicorn main:app --reload**

### 2. Frontend Setup
* Navigate to the frontend directory: **cd frontend**
* Install dependencies: **npm install**
* Launch the development server: **npm run dev**

## 🛠️ Technical Challenges & Solutions

* **Mitigating Hallucinations:** I implemented a dynamic schema-injection layer. Instead of the LLM "guessing" table names, the backend fetches the actual database metadata and injects it into the prompt context at runtime.
* **Prompt Engineering for SQL:** To prevent the AI from making common JOIN errors, I refined the system instructions to explicitly define relationship mappings between foreign keys.
* **Security & Data Integrity:** To protect against "Prompt Injection" (e.g., "Delete all users"), the application uses a restricted, read-only database connection and Pydantic models to validate all incoming API payloads.

## 🧠 How It Works: The Reasoning Loop

1. **Input:** User submits a query via the React interface.
2. **Schema Context:** The backend fetches the current DB schema (tables, columns, types) using SQLAlchemy inspection.
3. **Agent Logic:** The LangChain agent receives the user prompt and schema context to "reason" through the required SQL logic.
4. **Execution:** The generated SQL is executed via a secure, read-only database connection.
5. **Synthesis:** The raw result set is passed back to the LLM (Llama 3.3) to format a conversational, data-driven response.

---

## 📈 Future Roadmap

* [ ] **SQL Explainability:** Show users the "thought process" and the generated SQL code for transparency.
* [ ] **Data Visualization:** Auto-generate Recharts components for trend-based queries.
* [ ] **Streaming Responses:** Implement Server-Sent Events (SSE) for a real-time "typing" feel.
* [ ] **Multi-DB Support:** Expand to PostgreSQL and cloud-hosted data warehouses.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

---
**Developed by Janay Rawal** *Passionate about bridging the gap between AI and traditional software engineering.*