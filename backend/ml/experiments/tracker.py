import time
import uuid
from datetime import datetime
from typing import Dict, Any
from backend.app.repositories.internal import BaseRepository
from backend.configs.logging import logger

class ExperimentMetadata(BaseRepository):
    def __init__(self):
        super().__init__("experiments", None) # Schema will be handled by Pydantic

class ExperimentTracker:
    """
    Persists training runs, hyperparams, and metrics for historical analysis.
    """
    def __init__(self):
        self.repo = ExperimentMetadata()

    async def log_experiment(self, 
                             model_id: str, 
                             params: dict, 
                             metrics: dict, 
                             dataset_info: dict) -> str:
        
        run_id = f"run_{uuid.uuid4().hex[:8]}"
        
        doc = {
            "run_id": run_id,
            "model_id": model_id,
            "timestamp": datetime.utcnow(),
            "hyperparameters": params,
            "metrics": metrics,
            "dataset_info": dataset_info
        }
        
        # Save to DB (Generic interface)
        await self.repo.collection.insert_one(doc)
        logger.info("experiment.logged", run_id=run_id, model=model_id, f1=metrics.get('f1_score'))
        return run_id
