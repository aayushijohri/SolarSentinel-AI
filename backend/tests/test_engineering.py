import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from backend.ml.pipeline.engineering.pipeline import FeatureEngineeringPipeline
from backend.ml.pipeline.engineering.windowing import WindowGenerator

@pytest.fixture
def processed_df():
    now = datetime.utcnow()
    return pd.DataFrame({
        "timestamp": [now + timedelta(minutes=i) for i in range(100)],
        "solexs_flux": np.sin(np.linspace(0, 10, 100)) + 10,
        "hel1os_flux": np.cos(np.linspace(0, 10, 100)) + 5
    })

@pytest.mark.asyncio
async def test_feature_engineering_full_run(processed_df):
    pipeline = FeatureEngineeringPipeline()
    
    # Run pipeline
    feature_df, report = await pipeline.run(processed_df)
    
    assert not feature_df.empty
    assert report.feature_count > 3 # Original cols + engineered
    
    # Check for physics features
    assert "physics_sxr_hxr_ratio" in feature_df.columns
    assert any("roll_mean" in c for c in feature_df.columns)
    assert any("lag" in c for c in feature_df.columns)

def test_window_generation(processed_df):
    # Add a dummy target for testing
    processed_df["target_flare"] = (processed_df["solexs_flux"] > 10.5).astype(int)
    
    generator = WindowGenerator(window_size=10, horizon=5, stride=1)
    X, y = generator.generate(processed_df, target_col="target_flare")
    
    # total 100. window 10. horizon 5. 
    # Max index available for window start: 100 - 10 - 5 = 85
    # indices: 0 to 84 (inclusive) -> 85 samples
    assert X.shape[0] == 85
    assert X.shape[1] == 10 # window_size
    assert X.shape[2] >= 2 # at least solexs_flux and hel1os_flux
    assert y.shape[0] == 85
