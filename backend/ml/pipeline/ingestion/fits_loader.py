import pandas as pd
from pathlib import Path
from typing import Generator
from backend.ml.pipeline.ingestion.base_loader import BaseLoader
from backend.configs.logging import logger

try:
    from astropy.io import fits
except ImportError:
    fits = None

class FITSLoader(BaseLoader):
    """
    Scientific loader for Level-1 FITS binary tables.
    Standard for Aditya-L1 archival data.
    """
    def __init__(self, instrument_name: str):
        super().__init__(instrument_name)

    async def load(self, file_path: Path) -> Generator[pd.DataFrame, None, None]:
        if not fits:
            raise ImportError("astropy is required for FITS loading")

        logger.info("loader.fits.start", path=str(file_path))
        
        try:
            with fits.open(file_path) as hdul:
                # Typically data is in the first extension for Level-1
                data = hdul[1].data
                df = pd.DataFrame(data)
                
                # FITS-specific time handling (MJD conversion if necessary)
                # For this implementation, we assume a standard timestamp column exists or is mapped
                if 'timestamp' in df.columns:
                    df['timestamp'] = pd.to_datetime(df['timestamp'], utc=True)
                
                yield df
        except Exception as e:
            logger.error("loader.fits.failed", path=str(file_path), error=str(e))
            raise
