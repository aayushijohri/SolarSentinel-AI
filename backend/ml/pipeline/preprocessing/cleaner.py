import pandas as pd
from backend.ml.pipeline.preprocessing.base_processor import BaseProcessor
from backend.configs.settings import settings

class TelemetryCleaner(BaseProcessor):
    """
    Handles standard cleaning: duplicates and missing values.
    """
    def process(self, df: pd.DataFrame, strategy: str = None) -> pd.DataFrame:
        strategy = strategy or settings.MISSING_DATA_STRATEGY
        
        # 1. Deduplication
        if 'timestamp' in df.columns:
            df = df.sort_values('timestamp').drop_duplicates('timestamp')
        
        # 2. Resampling & Reindexing (to ensure temporal continuity)
        if 'timestamp' in df.columns:
            df = df.set_index('timestamp').resample(settings.RESAMPLE_CADENCE).asfreq()
        
        # 3. Missing Value Handling
        if strategy == "ffill":
            df = df.ffill()
        elif strategy == "bfill":
            df = df.bfill()
        elif strategy == "interpolate":
            df = df.interpolate(method='linear')
        elif strategy == "median":
            df = df.fillna(df.median())
            
        return df.reset_index()
