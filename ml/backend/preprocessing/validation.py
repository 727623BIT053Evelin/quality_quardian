import pandas as pd
import re
import pycountry
from datetime import datetime

# ===============================
# Helper: Individual column validators
# ===============================

def is_invalid_company_name(name):
    if pd.isnull(name):
        return False
    name = str(name).strip().lower()
    return len(name) < 2 or name.isdigit() or name in ['na', 'n/a', 'unknown', 'test']

def is_invalid_website(website):
    if pd.isnull(website):
        return False
    website = str(website).strip().lower()
    if website in ['na', 'n/a', 'unknown', 'not available']:
        return True
    if ' ' in website or '.' not in website:
        return True
    if website[0].isdigit() and not website.startswith(('http://', 'https://', 'www.')):
        return True
    return False

def is_invalid_domain(domain):
    if pd.isnull(domain):
        return False
    domain = str(domain).lower().strip()
    # Support multi-part TLDs like .co.uk
    domain_regex = r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$"
    return not re.fullmatch(domain_regex, domain)

def is_invalid_country(country):
    if pd.isnull(country):
        return False
    country = str(country).strip()
    if country.lower() in ['na', 'n/a', 'unknown', 'not available']:
        return True
    aliases = {
        'usa': 'United States',
        'u.s.a': 'United States',
        'us': 'United States',
        'uk': 'United Kingdom',
        'uae': 'United Arab Emirates'
    }
    normalized = aliases.get(country.lower(), country)
    try:
        pycountry.countries.search_fuzzy(normalized)
        return False
    except LookupError:
        return True

def is_invalid_industry(industry):
    # Treat all industries as valid
    return False

def is_invalid_company_size(size):
    if pd.isnull(size):
        return False
    size_str = str(size).strip().lower()
    if size_str in ['na', 'n/a', 'unknown', 'not available']:
        return True
    try:
        return float(size_str) <= 0
    except (ValueError, TypeError):
        return True

def is_invalid_person_name(name):
    if pd.isnull(name):
        return False
    name = str(name).strip().lower()
    return name.isdigit() or len(name) < 2 or name in ['na', 'unknown', 'test']

def is_invalid_email(email):
    if pd.isnull(email):
        return False
    email = email.strip()
    return ' ' in email or '@' not in email or '.' not in email.split('@')[-1]

def is_invalid_title(title):
    if pd.isnull(title):
        return False
    title = title.strip().lower()
    return title in ['na', 'unknown', 'test']

def is_invalid_role_function(role):
    if pd.isnull(role):
        return False
    role = role.strip().lower()
    return role in ['na', 'unknown', 'not provided']

# ===============================
# VALIDATION FUNCTIONS USED IN PIPELINE
# ===============================

