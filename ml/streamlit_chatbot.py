import streamlit as st
import pandas as pd
import numpy as np
import time
from io import BytesIO
from analyzer import DataAnalyzer
from backend.pipeline.data_quality_pipeline import run_data_quality_pipeline

st.set_page_config(page_title="Guardian AI - Data Consultant", layout="wide", page_icon="🛡️")

# Custom CSS for a premium DARK theme
st.markdown("""
<style>
    .stApp {
        background-color: #0f172a;
        color: #f8fafc;
    }
    .chat-bubble {
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
    /* Dynamic adjustments for dark mode chat */
    [data-testid="stChatMessage"] {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        margin-bottom: 10px;
        color: #ffffff;
    }
    /* Ensure text in inputs and assistants is white */
    .stChatMessage p {
        color: #f8fafc !important;
    }
</style>
""", unsafe_allow_html=True)

# --- Sidebar ---
with st.sidebar:
    st.title("🛡️ Guardian AI")
    st.info("I am your Data Quality Consultant. Upload a file to start the audit.")
    uploaded_file = st.file_uploader("Upload CSV/XLSX", type=["csv", "xlsx"])
    
    if st.button("Clear Conversation"):
        st.session_state.messages = []
        st.rerun()

# --- Logic ---
if "messages" not in st.session_state:
    st.session_state.messages = []

if "df" not in st.session_state:
    st.session_state.df = None
    st.session_state.report = None

def get_assistant_response(prompt, df, report):
    prompt = prompt.lower().strip()
    
    if df is None:
        return "Please upload a data file first so I can analyze it for you! 📈"

    # Analyze metadata
    rows = len(df)
    cols = list(df.columns)
    
    # 1. Affirmative / Follow-up Logic
    affirmative_words = ["yes", "proceed", "go ahead", "do it", "ok", "okay", "give it", "yes give"]
    if any(word == prompt for word in affirmative_words) or (prompt == "how"):
        return """To apply the fixes and clean your data, please **click the '🚀 Run Quality Pipeline' button** located in the sidebar on the left. 
        
Once clicked, I will:
- **Repair Contacts**: Fix invalid phone numbers and emails.
- **Normalize Dates**: Convert inconsistent founded dates to a standard format.
- **Deduplicate**: Remove those redundant records.
- **Impute**: Fill in the missing B2B metadata.

Would you like me to walk you through any specific error I found first?"""

    # 2. Specific Analysis Questions
    if any(x in prompt for x in ["how many records", "total rows", "size", "count"]):
        return f"Your dataset contains **{rows} total records** across **{len(cols)} features**."
    
    if any(x in prompt for x in ["column", "feature", "attribute", "fields"]):
        return f"The features identified in this dataset are: \n\n" + "\n".join([f"- {c}" for c in cols])

    if any(x in prompt for x in ["missing", "null", "empty", "nan"]):
        missing = report.get("missing_values", {})
        if not missing:
            return "Great news! I found **zero missing values** in this dataset. It's looking very complete! ✅"
        
        resp = f"I detected missing values in **{len(missing)} columns**. Here is the breakdown:\n\n"
        for col, count in missing.items():
            resp += f"- **{col}**: {count} missing records\n"
        return resp + "\n\nYou can correct these by clicking **'Run Quality Pipeline'** in the sidebar!"

    if "duplicate" in prompt:
        dups = report.get("duplicates", 0)
        if dups == 0:
            return "Your data is unique! I found **no duplicate rows**. 💎"
        return f"I found **{dups} duplicate records**. These can be removed instantly using our pipeline's deduplication step."

    if any(x in prompt for x in ["invalid", "error", "format", "inconsistent"]):
        issues = report.get("formatting_issues", {})
        if not issues:
            return "All your emails, phone numbers, and dates follow standard B2B patterns! No formatting errors detected. ✨"
        
        resp = "I found some formatting inconsistencies that need attention:\n\n"
        for col, count in issues.items():
            resp += f"- **{col}**: {count} invalid entries\n"
        return resp + "\n\nI can fix these instantly—just say the word or click **'Run Quality Pipeline'**!"

    if any(x in prompt for x in ["score", "health", "quality"]):
        score = report.get("quality_score", 0)
        if score > 80:
            emoji = "Excellent! 🌟"
        elif score > 50:
            emoji = "Good, but needs work. ⚙️"
        else:
            emoji = "Critical issues detected. ⚠️"
        return f"The overall **Quality Health Score** is **{score}/100**. {emoji} \n\nThis score is calculated based on missing values, duplicates, and formatting errors."

    if any(x in prompt for x in ["fix", "clean", "improve", "how to"]):
        return """I recommend running the full **Quality Guardian Pipeline**. It's the most efficient way to resolve these issues. Here is the process:
1.  **Phone/Date Repair**: I'll standardize all formatting errors.
2.  **Revenue Imputation**: I'll fill missing revenue based on industry medians.
3.  **Name Validation**: I'll filter 'test' or 'junk' names from your lead list.

**Ready to clean?** Click the rocket button in the sidebar! 🚀"""

    return "I'm here to help! You can ask me about **'missing values'**, **'duplicates'**, **'quality score'**, or even ask **'how to fix'** the errors I've found."

# --- Main Interface ---
st.title("Quality_Guardian AI-Data Quality Assistant")

if uploaded_file:
    if st.session_state.df is None:
        with st.spinner("Analyzing your data..."):
            try:
                if uploaded_file.name.endswith('.csv'):
                    df = pd.read_csv(uploaded_file)
                else:
                    df = pd.read_excel(uploaded_file)
                
                st.session_state.df = df
                analyzer = DataAnalyzer(df)
                st.session_state.report = analyzer.analyze()
                
                # Initial greeting
                st.session_state.messages.append({
                    "role": "assistant", 
                    "content": f"Hello! I've analyzed **{uploaded_file.name}**. It has {len(df)} rows. How can I help you audit this data today?"
                })
            except Exception as e:
                st.error(f"Error loading file: {e}")

# Display chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Chat input
if prompt := st.chat_input("Ask me about your data..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # Generate response
    response = get_assistant_response(prompt, st.session_state.df, st.session_state.report)
    
    # Add assistant response
    with st.chat_message("assistant"):
        st.markdown(response)
    st.session_state.messages.append({"role": "assistant", "content": response})

# Sidebar cleaning action
if st.session_state.df is not None:
    with st.sidebar:
        st.divider()
        if st.button("🚀 Run Quality Pipeline"):
            with st.spinner("Cleaning data..."):
                clean_df = run_data_quality_pipeline(st.session_state.df)
                st.session_state.df = clean_df
                # Re-analyze
                analyzer = DataAnalyzer(clean_df)
                st.session_state.report = analyzer.analyze()
                st.success("Data Cleaned!")
                
                output = BytesIO()
                clean_df.to_csv(output, index=False)
                output.seek(0)
                st.download_button("Download Cleaned CSV", output, "cleaned_data.csv", "text/csv")
