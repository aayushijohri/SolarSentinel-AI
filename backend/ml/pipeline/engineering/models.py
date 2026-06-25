from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict, Any, Optional

class FeatureMetadata(BaseModel):
    name: str
    description: str
    instrument: str
    category: str # e.g., "rolling", "physics", "spectral"
    version: str = "1.0"
    config_hash: str

class FeatureQualityReport(BaseModel):
    feature_count: int
    missing_percentage: float
    top_correlated_pairs: List[tuple]
    variance_summary: Dict[str, float]
    processing_duration_sec: float
    memory_usage_mb: float
    generated_at: datetime = Field(default_factory=datetime.utcnow)
