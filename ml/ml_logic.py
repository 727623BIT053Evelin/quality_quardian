import pandas as pd
import numpy as np
import re
from sklearn.ensemble import IsolationForest
from sklearn.impute import SimpleImputer

class DataCleaner:
    def __init__(self, df):
        self.df = df
        self.original_df = df.copy()
        self.report = {
            "initial_rows": len(df),
            "missing_values": {},
            "duplicates": 0,
            "anomalies": 0,
            "inconsistencies": 0
        }

    def handle_missing_values(self):
        """
        Identifies and corrects missing values.
        - Numeric cols: Imputed with Mean.
        - Categorical cols: Imputed with Mode (Most Frequent).
        """
        # Identification
        missing_report = self.df.isnull().sum().to_dict()
        self.report["missing_values"] = {k: v for k, v in missing_report.items() if v > 0}
        
        # Correction
        # Numeric Imputation
        num_cols = self.df.select_dtypes(include=[np.number]).columns
        if len(num_cols) > 0:
            num_imputer = SimpleImputer(strategy='mean')
            self.df[num_cols] = num_imputer.fit_transform(self.df[num_cols])

        # Categorical Imputation
        cat_cols = self.df.select_dtypes(include=['object', 'category']).columns
        if len(cat_cols) > 0:
            cat_imputer = SimpleImputer(strategy='most_frequent')
            self.df[cat_cols] = cat_imputer.fit_transform(self.df[cat_cols])
        
        return self.df

    def handle_duplicates(self):
        """
        Identifies and removes duplicate rows.
        """
        # Identification
        dup_count = self.df.duplicated().sum()
        self.report["duplicates"] = int(dup_count)

        # Correction
        if dup_count > 0:
            self.df.drop_duplicates(inplace=True)
        
        return self.df

    def detect_anomalies(self):
        """
        Uses Isolation Forest to detect anomalies in numeric data.
        """
        num_cols = self.df.select_dtypes(include=[np.number]).columns
        
        if len(num_cols) > 0:
            # Initialize Isolation Forest
            iso_forest = IsolationForest(contamination=0.05, random_state=42)
            
            # Predict anomalies (-1 is anomaly, 1 is normal)
            self.df['anomaly_score'] = iso_forest.fit_predict(self.df[num_cols])
            
            # Count anomalies
            anomalies_count = (self.df['anomaly_score'] == -1).sum()
            self.report["anomalies"] = int(anomalies_count)
            
            # We filter out anomalies for the 'clean' version, or keep them flagged?
            # User request said "correct these", but for anomalies often we flag them.
            # Let's keep them in but flagged for the report.
        else:
            self.df['anomaly_score'] = 1 # All normal if no numeric data
            
        return self.df

    def fix_inconsistencies(self):
        """
        Standardizes string formats:
        - Trims whitespace.
        - Validates Email formats (just finding, typically hard to 'correct' without dropping).
        """
        inconsistency_count = 0
        
        # String standardization
        str_cols = self.df.select_dtypes(include=['object']).columns
        for col in str_cols:
            # Trim whitespace
            self.df[col] = self.df[col].str.strip()
            
            # Title case for Names/Cities? (Optional, maybe too aggressive)
            # self.df[col] = self.df[col].str.title()

        # Email Validation Check
        if 'email' in self.df.columns.str.lower():
            # Find column resembling email
            email_col = [c for c in self.df.columns if 'email' in c.lower()][0]
            
            # Simple regex for email
            email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
            mask = ~self.df[email_col].astype(str).str.match(email_regex, na=False)
            invalid_emails = mask.sum()
            inconsistency_count += invalid_emails
            
            # 'Correcting' could mean setting to NaN or removing, let's set to NaN (treated as missing next time?)
            # Or just flag. For now, we count them.
        
        self.report["inconsistencies"] = int(inconsistency_count)
        return self.df

    def run_pipeline(self):
        """
        Runs the full cleaning pipeline.
        """
        print("Starting cleaning pipeline...")
        self.handle_missing_values()
        self.handle_duplicates()
        self.fix_inconsistencies()
        self.detect_anomalies() # Run last to flag rows
        
        final_stats = {
            "final_rows": len(self.df),
            "quality_score": self.calculate_quality_score()
        }
        self.report.update(final_stats)
        
        return self.df, self.report

    def calculate_quality_score(self):
        """
        Simple heuristic for quality score (0-100).
        """
        total_issues = (
            sum(self.report['missing_values'].values()) + 
            self.report['duplicates'] + 
            self.report['anomalies'] + 
            self.report['inconsistencies']
        )
        total_cells = self.original_df.size
        
        # Avoid division by zero
        if total_cells == 0: return 0
        
        score = 100 - (total_issues / total_cells * 1000) # Weighting issues
        return max(0, min(100, round(score, 1)))
