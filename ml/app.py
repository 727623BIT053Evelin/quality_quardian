from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import os
import sys

# Ensure current directory is in path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the new pipeline from the copied backend folder
from backend.pipeline.data_quality_pipeline import run_data_quality_pipeline

# Import the analyzer for reporting
from analyzer import DataAnalyzer

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_file():
    """
    Microservice Endpoint:
    Expects JSON: { "filepath": "/absolute/path/to/uploaded/file.csv" }
    Returns JSON: { "report": {...}, "cleaned_path": "/path/to/clean_file.csv" }
    """
    data = request.get_json()
    if not data or 'filepath' not in data:
        return jsonify({"error": "No filepath provided"}), 400
    
    filepath = data['filepath']
    
    if not os.path.exists(filepath):
        return jsonify({"error": "File not found at path"}), 404

    try:
        # 1. Load Data
        if filepath.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filepath.endswith('.xlsx'):
            df = pd.read_excel(filepath)
        else:
            return jsonify({"error": "Unsupported file format"}), 400



        # FILTERING: Drop rows that are completely empty
        initial_count = len(df)
        df.dropna(how='all', inplace=True)
        print(f"Dropped {initial_count - len(df)} empty rows.")

        # 2. Analyze (Generate Report on Raw Data)
        analyzer = DataAnalyzer(df)
        report = analyzer.analyze()
        print("Report generated:", report)

        # Generate Original Preview (first 10 rows)
        preview_original = df.head(10).replace({np.nan: None}).to_dict(orient='records')

        # CAPTURE DUPLICATES
        # Identify duplicates (keep='first' marks 2nd occurrence onwards as True)
        duplicates_mask = df.duplicated(keep='first')
        duplicates_df = df[duplicates_mask]
        preview_duplicates = duplicates_df.replace({np.nan: None}).to_dict(orient='records')

        # 3. Clean (Run Infynd Pipeline)
        cleaned_df = run_data_quality_pipeline(df)
        
        # Generate Cleaned Preview (first 10 rows)
        preview_cleaned = cleaned_df.head(10).replace({np.nan: None}).to_dict(orient='records')

        # 4. Save Cleaned File
        directory, filename = os.path.split(filepath)
        processed_filename = f"clean_{filename}"
        processed_path = os.path.join(directory, processed_filename)
        
        cleaned_df.to_csv(processed_path, index=False)

        # 5. Return Response
        return jsonify({
            "message": "Processing complete",
            "report": report,
            "cleaned_path": processed_path,
            "preview_original": preview_original,
            "preview_cleaned": preview_cleaned,
            "preview_duplicates": preview_duplicates
        })

    except Exception as e:
        print(f"Error processing file: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
