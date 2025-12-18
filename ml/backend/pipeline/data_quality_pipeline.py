# backend/pipeline/data_quality_pipeline.py

from ..preprocessing.missing_values import (
    impute_annual_revenue,
    get_revenue_column,
    fill_contact_fields,
    fill_company_name,
    fill_website,
    fill_head_office_country
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
    validate_domain
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
# Helper functions
# ------------------------
def extract_domain_from_website_series(websites: pd.Series) -> pd.Series:
    if websites is None or websites.empty:
        return pd.Series([None] * len(websites))

    websites = (
        websites.fillna('Not Available')
        .astype(str)
        .str.lower()
        .str.replace(r'https?://|www\.', '', regex=True)
    )

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
        except Exception:
            countries.append(None)

    return pd.Series(countries, index=phones.index)


def get_country_from_website_series(websites: pd.Series) -> pd.Series:
    countries = []

    for website in websites:
        if pd.isna(website) or website in ['Not Provided', 'Unknown']:
            countries.append(None)
            continue

        extracted = tldextract.extract(str(website))
        tld = extracted.suffix.split('.')[-1] if extracted.suffix else ''

        if len(tld) == 2:
            country = pycountry.countries.get(alpha_2=tld.upper())
            countries.append(country.name if country else None)
        else:
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

    # 2️⃣ Missing values
    df = fill_company_name(df)
    df = fill_contact_fields(df)
    df = fill_website(df)

    if 'industry' in df.columns:
        df['industry'] = df['industry'].fillna('Unknown Industry')

    # ✅ Head office country
    if 'head_office_country' in df.columns:
        df['head_office_country'] = (
            df['head_office_country']
            .replace(['', '-', 'nan', 'NaN'], pd.NA)
            .fillna('Not Specified')
        )
    else:
        # Maintain existing fill_head_office_country logic if column doesn't exist yet but might be added
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

    # 6️⃣ Founded date normalization (LOSSLESS)
    if 'founded_date' in df.columns:
        df = normalize_founded_date(df, 'founded_date')
        df['founded_date'] = (
            df['founded_date']
            .replace(['', '-', 'nan', 'NaN'], pd.NA)
            .fillna('Not Provided')
        )

    # 6.1️⃣ Company age missing handling
    if 'company_age' in df.columns:
        df['company_age'] = (
            df['company_age']
            .replace(['', '-', 'nan', 'NaN'], pd.NA)
            .fillna('Not Provided')
        )

    # 7️⃣ Location type normalization
    if 'location_type' in df.columns:
        df = normalize_location_type(df, 'location_type')

    # 8️⃣ Country inference
    if 'country' in df.columns:
        df['country'] = df['country'].fillna(infer_country_vectorized(df))

    # 9️⃣ Text cleanup
    df = apply_spelling_corrections(df)

    # 🔟 Validation
    # PRESERVE: industry validation is kept
    df = validate_company_name(df)
    df = validate_email(df)
    df = validate_phone(df)
    df = validate_industry(df)
    df = validate_country(df)
    df = validate_domain(df)

    if 'founded_date' in df.columns and 'company_age' in df.columns:
        df = validate_company_age(df)

    # 1️⃣1️⃣ Role mapping: jobtitle → role_description (updated to jobtitle)
    if 'jobtitle' in df.columns:
        df = map_role_function(df)  # uses your role_mapping.py rules

    # 1️⃣2️⃣ Role description enhancements
    df = add_role_description_if_exists(df)

    # 1️⃣3️⃣ Deduplication
    df = flag_exact_duplicates(df)

    # 1️⃣4️⃣ Streamlit compatibility: all object columns as string
    object_cols = [
        'company_size', 'jobtitle', 'title', 'person_name',
        'industry', 'country', 'domain',
        'address_1', 'address_2', 'address_3',
        'full_address', 'location_type', 'head_office_country',
        'founded_date', 'company_age', 'role_description'
    ]

    for col in object_cols:
        if col in df.columns:
            # First ensure it's not all NA to avoid casting issues
            df[col] = df[col].astype(str).replace('nan', 'Not Provided').replace('None', 'Not Provided')

    return df
