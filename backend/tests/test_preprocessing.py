import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from backend.ml.pipeline.preprocessing.pipeline import PreprocessingPipeline

@pytest.fixture
def raw_telemetry_bundle():
    now = datetime.utcnow()
    # SoLEXS data every 10s
    solexs_data = {
        "timestamp": [now + timedelta(seconds=10 * i) for i in range(100)],
        "solexs_flux": np.random.normal(10, 1, 100)
    }
    # HEL1OS data every 10s but offset by 2s
    hel1os_data = {
        "timestamp": [now + timedelta(seconds=10 * i + 2) for i in range(100)],
        "hel1os_flux": np.random.normal(5, 0.5, 100)
    }
    return {
        "SoLEXS": pd.DataFrame(solexs_data),
        "HEL1OS": pd.DataFrame(hel1os_data)
    }

@pytest.mark.asyncio
async def test_preprocessing_pipeline_full_run(raw_telemetry_bundle):
    pipeline = PreprocessingPipeline()
    
    # Run pipeline
    processed_df, report = await pipeline.run(raw_telemetry_bundle)
    
    assert not processed_df.empty
    assert "solexs_solexs_flux" in processed_df.columns
    assert "hel1os_hel1os_flux" in processed_df.columns
    assert "timestamp" in processed_df.columns
    
    # Verify report
    assert report.total_processed_rows > 0
    assert report.sync_coverage_pct > 0
    assert len(report.config_hash) == 12
    
    # Verify denoising (values should be different from raw due to smoothing)
    assert not np.array_equal(processed_df["solexs_solexs_flux"].values, raw_telemetry_bundle["SoLEXS"]["solexs_flux"].values)

def test_outlier_detection():
    from backend.ml.pipeline.preprocessing.outliers import OutlierDetector
    detector = OutlierDetector()
    df = pd.DataFrame({"flux": [10.0] * 100 + [5000.0]}) # One massive outlier
    processed = detector.process(df, method="zscore")
    assert "flux_is_outlier" in processed.columns
    assert processed["flux_is_outlier"].iloc[-1] == True
