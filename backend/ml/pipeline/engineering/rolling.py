import pandas as pd
import numpy as np
from backend.ml.pipeline.engineering.base_engineer import BaseFeatureEngineer
from backend.configs.settings import settings

class RollingEngineer(BaseFeatureEngineer):
    """
    Computes rolling statistics across multiple time windows.
    """
    def engineer(self, df: pd.DataFrame) -> pd.DataFrame:
        windows = settings.FEATURE_ROLLING_WINDOWS
        # Only process numeric sensor columns
        numeric_cols = [c for c in df.columns if any(instr in c for instr in ['solexs', 'hel1os'])]

        new_cols: dict = {}
        for window_min in windows:
            # Assume 1-min cadence for window calculation if not explicit
            # In production, this would be window_min * (60 / cadence_sec)
            w = window_min
            for col in numeric_cols:
                new_cols[f"{col}_roll_mean_{window_min}m"] = df[col].rolling(window=w).mean()
                new_cols[f"{col}_roll_std_{window_min}m"]  = df[col].rolling(window=w).std()
                new_cols[f"{col}_roll_max_{window_min}m"]  = df[col].rolling(window=w).max()
                new_cols[f"{col}_roll_rms_{window_min}m"]  = np.sqrt(df[col].pow(2).rolling(window=w).mean())

        # Single concat — avoids repeated fragmentation from per-column assignment
        return pd.concat([df, pd.DataFrame(new_cols, index=df.index)], axis=1)
