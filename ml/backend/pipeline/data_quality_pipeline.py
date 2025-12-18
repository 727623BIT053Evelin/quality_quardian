# backend/pipeline/data_quality_pipeline.py

import pandas as pd
import numpy as np
import tldextract
import pycountry
import re

from ..preprocessing.missing_values import (
    impute_annual_revenue,
    get_revenue_column,
    fill_contact_fields,
    fill_company_name,
    fill_website,
    fill_head_office_country,
    fill_company_age
)

from ..preprocessing.normalization import (
    normalize_revenue_column,
    normalize_address,
    normalize_founded_date,
    normalize_location_type
)
from ..preprocessing.validation import (
    validate_company_name,
    validate_email,
    validate_phone,
    validate_industry,
    validate_country,
    validate_company_age,
    validate_domain,
    validate_first_name,
    validate_middle_name,
    validate_last_name,
    validate_job_title
)

from ..preprocessing.role_mapping import map_role_function
from ..preprocessing.text_processing import (
    apply_spelling_corrections,
)

def extract_domain_from_website_series(websites: pd.Series) -> pd.Series:
    domains = []
    for ws in websites:
        if pd.isna(ws) or str(ws).strip().lower() in ['', 'not provided', 'unknown']:
            domains.append(None)
            continue
        try:
            ext = tldextract.extract(str(ws))
            domain = f"{ext.domain}.{ext.suffix}" if ext.suffix else ext.domain
            domains.append(domain)
        except:
            domains.append(None)
    return pd.Series(domains, index=websites.index)

def get_country_from_phone_series(phones: pd.Series) -> pd.Series:
    # Basic logic for country inference from phone (can be expanded)
    return pd.Series([None] * len(phones), index=phones.index)

def get_country_from_website_series(websites: pd.Series) -> pd.Series:
    countries = []
    for website in websites:
        if pd.isna(website) or str(website).strip().lower() in ['', 'not provided', 'unknown']:
            countries.append(None)
            continue
        try:
            extracted = tldextract.extract(str(website))
            tld = extracted.suffix.split('.')[-1] if extracted.suffix else ''
            if len(tld) == 2:
                country = pycountry.countries.get(alpha_2=tld.upper())
                countries.append(country.name if country else None)
            else:
                countries.append(None)
        except:
            countries.append(None)
    return pd.Series(countries, index=websites.index)

def infer_country_vectorized(df: pd.DataFrame) -> pd.Series:
    country_from_phone = get_country_from_phone_series(
        df.get('company_phone', pd.Series([None] * len(df)))
    )
    website_field = (
        df['domain'] if 'domain' in df.columns
        else df.get('website', pd.Series([None] * len(df)))
    )
    country_from_website = get_country_from_website_series(website_field)
    return (
        country_from_phone
        .combine_first(country_from_website)
        .fillna('Unknown Country')
    )

def run_data_quality_pipeline(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # 1️⃣ Revenue handling
    revenue_col = get_revenue_column(df)
    if revenue_col:
        df = normalize_revenue_column(df, revenue_col)
    df = impute_annual_revenue(df)

    # 2️⃣ Missing values
    df = fill_company_name(df)
    df = fill_contact_fields(df)
    df = fill_website(df)
    df = fill_company_age(df)

    if 'industry' in df.columns:
        df['industry'] = df['industry'].fillna('Unknown Industry')

    if 'head_office_country' in df.columns:
        df['head_office_country'] = (
            df['head_office_country']
            .replace(['', '-', 'nan', 'NaN'], pd.NA)
            .fillna('Not Specified')
        )
    else:
        df = fill_head_office_country(df)

    # 3️⃣ Domain handling
    if 'domain' not in df.columns:
        df['domain'] = extract_domain_from_website_series(
            df.get('website', pd.Series([None] * len(df)))
        )
    else:
        mask = df['domain'].isna()
        if 'website' in df.columns:
            df.loc[mask, 'domain'] = extract_domain_from_website_series(
                df.loc[mask, 'website']
            )
        df['domain'] = df['domain'].fillna('Unknown Domain')

    # 4️⃣ Defaults
    for col, default in [
        ('jobtitle', 'Unknown'),
        ('title', 'Not Provided'),
        ('person_name', 'Unknown Person'),
        ('company_size', 'Unknown')
    ]:
        if col in df.columns:
            df[col] = df[col].fillna(default)

    # 5️⃣ Address normalization
    address_cols = [c for c in ['address_1', 'address_2', 'address_3'] if c in df.columns]
    if address_cols:
        df = normalize_address(df, address_cols)

    # 6️⃣ Founded date normalization
    if 'founded_date' in df.columns:
        df = normalize_founded_date(df)

    # 7️⃣ Validation and Status Columns
    validation_map = [
        ('company_name', validate_company_name),
        ('email', validate_email),
        ('company_phone', validate_phone),
        ('industry', validate_industry),
        ('head_office_country', validate_country),
        ('company_age', validate_company_age),
        ('domain', validate_domain),
        ('first_name', validate_first_name),
        ('middle_name', validate_middle_name),
        ('last_name', validate_last_name),
        ('jobtitle', validate_job_title)
    ]

    for col, val_func in validation_map:
        if col in df.columns:
            status_col = f"{col}_status"
            issue_col = f"{col}_issue"
            
            # Apply validation and store results
            # Result is a tuple (is_valid, issue_string)
            results = df[col].apply(lambda x: val_func(x))
            df[status_col] = results.apply(lambda x: "VALID" if x[0] else "INVALID")
            df[issue_col] = results.apply(lambda x: x[1])

    return df
