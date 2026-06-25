from abc import ABC, abstractmethod
from typing import Generator, List, Tuple, Optional
import pandas as pd
import hashlib
from pathlib import Path
from backend.ml.pipeline.ingestion.models import IngestionReport, IngestionMetadata

class BaseLoader(ABC):
    """
    Abstract Base Class for all Science Instrument Loaders.
    Defines the contract for file ingestion and metadata management.
    """
    def __init__(self, instrument_name: str):
        self.instrument_name = instrument_name

    @abstractmethod
    async def load(self, file_path: Path) -> Generator[pd.DataFrame, None, None]:
        """
        Yields chunks of data from the source file.
        """
        pass

    def calculate_checksum(self, file_path: Path) -> str:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def estimate_cadence(self, timestamps: pd.Series) -> float:
        if len(timestamps) < 2:
            return 0.0
        diffs = timestamps.diff().dropna()
        return float(diffs.median().total_seconds())
