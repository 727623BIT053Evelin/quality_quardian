import streamlit as st
import pandas as pd
from io import BytesIO

from backend.pipeline.data_quality_pipeline import run_data_quality_pipeline

st.set_page_config(
    page_title="Sentinel AI - Data Quality Guardian",
    layout="wide"
)

st.title("Sentinel AI – Data Quality Guardian")

uploaded_file = st.file_uploader("Upload CSV file", type=["csv"])

if uploaded_file:
    try:
        df = pd.read_csv(uploaded_file)
        st.success("File uploaded successfully")

        st.subheader("Original Data")
        st.dataframe(df.head(10))

        if st.button("Run Data Quality Pipeline"):
            with st.spinner("Processing..."):
                df_clean = run_data_quality_pipeline(df)

            st.success("Processing completed")

            st.subheader("Cleaned Data")
            st.dataframe(df_clean.head(10))

            output = BytesIO()
            df_clean.to_csv(output, index=False)
            output.seek(0)

            st.download_button(
                "Download Cleaned CSV",
                data=output,
                file_name="cleaned_data.csv",
                mime="text/csv"
            )

    except Exception as e:
        st.error(f"Error: {e}")
