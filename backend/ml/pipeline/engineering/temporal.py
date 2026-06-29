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

        new_cols: dict = {}
        for col in numeric_cols:
            # 1. Lags
            for lag in lags:
                new_cols[f"{col}_lag_{lag}"] = df[col].shift(lag)

            # 2. Rate of Change (First Derivative)
            delta = df[col].diff()
            new_cols[f"{col}_delta"] = delta
            # Explicit formula with epsilon to prevent ZeroDivisionError
            new_cols[f"{col}_rate_of_change"] = delta / (df[col].shift(1) + 1e-9)

            # 3. Acceleration (Second Derivative)
            new_cols[f"{col}_acceleration"] = delta.diff()

        # Single concat — avoids repeated fragmentation from per-column assignment
        return pd.concat([df, pd.DataFrame(new_cols, index=df.index)], axis=1)
