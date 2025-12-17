# backend/preprocessing/text_processing.py
import pandas as pd
import re
from spellchecker import SpellChecker

spell = SpellChecker()

# Spelling correction
def is_acronym(word):
    return word.isupper() and len(word) <= 5

def correct_text_spelling(value):
    if pd.isnull(value):
        return value
    value = str(value).strip()
    if value.lower() in ['na', 'n/a', 'unknown', 'not provided']:
        return value
    words = re.findall(r"[A-Za-z]+|[^A-Za-z\s]", value)
    corrected_words = []
    for word in words:
        if not word.isalpha() or is_acronym(word):
            corrected_words.append(word)
        else:
            corrected_words.append(spell.correction(word))
    return "".join(
        [" " + w if w.isalpha() and i > 0 else w for i, w in enumerate(corrected_words)]
    ).strip()

def apply_spelling_corrections(df):
    columns = ['country', 'industry', 'title', 'role_function']
    for col in columns:
        if col in df.columns:
            df[col] = df[col].apply(correct_text_spelling)
    return df

# Role normalization
ROLE_KEYWORDS = {
    "IT": ["software","engineer","developer","programmer","data","backend","frontend","full stack","devops","sde","it"],
    "Sales": ["sales","account","business development","bdr","sdr"],
    "Marketing": ["marketing","seo","content","growth","digital"],
    "HR": ["hr","human resources","recruiter","talent"],
    "Finance": ["finance","accountant","accounting","auditor"],
    "Operations": ["operations","ops","logistics","supply"],
    "Product": ["product manager","product owner"],
    "Management": ["manager","director","head","vp","chief","lead"]
}

def normalize_role_from_title(title):
    if pd.isnull(title):
        return "Unknown"
    title_clean = re.sub(r"[^a-z0-9\s]", " ", str(title).lower())
    for role, keywords in ROLE_KEYWORDS.items():
        for kw in keywords:
            if kw in title_clean:
                return role
    return "Unknown"

def add_role_description_if_exists(df):
    if 'role_function' in df.columns:
        df['role_description'] = df['role_function'].apply(normalize_role_from_title)
    return df
