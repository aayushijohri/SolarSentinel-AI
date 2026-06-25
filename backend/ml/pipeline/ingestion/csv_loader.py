import pandas as pd
from pathlib import Path
from typing import Generator
from backend.ml.pipeline.ingestion.base_loader import BaseLoader
from backend.configs.logging import logger

class CSVLoader(BaseLoader):
    """
    High-performance CSV loader with chunking support.
    """
    def __init__(self, instrument_name: str, chunk_size: int = 10000):
        super().__init__(instrument_name)
        self.chunk_size = chunk_size

    async def load(self, file_path: Path) -> Generator[pd.DataFrame, None, None]:
        logger.info("loader.csv.start", path=str(file_path), chunk_size=self.chunk_size)
        
        # Use pandas to stream the data
        try:
            reader = pd.read_csv(
                file_path, 
                chunksize=self.chunk_size,
                parse_dates=['timestamp'] if 'timestamp' in pd.read_csv(file_path, nrows=1).columns else None
            )
            for chunk in reader:
                # Ensure UTC normalization
                if 'timestamp' in chunk.columns:
                    chunk['timestamp'] = pd.to_datetime(chunk['timestamp'], utc=True)
                yield chunk
        except Exception as e:
            logger.error("loader.csv.failed", path=str(file_path), error=str(e))
            raise
