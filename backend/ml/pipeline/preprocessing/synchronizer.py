import pandas as pd
from typing import Dict, Tuple
from backend.configs.settings import settings
from backend.configs.logging import logger

class InstrumentSynchronizer:
    """
    Synchronizes multiple instruments (SoLEXS/HEL1OS) onto a common temporal grid.
    """
    def sync(self, datasets: Dict[str, pd.DataFrame]) -> Tuple[pd.DataFrame, dict]:
        """
        Merge instruments using the common UTC timestamp.
        """
        if len(datasets) < 2:
            instrument = list(datasets.keys())[0]
            return datasets[instrument], {"matched_rows": len(datasets[instrument])}

        # 1. Standardize column names to prevent collisions
        prefixed_dfs = []
        for name, df in datasets.items():
            # Ensure index is timestamp for merge_asof
            df = df.sort_values('timestamp')
            cols = {c: f"{name.lower()}_{c}" for c in df.columns if c != 'timestamp'}
            prefixed_dfs.append(df.rename(columns=cols))

        # 2. Sequential Merge using merge_asof
        # We use the first instrument as the base timeline
        merged = prefixed_dfs[0]
        tolerance = pd.Timedelta(seconds=settings.SYNC_TOLERANCE_SECONDS)

        for other_df in prefixed_dfs[1:]:
            merged = pd.merge_asof(
                merged, 
                other_df, 
                on='timestamp', 
                direction=settings.SYNC_STRATEGY,
                tolerance=tolerance
            )

        # 3. Calculate Quality Metrics
        matched_rows = len(merged.dropna())
        coverage = (matched_rows / len(merged)) * 100 if len(merged) > 0 else 0
        
        metrics = {
            "total_rows": len(merged),
            "matched_rows": matched_rows,
            "coverage_pct": round(coverage, 2)
        }
        
        logger.info("sync.complete", matched=matched_rows, coverage=f"{coverage:.2f}%")
        return merged, metrics
