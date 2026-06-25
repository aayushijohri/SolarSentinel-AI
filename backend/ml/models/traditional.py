import lightgbm as lgb
import joblib
import numpy as np
from typing import Optional
from backend.ml.models.base import BaseModel
from backend.configs.logging import logger

class LGBMModel(BaseModel):
    """
    Production-grade LightGBM implementation for solar flare forecasting.
    """
    def __init__(self, model_id: str, params: dict):
        super().__init__(model_id, params)
        self.model = lgb.LGBMClassifier(**params)

    def train(self, X: np.ndarray, y: np.ndarray, validation_data: Optional[tuple] = None):
        logger.info("model.train.start", model=self.model_id, samples=X.shape[0])
        eval_set = [validation_data] if validation_data else None
        
        self.model.fit(
            X, y, 
            eval_set=eval_set,
            eval_metric="binary_logloss"
        )
        logger.info("model.train.complete", model=self.model_id)

    def predict(self, X: np.ndarray) -> np.ndarray:
        return self.model.predict_proba(X)[:, 1] # Return probabilities for flare

    def save(self, path: str):
        joblib.dump(self.model, path)
        logger.info("model.saved", path=path)

    def load(self, path: str):
        self.model = joblib.load(path)
        logger.info("model.loaded", path=path)
