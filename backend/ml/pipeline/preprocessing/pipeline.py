import time
import hashlib
import pandas as pd
from datetime import datetime
from typing import Dict, List, Tuple

from backend.ml.pipeline.preprocessing.cleaner import TelemetryCleaner
from backend.ml.pipeline.preprocessing.denoiser import TelemetryDenoiser
from backend.ml.pipeline.preprocessing.outliers import OutlierDetector
from backend.ml.pipeline.preprocessing.synchronizer import InstrumentSynchronizer
from backend.ml.pipeline.preprocessing.models import ProcessingQualityReport
from backend.configs.settings import settings
from backend.configs.logging import logger

class PreprocessingPipeline:
    """
    End-to-end scientific preprocessing pipeline.
    Deterministic and reproducible transformation of raw telemetry.
    """
    def __init__(self):
        self.cleaner = TelemetryCleaner()
        self.denoiser = TelemetryDenoiser()
        self.outlier_detector = OutlierDetector()
        self.synchronizer = InstrumentSynchronizer()

    def _generate_config_hash(self) -> str:
        config_str = f"{settings.MISSING_DATA_STRATEGY}-{settings.DENOISING_METHOD}-{settings.SMOOTHING_WINDOW}"
        return hashlib.sha256(config_str.encode()).hexdigest()[:12]

    async def run(self, raw_datasets: Dict[str, pd.DataFrame]) -> Tuple[pd.DataFrame, ProcessingQualityReport]:
        start_time = time.time()
        config_hash = self._generate_config_hash()
        
        logger.info("preprocessing.start", hash=config_hash, instruments=list(raw_datasets.keys()))
        
        # 1. Clean Each Instrument Individually
        cleaned_datasets = {}
        total_raw_rows = 0
        for name, df in raw_datasets.items():
            total_raw_rows += len(df)
            # Stage A: Cleaning & Resampling
            df = self.cleaner.process(df)
            # Stage B: Outlier Detection (before denoising to avoid smearing)
            df = self.outlier_detector.process(df)
            cleaned_datasets[name] = df

        # 2. Multi-instrument Synchronization
        merged_df, sync_metrics = self.synchronizer.sync(cleaned_datasets)

        # 3. Denoising (post-merge to allow global filters)
        processed_df = self.denoiser.process(merged_df)

        duration = time.time() - start_time
        
        # 4. Generate Quality Report
        report = ProcessingQualityReport(
            raw_dataset_id="combined_batch", # Future: real lineage ID
            start_time=processed_df['timestamp'].min(),
            end_time=processed_df['timestamp'].max(),
            total_raw_rows=total_raw_rows,
            total_processed_rows=len(processed_df),
            missing_percentage=round(processed_df.isnull().sum().mean() / len(processed_df) * 100, 4),
            outlier_count=sum([processed_df[c].sum() for c in processed_df.columns if c.endswith('_outlier')]),
            sync_matched_rows=sync_metrics.get("matched_rows"),
            sync_coverage_pct=sync_metrics.get("coverage_pct"),
            config_hash=config_hash,
            processing_duration_sec=round(duration, 3)
        )
        
        logger.info("preprocessing.complete", duration=f"{duration:.3f}s", rows=len(processed_df))
        return processed_df, report
