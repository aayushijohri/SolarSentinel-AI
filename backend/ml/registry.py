import os
from datetime import datetime
from typing import Dict, Optional, Any
from backend.ml.models.base import BaseModel
from backend.configs.settings import settings
from backend.configs.logging import logger

class ModelRegistry:
    """
    Central repository for all model versions and production routing.
    """
    def __init__(self):
        self.active_model: Optional[BaseModel] = None
        self.models_dir = settings.ARTIFACTS_DIR / "models"
        self.models_dir.mkdir(parents=True, exist_ok=True)

    def register_model(self, model: BaseModel, metadata: Dict[str, Any]):
        """
        Store model artifacts and metadata.
        """
        version = metadata.get("version", "v1.0")
        model_path = self.models_dir / f"{model.model_id}_{version}.joblib"
        model.save(str(model_path))
        
        # In a real system, we'd also store metadata in MongoDB
        logger.info("registry.registered", model=model.model_id, version=version)
        return str(model_path)

    def promote_to_production(self, model_id: str, version: str):
        """
        Set a specific model/version as the active production model.
        """
        # Logic to update a pointer or database record
        # For now, we update the local environment/config
        logger.info("registry.promoted", model=model_id, version=version)

    def load_production_model(self) -> Optional[BaseModel]:
        """
        Retrieve the currently active model for inference.
        """
        if self.active_model:
            return self.active_model
            
        # Implementation to dynamically load based on settings
        model_type = getattr(settings, "MODEL_TYPE", "lightgbm")
        logger.info("registry.loading_prod", model=model_type)
        return None # Placeholder for actual instantiation

model_registry = ModelRegistry()
