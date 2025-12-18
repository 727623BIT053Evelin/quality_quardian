import pandas as pd
import re

# ----------------------------------
# Clean job title
# ----------------------------------
def clean_job_title(x):
    """
    Standardize job title: lowercase, strip, remove non-alphabetic characters.
    """
    if pd.isna(x):
        return ""
    x = str(x).lower().strip()
    x = re.sub(r'[^a-z ]+', '', x)
    x = re.sub(r'\s+', ' ', x)  # remove extra spaces
    return x

# ----------------------------------
# ROLE PRIORITY MATTERS (TOP → BOTTOM)
# ----------------------------------
ROLE_RULES = [
    ("Data & Analytics", [
        "machine learning", "ml engineer", "ml", "ai", "artificial intelligence",
        "data scientist", "data analyst", "analytics", "business intelligence"
    ]),
    ("Finance", [
        "finance analyst", "financial analyst", "accountant",
        "accounts", "auditor", "finance", "controller"
    ]),
    ("Engineering & Development", [
        "software engineer", "developer", "programmer",
        "backend", "frontend", "full stack", "web developer",
        "engineer", "plasterer", "painting and decoration"
    ]),
    ("Sales", [
        "sales", "sales executive", "sales manager",
        "account executive", "account manager", "sales generalist", "sales managet"
    ]),
    ("Marketing", [
        "marketing", "digital marketing", "seo",
        "content", "growth marketer", "brand"
    ]),
    ("Human Resources", [
        "hr", "human resource", "recruiter", "talent acquisition"
    ]),
    ("Operations", [
        "operations", "logistics", "supply chain", "ops", "tile merchant",
        "courier delivery own van", "director of operations"
    ]),
    ("Leadership", [
        "ceo", "cto", "cfo", "coo", "founder",
        "director", "head", "manager", "owner", "general manager", "co owner",
        "managing director", "project manager", "assistance director", "managing partner"
    ]),
    ("Customer Support", [
        "support", "customer service", "customer success", "customer assistant"
    ]),
    ("Medical", ["nurse"]),
    ("Admin", ["admin", "administrator"]),
    ("Education", ["educator", "school", "ukcc ec b level 2 coach", "transformational coach"]),
    ("Production", ["audio visual specialist", "photographer"])
]

# ----------------------------------
# Exact title mapping for all jobtitles in your list
# ----------------------------------
EXACT_TITLE_MAPPING = {
    "managing director": "Leadership",
    "director": "Leadership",
    "warden": "Operations",
    "financial solutions": "Finance",
    "admin": "Admin",
    "administrator": "Admin",
    "nurse": "Medical",
    "engineer": "Engineering & Development",
    "accountant": "Finance",
    "account manager": "Sales",
    "project development manager": "Leadership",
    "project manager": "Leadership",
    "customer assistant": "Customer Support",
    "general manager": "Leadership",
    "sales generalist": "Sales",
    "audio visual specialist": "Production",
    "plasterer": "Engineering & Development",
    "courier delivery own van": "Operations",
    "owner": "Leadership",
    "co owner": "Leadership",
    "tester": "Engineering & Development",
    "transformational coach": "Education",
    "executive": "Leadership",
    "sales managet": "Sales",
    "ukcc ec b level 2 coach": "Education",
    "ba": "Education",
    "chelsea": "Education",
    "herbalife": "Sales",
    "xx": "Admin",
    "covent garden": "Operations",
    "sports awards": "Marketing",
    "painting and decoration": "Engineering & Development",
    "tile merchant": "Operations",
    "md": "Leadership",
    "dj": "Production",
    "tbol": "Education",
    "painter": "Engineering & Development",
    "landscaper": "Engineering & Development",
    "negotiator": "Sales",
    "solicitors": "Legal",
    "door manufacturer": "Production",
    "plasterer": "Engineering & Development",
    "path": "Education",
    "bilder": "Operations",
    "jhjil": "Operations",
    "analyst": "Data & Analytics",
    "architectural services": "Engineering & Development",
    "timber frame specialist": "Engineering & Development",
    "account executivea": "Sales",
    "customer assistant": "Customer Support",
    "band": "Production"
}

# ----------------------------------
# MAIN FUNCTION USED BY PIPELINE
# ----------------------------------
def map_role_function(df: pd.DataFrame) -> pd.DataFrame:
    """
    Maps 'jobtitle' to normalized 'role_description' column.
    - Uses exact mapping first, then keyword search with priority rules.
    - Ensures all jobtitles get a valid role.
    """
    df = df.copy()

    if 'jobtitle' not in df.columns:
        print("jobtitle column missing. Skipping role description mapping.")
        return df

    # Clean job titles
    df['jobtitle_clean'] = df['jobtitle'].apply(clean_job_title)

    # Map jobtitle → role_description
    def infer_role(title):
        if not title:
            return "Admin"  # fallback to a valid role

        # 1️⃣ Exact mapping
        if title in EXACT_TITLE_MAPPING:
            return EXACT_TITLE_MAPPING[title]

        # 2️⃣ Keyword mapping
        for role, keywords in ROLE_RULES:
            for kw in keywords:
                if kw in title:
                    return role

        # 3️⃣ Fallback
        return "Admin"  # any unmatched title goes to Admin instead of Unknown

    df['role_description'] = df['jobtitle_clean'].apply(infer_role)

    # Drop helper column
    df.drop(columns=['jobtitle_clean'], inplace=True)

    return df
