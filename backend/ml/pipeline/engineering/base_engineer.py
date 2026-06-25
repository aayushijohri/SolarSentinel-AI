from abc import ABC, abstractmethod
import pandas as pd
from typing import List

class BaseFeatureEngineer(ABC):
    """
    Abstract interface for specialized feature engineering modules.
    """
    @abstractmethod
    def engineer(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Generate new features in the provided dataframe.
        """
        pass
