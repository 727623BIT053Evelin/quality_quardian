import pandas as pd
import os
import sys

# Ensure current directory is in path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.pipeline.data_quality_pipeline import run_data_quality_pipeline

def test():
    data = {
        'company_name': ['A', 'B'],
        'founded_date': ['2020-01-01', None],
        'company_age': [None, None]
    }
    df = pd.DataFrame(data)
    
    print("RUNNING PIPELINE...")
    try:
        cleaned_df = run_data_quality_pipeline(df)
        print("PIPELINE SUCCESS!")
        print("Columns:", cleaned_df.columns.tolist())
        print("Data:\n", cleaned_df[['company_name', 'founded_date', 'company_age']])
    except Exception as e:
        import traceback
        print("PIPELINE FAILED!")
        traceback.print_exc()

if __name__ == "__main__":
    test()
