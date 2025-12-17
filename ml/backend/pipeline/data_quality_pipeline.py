# backend/pipeline/data_quality_pipeline.py

from ..preprocessing.missing_values import (
    impute_annual_revenue,
    get_revenue_column,
    fill_contact_fields,
    fill_company_name,
    fill_website
)
from ..preprocessing.normalization import normalize_revenue_column
from ..preprocessing.validation import (
    validate_company_name,
    validate_email,
    validate_phone,
    validate_industry,
    validate_country
)
from ..preprocessing.role_mapping import map_role_function
from ..preprocessing.text_processing import (
    apply_spelling_corrections,
    add_role_description_if_exists
)
from ..preprocessing.deduplication import flag_exact_duplicates

import pandas as pd
import phonenumbers
import tldextract
import pycountry

# ------------------------
# Helper functions (vectorized)
# ------------------------
def extract_domain_from_website_series(websites: pd.Series) -> pd.Series:
    if websites is None or websites.empty:
        return pd.Series([None] * len(websites))
    websites = websites.fillna('Not Available').str.lower().str.replace(r'https?://|www\.', '', regex=True)
    return websites.str.split('/').str[0].replace({'not available': None})

def get_country_from_phone_series(phones: pd.Series) -> pd.Series:
    countries = []
    for phone in phones:
        try:
            if pd.isna(phone) or phone in ['Not Provided', 'Unknown']:
                countries.append(None)
                continue
            parsed = phonenumbers.parse(str(phone), None)
            if phonenumbers.is_valid_number(parsed):
                region_code = phonenumbers.region_code_for_number(parsed)
                country = pycountry.countries.get(alpha_2=region_code)
                countries.append(country.name if country else None)
            else:
                countries.append(None)
        except:
            countries.append(None)
    return pd.Series(countries, index=phones.index)

def get_country_from_website_series(websites: pd.Series) -> pd.Series:
    countries = []
    for website in websites:
        if pd.isna(website) or website in ['Not Provided', 'Unknown']:
            countries.append(None)
            continue
        extracted = tldextract.extract(website)
        tld_parts = extracted.suffix.split('.')
        tld = tld_parts[-1] if tld_parts else ''
        if len(tld) == 2:
            country = pycountry.countries.get(alpha_2=tld.upper())
            countries.append(country.name if country else None)
        else:
            countries.append(None)
    return pd.Series(countries, index=websites.index)

def infer_country_vectorized(df: pd.DataFrame) -> pd.Series:
    # Priority: phone -> domain/website -> Unknown
    country_from_phone = get_country_from_phone_series(df.get('company_phone', pd.Series([None]*len(df))))

    website_field = None
    if 'domain' in df.columns:
        website_field = df['domain']
    elif 'website' in df.columns:
        website_field = df['website']
    else:
        website_field = pd.Series([None]*len(df))

    country_from_website = get_country_from_website_series(website_field)
    country_final = country_from_phone.combine_first(country_from_website).fillna('Unknown Country')
    return country_final

# ------------------------
# Main Pipeline
# ------------------------
def run_data_quality_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # 1️⃣ Revenue handling
    revenue_col = get_revenue_column(df)
    if revenue_col:
        df = normalize_revenue_column(df, revenue_col)
    df = impute_annual_revenue(df)

    # 2️⃣ Missing value handling
    df = fill_company_name(df)
    df = fill_contact_fields(df)
    df = fill_website(df)

    # 2.5️⃣ Additional missing-value filling
    if 'industry' in df.columns:
        df['industry'] = df['industry'].fillna('Unknown Industry')

    # Domain filling safely
    if 'domain' not in df.columns:
        df['domain'] = extract_domain_from_website_series(df.get('website', pd.Series([None]*len(df))))
    else:
        missing_mask = df['domain'].isna()
        if 'website' in df.columns:
            df.loc[missing_mask, 'domain'] = extract_domain_from_website_series(df.loc[missing_mask, 'website'])
        df['domain'] = df['domain'].fillna('Unknown Domain')

    # Other fields filling defaults
    for col, default in [('job_title', 'Unknown'),
                         ('title', 'Not Provided'),
                         ('person_name', 'Unknown Person'),
                         ('company_size', 'Unknown')]:
        if col in df.columns:
            df[col] = df[col].fillna(default)

    # 3️⃣ Country inference
    if 'country' in df.columns:
        df['country'] = df['country'].fillna(infer_country_vectorized(df))

    # 4️⃣ Text cleaning & spelling
    df = apply_spelling_corrections(df)

    # 5️⃣ Validation
    df = validate_company_name(df)
    df = validate_email(df)
    df = validate_phone(df)
    df = validate_industry(df)
    df = validate_country(df)

    # 6️⃣ Role function mapping
    df = map_role_function(df)

    # 7️⃣ Role description normalization
    df = add_role_description_if_exists(df)

    # 8️⃣ Deduplication & quality scoring
    df = flag_exact_duplicates(df)

    # 9️⃣ Ensure Streamlit/PyArrow compatibility
    object_cols = ['company_size', 'job_title', 'title', 'person_name', 'industry', 'country', 'domain']
    for col in object_cols:
        if col in df.columns:
            df[col] = df[col].astype(str)

    return df
