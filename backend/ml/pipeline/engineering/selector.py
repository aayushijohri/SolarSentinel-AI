import pandas as pd
import numpy as np
from sklearn.feature_selection import VarianceThreshold
from backend.configs.settings import settings
from backend.configs.logging import logger

class FeatureSelector:
    """
    Filters the feature matrix to remove redundant or low-information signals.
    """
    def select(self, df: pd.DataFrame) -> pd.DataFrame:
        if not settings.FEATURE_SELECTION_ENABLED:
            return df

        original_count = len(df.columns)
        
        # 1. Variance Threshold (Remove constant or near-constant features)
        # Only apply to numeric, non-boolean columns
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        # Filter columns that don't end in _is_outlier (boolean flags)
        numeric_cols = [c for c in numeric_cols if not c.endswith('_is_outlier')]
        
        if not numeric_cols:
            return df

        try:
            selector = VarianceThreshold(threshold=settings.VARIANCE_THRESHOLD)
            selector.fit(df[numeric_cols])
            selected_cols = df[numeric_cols].columns[selector.get_support()]
            
            # Keep non-numeric and boolean columns as well
            other_cols = [c for c in df.columns if c not in numeric_cols]
            df = df[list(selected_cols) + other_cols]
            
            # 2. Correlation Filter (Remove highly redundant pairs)
            corr_matrix = df[selected_cols].corr().abs()
            upper = corr_matrix.where(np.triu(np.ones(corr_matrix.shape), k=1).astype(bool))
            to_drop = [column for column in upper.columns if any(upper[column] > settings.CORRELATION_THRESHOLD)]
            df = df.drop(columns=to_drop)
            
            logger.info("feature_selection.complete", 
                        original=original_count, 
                        reduced=len(df.columns), 
                        dropped=original_count - len(df.columns))
            
        except Exception as e:
            logger.error("feature_selection.failed", error=str(e))
            
        return df
