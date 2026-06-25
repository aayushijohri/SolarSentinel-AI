from abc import ABC, abstractmethod
import pandas as pd
from typing import Any

class BaseProcessor(ABC):
    """
    Abstract interface for all preprocessing stages.
    """
    @abstractmethod
    def process(self, df: pd.DataFrame, **kwargs) -> pd.DataFrame:
        """
        Execute the transformation logic.
        """
        pass
