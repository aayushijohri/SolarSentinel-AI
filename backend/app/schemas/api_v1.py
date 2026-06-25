from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum

# --- Telemetry ---
class TelemetryResponse(BaseModel):
    id: str
    instrument: str
    timestamp: datetime
    data: Dict[str, Any]
    created_at: datetime

class TelemetryUploadResponse(BaseModel):
    message: str
    report_id: str
    status: str
    rows_processed: int

# --- Prediction ---
class FlareClass(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    M = "M"
    X = "X"
    NONE = "None"

class PredictionRequest(BaseModel):
    dataset_id: Optional[str] = None
    use_latest: bool = True

class PredictionResponse(BaseModel):
    prediction_id: str = Field(default_factory=lambda: "pred_" + datetime.now().strftime("%Y%m%d%H%M%S"))
    prediction: float
    probability: float
    confidence: float
    predicted_class: FlareClass
    lead_time_min: int
    model_version: str
    processing_duration_ms: float
    derived_metrics: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# --- Explainability ---
class FeatureImportance(BaseModel):
    feature: str
    impact: float # SHAP/LIME value

class PredictionExplanation(BaseModel):
    prediction_id: str
    top_features: List[FeatureImportance]
    explanation_text: str
    calibration_score: float

# --- Models ---
class ModelLeaderboardEntry(BaseModel):
    model_id: str
    version: str
    f1_score: float
    precision: float
    recall: float
    latency_ms: float
    status: str # "production" | "candidate" | "archived"

# --- Alerts ---
class AlertResponse(BaseModel):
    id: str
    severity: str
    message: str
    timestamp: datetime
    is_resolved: bool
