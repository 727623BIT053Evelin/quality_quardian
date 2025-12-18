import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression

# =========================
# Revenue column detection
# =========================
revenue_keywords = [
    "revenue",
    "annual_revenue",
    "income",
    "annual_income",
    "turnover",
    "sales"
]

def get_revenue_column(df: pd.DataFrame) -> str | None:
    """
    Detect revenue-like column using keyword matching
    """
    for col in df.columns:
        col_lower = col.lower()
        for kw in revenue_keywords:
            if kw in col_lower:
                return col
    return None


# =========================
# Revenue imputation logic
# =========================
def impute_annual_revenue(df: pd.DataFrame) -> pd.DataFrame:
    """
    Impute missing revenue using:
    1️⃣ Regression (company_size, industry, country)
    2️⃣ Group medians
    3️⃣ Global median

    Adds:
    - <revenue_col>_source
    - <revenue_col>_confidence
    """

    df = df.copy()
    target_col = get_revenue_column(df)

    if target_col is None:
        return df

    # Ensure numeric
    df[target_col] = pd.to_numeric(df[target_col], errors="coerce")

    feature_cols = ["company_size", "industry", "country"]
    available_features = [c for c in feature_cols if c in df.columns]

    source_col = f"{target_col}_source"
    conf_col = f"{target_col}_confidence"

    df[source_col] = "original"
    df[conf_col] = 1.0

    # =========================
    # 1️⃣ Model-based imputation
    # =========================
    if len(available_features) == len(feature_cols):
        mask_train = (
            df[target_col].notna()
            & df[feature_cols].notna().all(axis=1)
        )

        X_train = df.loc[mask_train, feature_cols]
        y_train = df.loc[mask_train, target_col]

        if len(X_train) >= 5:  # safety threshold
            preprocess = ColumnTransformer(
                transformers=[
                    ("cat", OneHotEncoder(handle_unknown="ignore"), feature_cols)
                ]
            )

            model = Pipeline(steps=[
                ("preprocess", preprocess),
                ("reg", LinearRegression())
            ])

            model.fit(X_train, y_train)

            mask_predict = (
                df[target_col].isna()
                & df[feature_cols].notna().all(axis=1)
            )

            if mask_predict.any():
                df.loc[mask_predict, target_col] = model.predict(
                    df.loc[mask_predict, feature_cols]
                )
                df.loc[mask_predict, conf_col] = 0.6
                df.loc[mask_predict, source_col] = "model_imputed"

    # =========================
    # 2️⃣ Group median imputation
    # =========================
    def fill_with_group_median(df, group_cols, target):
        valid_cols = [c for c in group_cols if c in df.columns]
        if not valid_cols:
            return df

        group_median = df.groupby(valid_cols)[target].transform("median")
        mask = df[target].isna() & group_median.notna()

        df.loc[mask, target] = group_median[mask]
        df.loc[mask, conf_col] = 0.5
        df.loc[mask, source_col] = "median_imputed"

        return df

    df = fill_with_group_median(df, ["industry", "company_size"], target_col)
    df = fill_with_group_median(df, ["industry"], target_col)
    df = fill_with_group_median(df, ["company_size"], target_col)

    # =========================
    # 3️⃣ Global median fallback
    # =========================
    global_median = df[target_col].median()
    mask_global = df[target_col].isna()

    if pd.notna(global_median):
        df.loc[mask_global, target_col] = global_median
        df.loc[mask_global, conf_col] = 0.4
        df.loc[mask_global, source_col] = "global_median"

    return df


# =========================
# Missing-value fillers
# =========================
def fill_contact_fields(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing email / phone fields
    """
    df = df.copy()

    for col in ["email", "phone", "phone_number", "company_email"]:
        if col in df.columns:
            df[col] = (
                df[col]
                .replace(["", "nan", "NaN", "-"], pd.NA)
                .fillna("Not Provided")
            )

    return df


def fill_company_name(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing company names
    """
    df = df.copy()

    if "company_name" in df.columns:
        df["company_name"] = (
            df["company_name"]
            .replace(["", "nan", "NaN"], pd.NA)
            .fillna("Unknown Company")
        )

    return df


def fill_website(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing website values
    """
    df = df.copy()

    if "website" in df.columns:
        df["website"] = (
            df["website"]
            .replace(["", "nan", "NaN"], pd.NA)
            .fillna("Not Available")
        )

    return df


def fill_head_office_country(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing head_office_country with 'Not Specified'
    """
    df = df.copy()

    if "head_office_country" in df.columns:
        df["head_office_country"] = (
            df["head_office_country"]
            .replace(["", "nan", "NaN", "-"], pd.NA)
            .fillna("Not Specified")
        )

    return df


def fill_company_age(df: pd.DataFrame, founded_col: str = 'founded_date', age_col: str = 'company_age') -> pd.DataFrame:
    """
    Fill missing company_age using founded_date.
    
    Logic:
    1. If company_age is missing but founded_date exists → Calculate age from founded_date
    2. If both are missing → Fill with 'Unknown'
    
    Args:
        df: Input DataFrame
        founded_col: Column name for founded date (default: 'founded_date')
        age_col: Column name for company age (default: 'company_age')
    
    Returns:
        DataFrame with filled company_age column
    """
    from datetime import datetime
    
    df = df.copy()
    current_year = datetime.now().year

    # Convert founded_date to datetime safely
    if founded_col in df.columns:
        df[founded_col] = pd.to_datetime(df[founded_col], errors='coerce')

    # Fill missing company_age using founded_date
    if age_col in df.columns and founded_col in df.columns:
        mask = df[age_col].isna() & df[founded_col].notna()
        df.loc[mask, age_col] = current_year - df.loc[mask, founded_col].dt.year

    # If both are missing → Unknown
    if age_col in df.columns:
        df[age_col] = df[age_col].fillna('Unknown')

    return df
