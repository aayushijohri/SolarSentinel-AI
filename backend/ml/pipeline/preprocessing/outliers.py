import pandas as pd
import numpy as np
from backend.ml.pipeline.preprocessing.base_processor import BaseProcessor
from backend.configs.settings import settings

class OutlierDetector(BaseProcessor):
    """
    Detects anomalies in solar flux telemetry.
    Flags outliers without removing them.
    """
    def process(self, df: pd.DataFrame, method: str = None) -> pd.DataFrame:
        method = method or settings.OUTLIER_METHOD
        threshold = settings.OUTLIER_THRESHOLD
        
        # Select numeric columns for outlier detection (flux bins)
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            is_outlier = pd.Series(False, index=df.index)
            
            if method == "zscore":
                z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
                is_outlier = z_scores > threshold
            elif method == "iqr":
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                is_outlier = (df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))
            elif method == "rolling":
                rolling_mean = df[col].rolling(window=20, center=True).mean()
                rolling_std = df[col].rolling(window=20, center=True).std()
                is_outlier = np.abs(df[col] - rolling_mean) > (threshold * rolling_std)
                
            df[f"{col}_is_outlier"] = is_outlier
            
        return df
