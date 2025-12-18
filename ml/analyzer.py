import pandas as pd
import numpy as np
import re

class DataAnalyzer:
    def __init__(self, df):
        self.df = df.copy()
        self.report = {
            "initial_rows": len(df),
            "missing_values": {},
            "duplicates": 0,
            "anomalies": 0,
            "inconsistencies": 0,
            "formatting_issues": {}
        }

    def analyze(self):
        """
        Runs analysis without modifying the dataframe to produce a report.
        """
        # 1. Missing Values
        missing_report = self.df.isnull().sum().to_dict()
        self.report["missing_values"] = {k: v for k, v in missing_report.items() if v > 0}

        # 2. Duplicates
        dup_count = self.df.duplicated().sum()
        self.report["duplicates"] = int(dup_count)

        # 3. Invalid Formatting (Inconsistencies)
        formatting_issues = {}
        total_formatting = 0
        
        email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        phone_regex = r'^\+?[1-9]\d{1,14}$' # Simple E.164
        
        # Identify columns by name heuristic
        email_cols = [c for c in self.df.columns if 'email' in c.lower()]
        phone_cols = [c for c in self.df.columns if 'phone' in c.lower() or 'mobile' in c.lower()]
        date_cols = [c for c in self.df.columns if 'date' in c.lower() or 'time' in c.lower() or 'dob' in c.lower()]

        # Check Emails
        for col in email_cols:
            non_null = self.df[col].dropna().astype(str)
            if len(non_null) > 0:
                errors = (~non_null.str.match(email_regex)).sum()
                if errors > 0:
                    formatting_issues[col] = int(errors)
                    total_formatting += errors

        # Check Phones
        for col in phone_cols:
            non_null = self.df[col].dropna().astype(str)
            if len(non_null) > 0:
                errors = (~non_null.str.match(phone_regex)).sum()
                if errors > 0: 
                    formatting_issues[col] = int(errors)
                    total_formatting += errors

        # Check Dates
        for col in date_cols:
             non_null = self.df[col].dropna()
             if len(non_null) > 0:
                 try:
                     pd.to_datetime(non_null, errors='raise')
                 except:
                     converted = pd.to_datetime(non_null, errors='coerce')
                     errors = converted.isna().sum()
                     if errors > 0:
                         formatting_issues[col] = int(errors)
                         total_formatting += errors

        self.report["formatting_issues"] = formatting_issues
        self.report["inconsistencies"] = int(total_formatting)
        self.report["anomalies"] = 0 # DEPRECATED

        # 4. Quality Score
        self.report["quality_score"] = self.calculate_quality_score()
        
        return self.report

    def calculate_quality_score(self):
        # 1. Missing Rate (%)
        total_missing = sum(self.report['missing_values'].values())
        total_cells = max(1, self.df.size)
        missing_rate = (total_missing / total_cells) * 100
        
        # 2. Duplicate Rate (%)
        total_rows = max(1, len(self.df))
        duplicate_rate = (self.report['duplicates'] / total_rows) * 100
        
        # 3. Formatting Issue Rate (%)
        validity_issue_rate = (self.report['inconsistencies'] / total_cells) * 100
        
        # Final Score is still a "Quality Health" metric (higher is better)
        # Calculated as 100 - Average Error Rate
        avg_error = (missing_rate + duplicate_rate + validity_issue_rate) / 3
        quality_health_score = max(0, 100 - avg_error)
        
        return round(quality_health_score, 1)
