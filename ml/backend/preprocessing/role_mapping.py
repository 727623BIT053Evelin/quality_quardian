import pandas as pd
import re

# ----------------------------------
# Clean job title
# ----------------------------------
def clean_job_title(x):
    if pd.isna(x):
        return ""
    x = str(x).lower().strip()
    x = re.sub(r'[^a-z ]+', '', x)
    return x

# ----------------------------------
# ROLE PRIORITY MATTERS (TOP → BOTTOM)
# ----------------------------------
ROLE_RULES = [
    # 1️⃣ Data & Analytics (ML, AI FIRST)
    ("Data & Analytics", [
        "machine learning", "ml engineer", "ml", "ai", "artificial intelligence",
        "data scientist", "data analyst", "analytics", "business intelligence"
    ]),

    # 2️⃣ Finance
    ("Finance", [
        "finance analyst", "financial analyst", "accountant",
        "accounts", "auditor", "finance", "controller"
    ]),

    # 3️⃣ Engineering / Development (NON-ML)
    ("Engineering & Development", [
        "software engineer", "developer", "programmer",
        "backend", "frontend", "full stack", "web developer"
    ]),

    # 4️⃣ Sales (SEPARATE)
    ("Sales", [
        "sales", "sales executive", "sales manager",
        "account executive", "account manager"
    ]),

    # 5️⃣ Marketing (SEPARATE)
    ("Marketing", [
        "marketing", "digital marketing", "seo",
        "content", "growth marketer", "brand"
    ]),

    # 6️⃣ Human Resources
    ("Human Resources", [
        "hr", "human resource", "recruiter", "talent acquisition"
    ]),

    # 7️⃣ Operations
    ("Operations", [
        "operations", "logistics", "supply chain", "ops"
    ]),

    # 8️⃣ Leadership
    ("Leadership", [
        "ceo", "cto", "cfo", "coo", "founder",
        "director", "head", "manager"
    ]),

    # 9️⃣ Customer Support
    ("Customer Support", [
        "support", "customer service", "customer success"
    ])
]

# ----------------------------------
# MAIN FUNCTION USED BY PIPELINE
# ----------------------------------
def map_role_function(df: pd.DataFrame) -> pd.DataFrame:
    """
    Creates ONLY 'role_description' column
    """
    df = df.copy()

    if 'job_title' not in df.columns:
        print("job_title column missing. Skipping role description mapping.")
        return df

    df['job_title_clean'] = df['job_title'].apply(clean_job_title)

    def infer_role(title):
        for role, keywords in ROLE_RULES:
            for kw in keywords:
                if kw in title:
                    return role
        return "Other / Unknown"

    df['role_description'] = df['job_title_clean'].apply(infer_role)

    df.drop(columns=['job_title_clean'], inplace=True)

    return df
