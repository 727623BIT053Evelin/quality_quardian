from flask import Flask, request, jsonify
import pandas as pd
import os
from ml_logic import DataCleaner

app = Flask(__name__)

# No CORS needed if only accessed by Node.js, but good for debugging
# from flask_cors import CORS
# CORS(app)

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
        # Load Data
        if filepath.endswith('.csv'):
            df = pd.read_csv(filepath)
        elif filepath.endswith('.xlsx'):
            df = pd.read_excel(filepath)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        # Run Cleaning Logic
        cleaner = DataCleaner(df)
        cleaned_df, report = cleaner.run_pipeline()

        # Save Cleaned File (same directory, prefixed)
        directory, filename = os.path.split(filepath)
        processed_filename = f"clean_{filename}"
        processed_path = os.path.join(directory, processed_filename)
        
        cleaned_df.to_csv(processed_path, index=False)

        return jsonify({
            "message": "Processing complete",
            "report": report,
            "cleaned_path": processed_path
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run on default port 5000
    app.run(debug=True, port=5000)
