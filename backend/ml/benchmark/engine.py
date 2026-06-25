import time
import numpy as np
from typing import List, Dict, Tuple
from backend.ml.models.traditional import LGBMModel
from backend.ml.evaluation.metrics import MetricElevator
from backend.ml.experiments.tracker import ExperimentTracker
from backend.configs.settings import settings
from backend.configs.logging import logger

class BenchmarkEngine:
    """
    Core engine for head-to-head model comparison.
    Trains candidates and produces the production leaderboard.
    """
    def __init__(self):
        self.tracker = ExperimentTracker()
        self.metrics_cal = MetricElevator()

    async def run_benchmark(self, 
                            X_train: np.ndarray, y_train: np.ndarray,
                            X_test: np.ndarray, y_test: np.ndarray) -> List[dict]:
        
        candidates = [
            ("LGBM_Default", LGBMModel, settings.LGBM_PARAMS),
            # In a full system, you'd add XGBoost, CatBoost, etc. here
        ]
        
        leaderboard = []
        
        for name, model_cls, params in candidates:
            logger.info("benchmark.candidate.start", model=name)
            
            # 1. Instantiate & Train
            model = model_cls(model_id=name, params=params)
            start_time = time.time()
            model.train(X_train, y_train, validation_data=(X_test, y_test))
            train_duration = time.time() - start_time
            
            # 2. Inference & Eval
            infer_start = time.time()
            y_prob = model.predict(X_test)
            inference_latency = (time.time() - infer_start) / len(X_test)
            
            metrics = self.metrics_cal.calculate_flare_metrics(y_test, y_prob)
            metrics["training_time_sec"] = round(train_duration, 3)
            metrics["inference_latency_avg_ms"] = round(inference_latency * 1000, 4)
            
            # 3. Log to Tracking System
            run_id = await self.tracker.log_experiment(
                model_id=name, 
                params=params, 
                metrics=metrics, 
                dataset_info={"samples": len(y_train)}
            )
            
            # 4. Score for Selection
            score = (
                metrics["f1_score"] * settings.BENCHMARK_WEIGHTS["f1_score"] -
                (inference_latency * 100) * settings.BENCHMARK_WEIGHTS["latency"]
            )
            
            leaderboard.append({
                "run_id": run_id,
                "model_id": name,
                "score": round(score, 4),
                "metrics": metrics
            })
            
        # Sort by weighted score
        leaderboard.sort(key=lambda x: x["score"], reverse=True)
        logger.info("benchmark.complete", winner=leaderboard[0]["model_id"])
        
        return leaderboard
