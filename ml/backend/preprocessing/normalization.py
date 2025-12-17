import pandas as pd
import numpy as np

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
