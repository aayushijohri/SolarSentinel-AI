import pytest
import pandas as pd
import os
from pathlib import Path
from datetime import datetime, timedelta
from backend.ml.pipeline.ingestion.orchestrator import IngestionOrchestrator
from backend.app.core.database import db_manager

@pytest.fixture
async def sample_csv(tmp_path):
    file_path = tmp_path / "test_telemetry.csv"
    data = {
        "timestamp": [
            (datetime.utcnow() - timedelta(minutes=i)).isoformat()
            for i in range(10)
        ],
        "flux_low": [0.1 * i for i in range(10)],
        "flux_high": [1.0 * i for i in range(10)]
    }
    # Add one corrupted row (negative flux) to test validation
    data["flux_low"][5] = -99.0
    
    df = pd.DataFrame(data)
    df.to_csv(file_path, index=False)
    return file_path

@pytest.mark.asyncio
async def test_csv_ingestion_pipeline(sample_csv):
    """
    Test end-to-end ingestion from CSV to MongoDB.
    """
    await db_manager.connect()
    orchestrator = IngestionOrchestrator()
    
    # Run ingestion
    report = await orchestrator.ingest_file(str(sample_csv), instrument="SoLEXS")
    
    assert report.status is not None
    assert report.metadata.row_count == 10
    assert report.metadata.instrument == "SoLEXS"
    
    # Verify validation caught the negative value
    assert len(report.warnings) > 0
    assert any("Negative physical values" in w.message for w in report.warnings)
    
    # Verify persistence
    count = await orchestrator.repository.count({"instrument": "SoLEXS"})
    assert count >= 10
    
    await db_manager.disconnect()

@pytest.mark.asyncio
async def test_unsupported_file():
    orchestrator = IngestionOrchestrator()
    report = await orchestrator.ingest_file("test.txt", instrument="HEL1OS")
    assert report.status == "failed"
    assert "No loader available" in report.errors[0]
