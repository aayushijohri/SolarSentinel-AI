import pandas as pd
import numpy as np
from datetime import datetime
from typing import Tuple, List
from backend.ml.pipeline.ingestion.models import ValidationWarning

class ScientificValidator:
    """
    Implements domain-specific validation logic for SoLEXS/HEL1OS telemetry.
    """
    
    @staticmethod
    def validate_physics(df: pd.DataFrame, instrument: str) -> Tuple[pd.DataFrame, List[ValidationWarning]]:
        """
        Validates physical constraints and identifies impossible values.
        """
        warnings = []
        
        # 1. Negative Flux Check
        flux_cols = [c for c in df.columns if 'flux' in c.lower() or 'counts' in c.lower()]
        for col in flux_cols:
            neg_mask = df[col] < 0
            if neg_mask.any():
                indices = df.index[neg_mask].tolist()
                warnings.append(ValidationWarning(
                    column=col,
                    message=f"Negative physical values detected in {len(indices)} rows",
                    value="multiple"
                ))
                # Clip negative values to zero for scientific consistency in raw storage
                df.loc[neg_mask, col] = 0.0

        # 2. Duplicate Timestamps Check
        if 'timestamp' in df.columns:
            duplicates = df.duplicated(subset=['timestamp'])
            if duplicates.any():
                warnings.append(ValidationWarning(
                    column="timestamp",
                    message=f"Detected {duplicates.sum()} duplicate timestamps",
                    value="duplicate"
                ))
                df = df.drop_duplicates(subset=['timestamp'])

        return df, warnings

    @staticmethod
    def check_missing_columns(df: pd.DataFrame, required: List[str]) -> List[str]:
        missing = [col for col in required if col not in df.columns]
        return missing
