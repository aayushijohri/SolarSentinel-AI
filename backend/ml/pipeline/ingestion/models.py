from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum

class IngestionStatus(str, Enum):
    SUCCESS = "success"
    PARTIAL = "partial_success"
    FAILED = "failed"

class ValidationWarning(BaseModel):
    row_index: Optional[int] = None
    column: str
    message: str
    value: Any

class IngestionMetadata(BaseModel):
    """
    Comprehensive audit metadata for scientific datasets.
    """
    instrument: str
    source_file: str
    file_format: str
    checksum_sha256: str
    row_count: int
    valid_rows: int
    rejected_rows: int
    start_time: datetime
    end_time: datetime
    cadence_seconds: Optional[float] = None
    schema_version: str = "1.0"
    ingestion_timestamp: datetime = Field(default_factory=datetime.utcnow)

class IngestionReport(BaseModel):
    status: IngestionStatus
    metadata: IngestionMetadata
    errors: List[str] = []
    warnings: List[ValidationWarning] = []
    execution_time_ms: float
