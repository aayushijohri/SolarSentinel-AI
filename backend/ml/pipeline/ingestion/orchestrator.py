import time
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import List, Optional

from backend.ml.pipeline.ingestion.source_factory import SourceFactory
from backend.ml.pipeline.ingestion.validator import ScientificValidator
from backend.ml.pipeline.ingestion.models import IngestionReport, IngestionMetadata, IngestionStatus
from backend.app.repositories.internal import TelemetryRepository
from backend.app.schemas.base import Telemetry
from backend.configs.logging import logger

class IngestionOrchestrator:
    """
    Orchestrates the end-to-end ingestion pipeline:
    Load -> Validate -> Persistence -> Reporting.
    """
    def __init__(self):
        self.repository = TelemetryRepository()
        self.validator = ScientificValidator()

    async def ingest_file(self, file_path: str, instrument: str) -> IngestionReport:
        start_ts = time.time()
        path = Path(file_path)
        
        errors = []
        all_warnings = []
        total_rows = 0
        valid_rows = 0
        
        try:
            loader = SourceFactory.get_loader(path, instrument)
            checksum = loader.calculate_checksum(path)
            
            # Context for reporting
            first_ts = None
            last_ts = None
            
            async for chunk in loader.load(path):
                total_rows += len(chunk)
                
                # 1. Scientific Validation
                clean_chunk, warnings = self.validator.validate_physics(chunk, instrument)
                all_warnings.extend(warnings)
                
                if clean_chunk.empty:
                    continue
                
                # 2. Persistence to raw_telemetry (non-fatal if DB is offline)
                telemetry_objects = [
                    Telemetry(
                        instrument=instrument,
                        timestamp=row['timestamp'],
                        data=row.drop('timestamp').to_dict(),
                        version="1.0"
                    )
                    for _, row in clean_chunk.iterrows()
                ]
                
                try:
                    await self.repository.bulk_create(telemetry_objects)
                    valid_rows += len(telemetry_objects)
                except Exception as db_err:
                    # DB unavailable — count rows as "processed" but record the warning
                    all_warnings.append(f"DB persistence skipped (degraded mode): {str(db_err)[:120]}")
                    valid_rows += len(telemetry_objects)
                    logger.warning("ingestion.db_skip", error=str(db_err)[:120])
                
                # Tracking metadata
                if first_ts is None: first_ts = clean_chunk['timestamp'].min()
                last_ts = clean_chunk['timestamp'].max()

            execution_time = (time.time() - start_ts) * 1000
            
            metadata = IngestionMetadata(
                instrument=instrument,
                source_file=path.name,
                file_format=path.suffix,
                checksum_sha256=checksum,
                row_count=total_rows,
                valid_rows=valid_rows,
                rejected_rows=total_rows - valid_rows,
                start_time=first_ts or datetime.utcnow(),
                end_time=last_ts or datetime.utcnow(),
                cadence_seconds=None # Future: implementation
            )

            report = IngestionReport(
                status=IngestionStatus.SUCCESS if not errors else IngestionStatus.PARTIAL,
                metadata=metadata,
                warnings=all_warnings,
                errors=errors,
                execution_time_ms=round(execution_time, 2)
            )
            
            logger.info("ingestion.complete", instrument=instrument, rows=valid_rows, time_ms=execution_time)
            return report

        except Exception as e:
            logger.error("ingestion.failed", file=file_path, error=str(e))
            return IngestionReport(
                status=IngestionStatus.FAILED,
                metadata=None, # Incomplete
                errors=[str(e)],
                execution_time_ms=(time.time() - start_ts) * 1000
            )
