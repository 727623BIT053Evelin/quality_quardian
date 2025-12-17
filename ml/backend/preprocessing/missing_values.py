import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression

# =========================
# Revenue column detection (hardcoded keywords)
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
    Detect revenue-like column using keyword matching.
    Returns column name or None if not found.
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
    Impute missing revenue column using:
    1. Regression (company_size, industry, country)
    2. Group medians
    3. Global median

    Adds:
    - <revenue_col>_source
    - <revenue_col>_confidence
    """

    df = df.copy()

    # -------------------------
    # Detect revenue column
    # -------------------------
    target_col = get_revenue_column(df)
    if target_col is None:
        # No revenue-like column → safely return
        return df

    # -------------------------
    # Required feature columns
    # -------------------------
    feature_cols = ["company_size", "industry", "country"]

    # If any feature column is missing, skip model part
    available_features = [c for c in feature_cols if c in df.columns]

    # -------------------------
    # Metadata columns
    # -------------------------
    source_col = f"{target_col}_source"
    conf_col = f"{target_col}_confidence"

    df[source_col] = "original"
    df[conf_col] = 1.0

    # =========================
    # 1. Model-based imputation
    # =========================
    model = None

    if len(available_features) == len(feature_cols):
        mask_known_target = df[target_col].notna()
        mask_all_features = df[feature_cols].notna().all(axis=1)
        mask_train = mask_known_target & mask_all_features

        X_train = df.loc[mask_train, feature_cols]
        y_train = df.loc[mask_train, target_col]

        if len(X_train) > 0:
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

        mask_missing_target = df[target_col].isna()
        mask_predict = mask_missing_target & mask_all_features

        if model is not None and mask_predict.any():
            X_pred = df.loc[mask_predict, feature_cols]
            df.loc[mask_predict, target_col] = model.predict(X_pred)
            df.loc[mask_predict, conf_col] = 0.6
            df.loc[mask_predict, source_col] = "model_imputed"

    # =========================
    # 2. Group median imputation
    # =========================
    def fill_with_group_median(df, group_cols, target):
        valid_cols = [c for c in group_cols if c in df.columns]
        if not valid_cols:
            return df

        group_median = df.groupby(valid_cols)[target].transform("median")
        mask_na = df[target].isna() & group_median.notna()
        df.loc[mask_na, target] = group_median[mask_na]
        return df

    df = fill_with_group_median(df, ["industry", "company_size"], target_col)
    df = fill_with_group_median(df, ["industry"], target_col)
    df = fill_with_group_median(df, ["company_size"], target_col)

    mask_median = (df[source_col] == "original") & df[target_col].notna()
    df.loc[mask_median, conf_col] = 0.5
    df.loc[mask_median, source_col] = "median_imputed"

    # =========================
    # 3. Global median fallback
    # =========================
    global_median = df[target_col].median()
    mask_global = df[target_col].isna()

    if pd.notna(global_median):
        df.loc[mask_global, target_col] = global_median
        df.loc[mask_global, conf_col] = 0.4
        df.loc[mask_global, source_col] = "global_median"

    return df


def fill_contact_fields(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing email and phone fields with 'Not Provided'
    """
    df = df.copy()

    if "email" in df.columns:
        df["email"] = df["email"].fillna("Not Provided")

    if "phone" in df.columns:
        df["phone"] = df["phone"].fillna("Not Provided")

    if "phone_number" in df.columns:
        df["phone_number"] = df["phone_number"].fillna("Not Provided")

    return df


def fill_company_name(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing company names
    """
    df = df.copy()

    if "company_name" in df.columns:
        df["company_name"] = df["company_name"].fillna("Unknown Company")

    return df


def fill_website(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fill missing website values
    """
    df = df.copy()

    if "website" in df.columns:
        df["website"] = df["website"].fillna("Not Available")

    return df
