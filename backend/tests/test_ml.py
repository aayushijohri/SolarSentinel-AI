import pytest
import numpy as np
from backend.ml.models.traditional import LGBMModel
from backend.ml.evaluation.metrics import MetricElevator
from backend.ml.benchmark.engine import BenchmarkEngine
from backend.app.core.database import db_manager

@pytest.fixture
def dummy_dataset():
    # 100 samples, 10 features
    X = np.random.rand(100, 10)
    # Simple rule: if first feature > 0.5, flare (1)
    y = (X[:, 0] > 0.5).astype(int)
    return X, y

def test_lgbm_model_lifecycle(dummy_dataset):
    X, y = dummy_dataset
    model = LGBMModel(model_id="test_lgbm", params={"n_estimators": 10, "n_jobs": 1})
    
    # Train
    model.train(X, y)
    
    # Predict
    probs = model.predict(X)
    assert probs.shape == (100,)
    assert np.all((probs >= 0) & (probs <= 1))

def test_metrics_calculation():
    y_true = np.array([0, 1, 0, 1])
    y_prob = np.array([0.1, 0.9, 0.2, 0.8])
    
    metrics = MetricElevator.calculate_flare_metrics(y_true, y_prob)
    assert metrics["accuracy"] == 1.0
    assert metrics["f1_score"] == 1.0
    assert metrics["roc_auc"] == 1.0

@pytest.mark.asyncio
async def test_benchmark_engine_run(dummy_dataset):
    X, y = dummy_dataset
    # Split
    X_train, X_test = X[:80], X[80:]
    y_train, y_test = y[:80], y[80:]
    
    await db_manager.connect()
    engine = BenchmarkEngine()
    
    leaderboard = await engine.run_benchmark(X_train, y_train, X_test, y_test)
    
    assert len(leaderboard) > 0
    assert "score" in leaderboard[0]
    assert "metrics" in leaderboard[0]
    
    await db_manager.disconnect()