# -------------------------------
# Company Name
# -------------------------------
def validate_company_name(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "company_name" not in df.columns:
        return df

    def normalize_company(name):
        if pd.isna(name) or str(name).strip() == "":
            return name
        name = str(name).strip().lower()
        name = name.replace("private limited", "pvt ltd")
        name = name.replace("private ltd", "pvt ltd")
        name = name.replace("pvt.", "pvt")
        return name.title()

    def check_company(name):
        if pd.isna(name) or str(name).strip() == "":
            return None, "Missing"
        if len(str(name)) < 4:
            return False, "Too short"
        if str(name).lower() in ["pvt", "pvt ltd", "private limited"]:
            return False, "Incomplete company name"
        if re.fullmatch(r"[0-9\s]+", str(name)):
            return False, "Only numbers"
        return True, None

    df["company_name"] = df["company_name"].apply(normalize_company)
    result = df["company_name"].apply(check_company)
    df["company_name_is_valid"] = result.apply(lambda x: x[0])
    df["company_name_issue"] = result.apply(lambda x: x[1])
    return df

# -------------------------------
# Email Validation
# -------------------------------
def validate_email(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    email_cols = [c for c in df.columns if "email" in c.lower()]
    if not email_cols:
        return df

    email_regex = r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"

    for col in email_cols:
        def check_email(value):
            if pd.isna(value) or str(value).strip() == "":
                return None, "Missing"
            if re.fullmatch(email_regex, str(value).strip()):
                return True, None
            return False, "Invalid format"

        result = df[col].apply(check_email)
        df[f"{col}_is_valid"] = result.apply(lambda x: x[0])
        df[f"{col}_issue"] = result.apply(lambda x: x[1])

    return df

# -------------------------------
# Phone Validation
# -------------------------------
def validate_phone(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    phone_cols = [c for c in df.columns if "phone" in c.lower()]
    if not phone_cols:
        return df

    def extract_phone_digits(value):
        if pd.isna(value):
            return None
        digits = re.sub(r"\D", "", str(value).split(".")[0])
        return digits if digits else None

    for col in phone_cols:
        digits = df[col].apply(extract_phone_digits)

        def check_phone(x):
            if x is None:
                return None, "Missing"
            if len(x) == 10:
                return True, None
            return False, "Invalid length"

        result = digits.apply(check_phone)
        df[f"{col}_digits"] = digits
        df[f"{col}_is_valid"] = result.apply(lambda x: x[0])
        df[f"{col}_issue"] = result.apply(lambda x: x[1])

    return df

# -------------------------------
# Industry Validation
# -------------------------------
def validate_industry(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "industry" not in df.columns:
        return df

    df["industry_is_valid"] = True
    df["industry_issue"] = None
    return df

# -------------------------------
# Country Validation (ISO-based)
# -------------------------------
def validate_country(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if "country" not in df.columns:
        return df

    result = df["country"].apply(
        lambda x: (None, "Missing") if pd.isna(x) or str(x).strip() == ""
        else (False, "Invalid country") if is_invalid_country(x)
        else (True, None)
    )

    df["country_is_valid"] = result.apply(lambda x: x[0])
    df["country_issue"] = result.apply(lambda x: x[1])
    return df

# -------------------------------
# Company Age & Founded Date Validation
# -------------------------------
def validate_company_age(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    if 'founded_date' not in df.columns or 'company_age' not in df.columns:
        return df

    today = pd.to_datetime("today").normalize()

    def check_age(row):
        founded = row.get('founded_date')
        age = row.get('company_age')

        # Convert founded_date to datetime
        try:
            founded_dt = pd.to_datetime(founded, errors='coerce')
            if pd.isna(founded_dt):
                return pd.Series([False, "Invalid founded date", False, None])
        except:
            return pd.Series([False, "Invalid founded date", False, None])

        # Calculate actual age
        actual_age = today.year - founded_dt.year - ((today.month, today.day) < (founded_dt.month, founded_dt.day))

        # Compare with existing company_age
        try:
            age_val = int(float(age)) # Handle floats
            if age_val != actual_age:
                return pd.Series([True, None, False, "Age mismatch"])
        except:
            return pd.Series([False, None, False, "Invalid age value"])

        return pd.Series([True, None, True, None])

    df[['founded_date_is_valid', 'founded_date_issue', 'company_age_is_valid', 'company_age_issue']] = df.apply(check_age, axis=1)
    return df

# -------------------------------
# Domain Validation (Multi-TLD support)
# -------------------------------
def validate_domain(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    domain_cols = [c for c in df.columns if "domain" in c.lower() or "website" in c.lower()]
    if not domain_cols:
        return df

    domain_regex = r"^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$"

    for col in domain_cols:
        def check_domain(value):
            if pd.isna(value) or str(value).strip() == "":
                return None, "Missing"
            val_str = str(value).lower().strip().replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
            if re.fullmatch(domain_regex, val_str):
                return True, None
            return False, "Invalid format"

        result = df[col].apply(check_domain)
        df[f"{col}_is_valid"] = result.apply(lambda x: x[0])
        df[f"{col}_issue"] = result.apply(lambda x: x[1])

    return df
