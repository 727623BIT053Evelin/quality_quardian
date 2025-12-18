import pandas as pd
import numpy as np
import re

# -----------------------------
# Revenue normalization
# -----------------------------
def normalize_revenue_column(df: pd.DataFrame, column_name: str) -> pd.DataFrame:
    """
    Normalize revenue-like values into numeric form.
    Handles:
    - commas (2,100,000)
    - k / m suffixes (980k, 1.2M)
    - invalid negatives → NaN
    """
    def parse_value(val):
        if pd.isna(val):
            return np.nan

        if isinstance(val, (int, float)):
            return val if val >= 0 else np.nan

        val = str(val).lower().strip().replace(",", "")

        try:
            if val.endswith("k"):
                return float(val[:-1]) * 1_000
            if val.endswith("m"):
                return float(val[:-1]) * 1_000_000

            num = float(val)
            return num if num >= 0 else np.nan
        except:
            return np.nan

    df[column_name] = df[column_name].apply(parse_value)
    return df


# -----------------------------
# Address normalization + combination
# -----------------------------
ADDRESS_MAPPING = {
    r'\brd\b': 'Road',
    r'\bst\b': 'Street',
    r'\bave\b': 'Avenue',
    r'\bdr\b': 'Drive',
    r'\bln\b': 'Lane',
    r'\bblvd\b': 'Boulevard',
    r'\bpkwy\b': 'Parkway',
    r'\bcir\b': 'Circle',
    r'\bsq\b': 'Square',
    r'\bct\b': 'Court',
    r'\bpl\b': 'Place',
    r'\btrl\b': 'Trail',
    r'\bway\b': 'Way'
}

def normalize_address(df: pd.DataFrame, address_columns: list) -> pd.DataFrame:
    """
    Normalize addresses and create full_address.
    """
    def normalize_text(text):
        if pd.isna(text):
            return ""
        text = str(text).lower().strip()
        for abbr, full in ADDRESS_MAPPING.items():
            text = re.sub(abbr, full, text)
        return text.title()

    for col in address_columns:
        if col in df.columns:
            df[col] = df[col].apply(normalize_text)

    df['full_address'] = df[address_columns].fillna("").agg(", ".join, axis=1)
    df['full_address'] = df['full_address'].str.strip(", ").replace({"": None})

    return df


# -----------------------------
# Founded Date normalization
# -----------------------------
def normalize_founded_date(df: pd.DataFrame, column_name='founded_date') -> pd.DataFrame:
    """
    Normalize all kinds of date formats to YYYY-MM-DD.
    Does NOT delete invalid values like '-', 'NA', 'Unknown'.
    """
    if column_name not in df.columns:
        return df

    INVALID_PLACEHOLDERS = {"-", "NA", "N/A", "Unknown", "Not Provided", ""}

    def normalize_date(val):
        if pd.isna(val):
            return None

        val_str = str(val).strip()

        if val_str in INVALID_PLACEHOLDERS:
            return val_str  # preserve as-is

        try:
            dt = pd.to_datetime(val_str, errors='coerce', dayfirst=True)
            if pd.isna(dt):
                return val_str
            return dt.strftime("%Y-%m-%d")
        except:
            return val_str

    df[column_name] = df[column_name].apply(normalize_date)
    return df


# -----------------------------
# Location Type normalization
# -----------------------------
def normalize_location_type(df: pd.DataFrame, column_name='location_type') -> pd.DataFrame:
    """
    Standardize location_type into:
    - Single Site
    - Head Office
    - Branch
    """
    if column_name not in df.columns:
        return df

    def normalize_value(val):
        if pd.isna(val):
            return None

        val = str(val).strip().lower()

        if any(k in val for k in ['head', 'hq', 'headquarter', 'corporate', 'main office']):
            return 'Head Office'

        if any(k in val for k in ['branch', 'regional', 'satellite', 'sub office']):
            return 'Branch'

        if any(k in val for k in ['single', 'sole', 'one location', 'only']):
            return 'Single Site'

        return None

    df[column_name] = df[column_name].apply(normalize_value)
    df[column_name] = df[column_name].fillna('Single Site')

    return df
