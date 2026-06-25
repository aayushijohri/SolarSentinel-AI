from abc import ABC, abstractmethod
import numpy as np
import pandas as pd
from typing import Any, Dict, Optional

class BaseModel(ABC):
    """
    Abstract interface for all forecasting models.
    Ensures consistent API for training, inference, and persistence.
    """
    def __init__(self, model_id: str, params: dict):
        self.model_id = model_id
        self.params = params
        self.model = None

    @abstractmethod
    def train(self, X: np.ndarray, y: np.ndarray, validation_data: Optional[tuple] = None):
        """
        Train the model on the provided dataset.
        """
        pass

    @abstractmethod
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Generate predictions (probabilities or classes).
        """
        pass

    @abstractmethod
    def save(self, path: str):
        """
        Serialize the model to disk.
        """
        pass

    @abstractmethod
    def load(self, path: str):
        """
        Deserialize the model from disk.
        """
        pass

    def get_info(self) -> Dict[str, Any]:
        return {
            "model_id": self.model_id,
            "type": self.__class__.__name__,
            "params": self.params
        }
