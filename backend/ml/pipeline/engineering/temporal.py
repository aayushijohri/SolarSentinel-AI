import pandas as pd
from backend.ml.pipeline.engineering.base_engineer import BaseFeatureEngineer
from backend.configs.settings import settings

class TemporalEngineer(BaseFeatureEngineer):
    """
    Generates lags, deltas, and derivatives to capture solar dynamics.
    """
    def engineer(self, df: pd.DataFrame) -> pd.DataFrame:
        lags = settings.FEATURE_LAGS
        numeric_cols = [c for c in df.columns if any(instr in c for instr in ['solexs', 'hel1os'])]
        
        for col in numeric_cols:
            # 1. Lags
            for lag in lags:
                df[f"{col}_lag_{lag}"] = df[col].shift(lag)
            
            # 2. Rate of Change (First Derivative)
            df[f"{col}_delta"] = df[col].diff()
            # Explicit formula with epsilon to prevent ZeroDivisionError
            df[f"{col}_rate_of_change"] = df[col].diff() / (df[col].shift(1) + 1e-9)
            
            # 3. Acceleration (Second Derivative)
            df[f"{col}_acceleration"] = df[f"{col}_delta"].diff()
            
        return df
