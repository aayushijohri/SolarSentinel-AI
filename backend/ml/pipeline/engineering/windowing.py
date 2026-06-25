import pandas as pd
import numpy as np
from typing import Tuple
from backend.configs.settings import settings

class WindowGenerator:
    """
    Transforms time-series features into sliding window matrices.
    Supports Nowcasting (t=0) and Forecasting (t+n).
    """
    def __init__(self, window_size: int = None, horizon: int = None, stride: int = None):
        self.window_size = window_size or settings.WINDOW_LENGTH_MIN
        self.horizon = horizon or settings.FORECAST_HORIZON_MIN
        self.stride = stride or settings.STRIDE_MIN

    def generate(self, df: pd.DataFrame, target_col: str) -> Tuple[np.ndarray, np.ndarray]:
        """
        Creates (X, y) pairs for supervised learning.
        X shape: (samples, window_size, features)
        y shape: (samples,)
        """
        # Ensure we only use numeric features
        features_df = df.select_dtypes(include=[np.number]).drop(columns=[target_col], errors='ignore')
        target_df = df[target_col]
        
        X, y = [], []
        
        total_len = len(df)
        step = self.stride
        
        # We need enough data for (Window + Horizon)
        for i in range(0, total_len - self.window_size - self.horizon, step):
            # Features: [t-window, t]
            window = features_df.iloc[i : i + self.window_size].values
            # Target: [t+horizon]
            label = target_df.iloc[i + self.window_size + self.horizon]
            
            X.append(window)
            y.append(label)
            
        return np.array(X), np.array(y)
