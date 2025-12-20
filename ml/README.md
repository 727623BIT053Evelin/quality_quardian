# ML Logic & Preprocessing 🧠

The ML Microservice is the engine responsible for the core IQ (Intelligence Quotient) of Quality Guardian. Built with Python and Pandas, it performs deep data cleaning, normalization, and quality scoring.

## 🚀 Microservice API
- **Endpoint**: `POST /process`
- **Port**: 5000
- **Logic**: Accepts a local file path, executes the cleaning pipeline, generates a JSON report, and saves a cleaned CSV.

## 🛠️ Tech Stack
- **Framework**: Flask
- **Data Handling**: Pandas, NumPy
- **NLP/Text**: RegEx, Tldextract (Domain surgery)
- **Reference Data**: Pycountry (Country ISO maps)

## 🧩 Core Components

### 1. Data Analyzer (`analyzer.py`)
Provides a non-destructive audit of the raw data.
- **`analyze()`**: Scans for nulls, duplicates, and pattern mismatches.
- **Quality Score**: Calculates a "Health Score" (0-100) based on weighted error rates.

### 2. The Data Quality Pipeline (`backend/pipeline/`)
The primary execution sequence for cleaning.
- **Revenue Imputation**: Uses regression-based filling for missing annual revenue based on company size and industry.
- **Company Age Logic**: Calculates missing age from `founded_date` dynamically.
- **Domain Extraction**: Infers domains from email and website strings using `tldextract`.

### 3. Validation Logic (`backend/preprocessing/validation.py`)
Advanced rule-based validation for high-value B2B fields:
- **`validate_company_name`**: Filters junk titles ("Dummy", "Test") and uses person-name detection (single-word detection vs legal suffixes like "Ltd").
- **`validate_first_name` / `validate_last_name`**: Filters digits, junk characters, and non-B2B keywords.
- **`validate_job_title`**: Filters for role relevance (Checks for "Manager", "Engineer", etc.) and removes personal noise.
- **Status Metadata**: Every validated field generates a companion `<col>_status` (VALID/INVALID) and `<col>_issue` (reason code).

### 3. Sentinel AI Assistant (`streamlit_chatbot.py`) ✨
A conversational data consultant that allows users to "talk" to their dataset. Run using: `streamlit run streamlit_chatbot.py`
- **Audit Reports**: Instantly answers questions about missing values, duplicates, and health scores.
- **Feature Analysis**: Describes column structures and record counts.
- **Remediation**: Suggests specific pipeline steps to fix detected errors.

## 📊 Processing Workflow
1. **Load**: Read CSV/XLSX into Pandas.
2. **Cleanse**: Drop empty rows.
3. **Analyze**: Capture initial state report.
4. **Transform**:
    - Normalize text (Title Case, Lower).
    - Normalize addresses (Standardize suffixes like "St" to "Street").
    - Standardize dates to ISO format.
5. **Validate**: Apply rules and attach issue codes.
6. **Export**: Save as processed CSV (forces `.csv` extension).
