import streamlit as st
from pathlib import Path
from langchain.agents import create_sql_agent
from langchain.sql_database import SQLDatabase
from langchain.agents.agent_types import AgentType
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from sqlalchemy import create_engine
import sqlite3
from langchain_groq import ChatGroq
import os

st.set_page_config(page_title="Langchain: Chat with SQL DB", page_icon="🦜")
st.title("🦜 Langchain: Chat with SQL DB")

LOCAL_DB = "USE_LOCALDB"
MYSQL = "USE_MYSQL"

#create radio options
radio_opt = ["Use SQLite3 DB (student.db)", "Connect to your MySQL Database"]

selected_opt = st.sidebar.radio(label="Choose the DB for interaction", options=radio_opt)

if radio_opt.index(selected_opt)==1:
    db_uri = MYSQL
    mysql_host = st.sidebar.text_input("Provide MySQL Host:")
    mysql_user = st.sidebar.text_input("MySQL User:")
    mysql_password = st.sidebar.text_input("MySQL Password :", type="password")
    mysql_db = st.sidebar.text_input("MySQL database")
else:
    db_uri = LOCAL_DB

api_key = st.sidebar.text_input(label="GROQ API KEY", type="password")

if not db_uri:
    st.info("Please enter the database information and uri")

llm = None
if api_key:
    try:
        llm = ChatGroq(
            groq_api_key=api_key.strip(),
            model_name="llama-3.3-70b-versatile",
            streaming=True
        )
        st.success("✅ Groq model initialized successfully!")
    except Exception as e:
        st.error(f"❌ Error initializing Groq model: {e}")
else:
    st.info("Please enter your GROQ API key.")

st.cache_resource(ttl="2h")

def configure_db(db_uri,mysql_host=None,mysql_user=None,mysql_password=None,mysql_db=None):
    if db_uri==LOCAL_DB:
        dbfilepath = (Path(__file__).parent/"student.db").absolute()
        creator = lambda: sqlite3.connect(f"file:{dbfilepath}?mode=ro",uri=True)
        return SQLDatabase(create_engine("sqlite:///",creator=creator))
    elif db_uri==MYSQL:
        if not(mysql_host and mysql_user and mysql_password and mysql_db):
            st.error("Please provide all MySQL connection details.")
            st.stop()
        return SQLDatabase(create_engine(f"mysql+mysqlconnector://{mysql_user}:{mysql_password}@{mysql_host}/{mysql_db}"))
    
if db_uri==MYSQL:
    db = configure_db(db_uri,mysql_host,mysql_user,mysql_password,mysql_db)
else:
    db = configure_db(db_uri)

#Toolkit
if llm is None:
    st.warning("Please enter your API key to continue.")
    st.stop()

toolkit = SQLDatabaseToolkit(db=db,llm=llm)

agent = create_sql_agent(
    llm=llm,
    toolkit=toolkit,
    verbose=True,
    agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION
)

if "messages" not in st.session_state:
    st.session_state["messages"] = [{"role":"assistant","content":"How may I help you?"}]
if st.sidebar.button("🗑️ Clear message history"):
    st.session_state["messages"] = [{"role":"assistant","content":"How may I help you?"}]
    st.rerun()

for msg in st.session_state.messages:
    st.chat_message(msg["role"]).write(msg["content"])

user_query = st.chat_input(placeholder="Ask anything from the Database")

if user_query:
    st.session_state.messages.append({"role":"user","content":user_query})
    st.chat_message("user").write(user_query)

    with st.chat_message("assistant"):
        with st.spinner("🤖 Thinking... Getting your answer ready."):
         response = agent.run(user_query)
         if isinstance(response, str) and response.startswith("|"):
            st.markdown(response)  # nicely renders markdown tables
         else:
            st.write(response)

         st.session_state.messages.append({"role": "assistant", "content": response})





