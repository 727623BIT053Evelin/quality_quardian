import pandas as pd

def flag_exact_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    """
    Flags exact duplicates where all columns are identical.
    Returns the original DataFrame with an additional column 'is_duplicate'.
    """
    df_clean = df.copy()

    # Flag exact duplicates across all columns
    df_clean['is_duplicate'] = df_clean.duplicated(keep='first')

    return df_clean
