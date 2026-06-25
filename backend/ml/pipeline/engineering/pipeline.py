import time
import pandas as pd
import hashlib
from datetime import datetime
from typing import Tuple

from backend.ml.pipeline.engineering.rolling import RollingEngineer
from backend.ml.pipeline.engineering.temporal import TemporalEngineer
from backend.ml.pipeline.engineering.physics import PhysicsEngineer
from backend.ml.pipeline.engineering.selector import FeatureSelector
from backend.ml.pipeline.engineering.models import FeatureQualityReport
from backend.configs.settings import settings
from backend.configs.logging import logger

class FeatureEngineeringPipeline:
    """
    Orchestrates the deterministic feature extraction process.
    Converts processed telemetry into a sparse, high-information feature matrix.
    """
    def __init__(self):
        self.engineers = [
            RollingEngineer(),
            TemporalEngineer(),
            PhysicsEngineer()
        ]
        self.selector = FeatureSelector()

    def _generate_config_hash(self) -> str:
        config_str = f"{settings.FEATURE_ROLLING_WINDOWS}-{settings.FEATURE_LAGS}-{settings.FEATURE_SELECTION_ENABLED}"
        return hashlib.sha256(config_str.encode()).hexdigest()[:12]

    async def run(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, FeatureQualityReport]:
        start_time = time.time()
        config_hash = self._generate_config_hash()
        
        logger.info("feature_engineering.start", hash=config_hash, initial_cols=len(df.columns))
        
        try:
            # 1. Engineering Phase
            feature_df = df.copy()
            for engineer in self.engineers:
                logger.info("feature_engineering.running", engineer=engineer.__class__.__name__)
                feature_df = engineer.engineer(feature_df)

            # 2. Selection Phase
            logger.info("feature_engineering.selecting")
            feature_df = self.selector.select(feature_df)

            duration = time.time() - start_time
            
            # 3. Generate Report
            logger.info("feature_engineering.reporting")
            numeric_df = feature_df.select_dtypes(include=[float, int, "number"])
            
            # Use safe round and handle NaNs for Pydantic
            missing_pct = float(feature_df.isnull().sum().mean() / len(feature_df) * 100) if len(feature_df) > 0 else 0.0
            
            report = FeatureQualityReport(
                feature_count=len(feature_df.columns),
                missing_percentage=min(max(missing_pct, 0.0), 100.0) if not pd.isna(missing_pct) else 0.0,
                top_correlated_pairs=[],
                variance_summary={}, # Skip complex dict for now to ensure stability
                processing_duration_sec=round(duration, 3),
                memory_usage_mb=round(float(feature_df.memory_usage(deep=True).sum()) / (1024 * 1024), 2)
            )
            
            logger.info("feature_engineering.complete", duration=f"{duration:.3f}s", final_cols=len(feature_df.columns))
            return feature_df, report
            
        except Exception as e:
            logger.error("feature_engineering.failed", error=str(e))
            raise e
