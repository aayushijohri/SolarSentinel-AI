from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any, Optional

class ProcessingQualityReport(BaseModel):
    """
    Quality report for a processed telemetry dataset.
    """
    raw_dataset_id: str
    processed_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Coverage Metrics
    start_time: datetime
    end_time: datetime
    total_raw_rows: int
    total_processed_rows: int
    
    # Quality Statistics
    missing_percentage: float
    outlier_count: int
    sync_matched_rows: Optional[int] = None
    sync_coverage_pct: Optional[float] = None
    
    # Process Lineage
    pipeline_version: str = "1.0"
    config_hash: str
    processing_duration_sec: float
