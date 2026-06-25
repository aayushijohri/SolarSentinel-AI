import pandas as pd
import numpy as np
from scipy.signal import savgol_filter
from scipy.ndimage import gaussian_filter1d
from backend.ml.pipeline.preprocessing.base_processor import BaseProcessor
from backend.configs.settings import settings

class TelemetryDenoiser(BaseProcessor):
    """
    Applies signal processing to reduce sensor jitter.
    """
    def process(self, df: pd.DataFrame, method: str = None) -> pd.DataFrame:
        method = method or settings.DENOISING_METHOD
        window = settings.SMOOTHING_WINDOW
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        # Filter out outlier flags
        numeric_cols = [c for c in numeric_cols if not c.endswith('_is_outlier')]
        
        for col in numeric_cols:
            if method == "rolling_mean":
                df[col] = df[col].rolling(window=window, center=True, min_periods=1).mean()
            elif method == "rolling_median":
                df[col] = df[col].rolling(window=window, center=True, min_periods=1).median()
            elif method == "savgol":
                # Ensure window is odd for Savitzky-Golay
                w = window if window % 2 != 0 else window + 1
                if len(df) > w:
                    df[col] = savgol_filter(df[col], window_length=w, polyorder=2)
            elif method == "gaussian":
                df[col] = gaussian_filter1d(df[col].ffill().fillna(0), sigma=1.0)
                
        return df
