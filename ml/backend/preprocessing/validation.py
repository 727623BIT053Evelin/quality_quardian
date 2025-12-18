import pandas as pd
import re

MISSING_COMPANY_VALUES = {
    "", " ", "-", "--", "na", "n/a", "null", "none",
    "undefined", "?", "nil"
}

def is_missing_company_name(value):
    """
    Returns True if company name is missing
    """
    if pd.isna(value):
        return True

    value = str(value).strip().lower()
    return value in MISSING_COMPANY_VALUES

JUNK_COMPANY_VALUES = {
    "test", "testing", "dummy", "sample", "xyz", "abc",
    "company", "business", "firm", "organization"
}

LEGAL_SUFFIXES = [
    "ltd", "limited", "pvt", "private", "llp", "inc",
    "corp", "corporation", "co", "gmbh", "plc"
]

def validate_company_name(value):
    """
    Returns:
    (is_valid: bool, issue: str)
    """

    # Safety check
    if is_missing_company_name(value):
        return False, "MISSING_COMPANY_NAME"

    name = str(value).strip()
    name_lower = name.lower()

    # Rule 1: Too short
    if len(name) < 3:
        return False, "COMPANY_NAME_TOO_SHORT"

    # Rule 2: Junk values
    if name_lower in JUNK_COMPANY_VALUES:
        return False, "JUNK_COMPANY_NAME"

    # Rule 3: No alphabetic characters
    if not re.search(r"[a-zA-Z]", name):
        return False, "NO_ALPHABET_IN_COMPANY_NAME"

    # Rule 4: Excessive special characters
    special_chars = re.findall(r"[^a-zA-Z0-9\s&.,-]", name)
    if len(name) > 0 and (len(special_chars) / len(name) > 0.3):
        return False, "TOO_MANY_SPECIAL_CHARACTERS"

    # Rule 5: Looks like person name (single word, no legal suffix)
    if len(name.split()) == 1:
        if not any(suffix in name_lower for suffix in LEGAL_SUFFIXES):
            return False, "POSSIBLE_PERSON_NAME"

    # Passed all checks
    return True, "VALID_COMPANY_NAME"

# Placeholder functions for other validations that might have been lost
def validate_email(value):
    if pd.isna(value) or str(value).strip().lower() in ["", "not provided"]:
        return False, "MISSING_EMAIL"
    if not re.match(r"[^@]+@[^@]+\.[^@]+", str(value)):
        return False, "INVALID_EMAIL_FORMAT"
    return True, "VALID_EMAIL"

def validate_phone(value):
    if pd.isna(value) or str(value).strip().lower() in ["", "not provided"]:
        return False, "MISSING_PHONE"
    clean_phone = re.sub(r"[^\d+]", "", str(value))
    if len(clean_phone) < 7:
        return False, "INVALID_PHONE_FORMAT"
    return True, "VALID_PHONE"

def validate_industry(value):
    if pd.isna(value) or str(value).strip().lower() in ["", "unknown industry"]:
        return False, "MISSING_INDUSTRY"
    return True, "VALID_INDUSTRY"

def validate_country(value):
    if pd.isna(value) or str(value).strip().lower() in ["", "not specified"]:
        return False, "MISSING_COUNTRY"
    return True, "VALID_COUNTRY"

def validate_company_age(value):
    if pd.isna(value) or str(value) == "Unknown":
        return False, "MISSING_AGE"
    return True, "VALID_AGE"

def validate_domain(value):
    if pd.isna(value) or str(value) == "Unknown Domain":
        return False, "MISSING_DOMAIN"
    return True, "VALID_DOMAIN"

MISSING_NAME_VALUES = {
    "", " ", "-", "--", "na", "n/a", "null",
    "none", "undefined", "?", "nil"
}

COMPANY_KEYWORDS = {
    "test", "testing", "dummy", "sample", "xyz", "abc",
    "company", "business", "firm", "organization",
    "ltd", "limited", "pvt", "private", "llp", "inc",
    "corp", "corporation", "co", "gmbh", "plc"
}

def is_missing_first_name(value):
    if pd.isna(value):
        return True

    value = str(value).strip().lower()
    return value in MISSING_NAME_VALUES

def validate_first_name(value):
    """
    Returns:
    (is_valid: bool, issue: str)
    """

    if is_missing_first_name(value):
        return False, "MISSING_FIRST_NAME"

    name = str(value).strip()
    name_lower = name.lower()

    # Length check
    if len(name) < 2 or len(name) > 30:
        return False, "INVALID_FIRST_NAME_LENGTH"

    # Digits not allowed
    if re.search(r"\d", name):
        return False, "INVALID_FIRST_NAME_HAS_DIGITS"

    # Junk characters
    if not re.fullmatch(r"[A-Za-z'-]+", name):
        return False, "INVALID_FIRST_NAME_JUNK_CHARACTERS"

    # Repeated characters
    if re.search(r"(.)\1{3,}", name_lower):
        return False, "INVALID_FIRST_NAME_REPEATED_CHARACTERS"

    # Company words in name
    if any(word in name_lower for word in COMPANY_KEYWORDS):
        return False, "INVALID_FIRST_NAME_CONTAINS_COMPANY_WORD"

    # Single-character noise
    if len(set(name_lower)) == 1:
        return False, "INVALID_FIRST_NAME_SINGLE_CHAR"

    return True, "VALID_FIRST_NAME"

MISSING_MIDDLE_VALUES = {
    "", " ", "-", "--", "na", "n/a", "null",
    "none", "undefined", "?", "nil"
}

def is_missing_middle_name(value):
    if pd.isna(value):
        return True

    value = str(value).strip().lower()
    return value in MISSING_MIDDLE_VALUES

def validate_middle_name(value):
    """
    Returns:
    (is_valid: bool, issue: str)
    """
    if is_missing_middle_name(value):
        return False, "MISSING_MIDDLE_NAME"
    
    return True, "VALID_MIDDLE_NAME"

MISSING_LAST_NAME_VALUES = {
    "", " ", "-", "--", "na", "n/a", "null",
    "none", "undefined", "?", "nil"
}

def is_missing_last_name(value):
    if pd.isna(value):
        return True

    value = str(value).strip().lower()
    return value in MISSING_LAST_NAME_VALUES

def validate_last_name(value):
    """
    Returns:
    (is_valid: bool, issue: str)
    """

    if is_missing_last_name(value):
        return False, "MISSING_LAST_NAME"

    name = str(value).strip()
    name_lower = name.lower()

    # Length check
    if len(name) < 2 or len(name) > 40:
        return False, "INVALID_LAST_NAME_LENGTH"

    # Digits not allowed
    if re.search(r"\d", name):
        return False, "INVALID_LAST_NAME_HAS_DIGITS"

    # Junk characters
    if not re.fullmatch(r"[A-Za-z'-]+", name):
        return False, "INVALID_LAST_NAME_JUNK_CHARACTERS"

    # Repeated characters
    if re.search(r"(.)\1{2,}", name_lower):
        return False, "INVALID_LAST_NAME_REPEATED_CHARACTERS"

    return True, "VALID_LAST_NAME"

MISSING_JOB_VALUES = {
    "", " ", "-", "--", "na", "n/a", "null",
    "none", "undefined", "?", "nil"
}

ROLE_KEYWORDS = {
    "manager", "engineer", "analyst", "director",
    "officer", "lead", "head", "executive",
    "specialist", "consultant", "developer",
    "architect", "admin", "president", "vp"
}

JUNK_JOB_TITLES = {"contact us", "n/a", "user", "title", "abstract"}
PERSONAL_WORDS = {"andy", "chelsea", "dayana"}
COMPANY_WORDS = {"herbalife", "tyres", "covent garden"}

def is_missing_job_title(value):
    if pd.isna(value):
        return True
    value_str = str(value).strip().lower()
    return value_str in MISSING_JOB_VALUES or value_str == ""

def validate_job_title(value):
    """
    Returns:
    (is_valid: bool, issue: str)
    """
    if is_missing_job_title(value):
        return False, "MISSING_JOB_TITLE"

    title = str(value).strip()
    title_lower = title.lower()

    if len(title) < 3:
        return False, "JOB_TITLE_TOO_SHORT"

    if re.search(r"\d", title):
        return False, "JOB_TITLE_HAS_DIGITS"

    if not re.fullmatch(r"[A-Za-z\s&/-]+", title):
        return False, "JOB_TITLE_JUNK_CHARACTERS"

    if title_lower in JUNK_JOB_TITLES:
        return False, "JOB_TITLE_JUNK_VALUE"

    if any(word in title_lower for word in PERSONAL_WORDS):
        return False, "JOB_TITLE_PERSONAL_NON_B2B"

    if any(word in title_lower for word in COMPANY_WORDS):
        return False, "JOB_TITLE_CONTAINS_COMPANY_WORD"

    if not any(role in title_lower for role in ROLE_KEYWORDS):
        return False, "JOB_TITLE_IRRELEVANT"

    return True, "VALID_JOB_TITLE"
