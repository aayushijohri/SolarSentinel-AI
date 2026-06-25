from pathlib import Path
from typing import Type
from backend.ml.pipeline.ingestion.base_loader import BaseLoader
from backend.ml.pipeline.ingestion.csv_loader import CSVLoader
from backend.ml.pipeline.ingestion.fits_loader import FITSLoader

class SourceFactory:
    """
    Factory to resolve the appropriate loader based on file extension.
    """
    _loaders = {
        '.csv': CSVLoader,
        '.fits': FITSLoader,
        '.fit': FITSLoader
    }

    @classmethod
    def get_loader(cls, file_path: Path, instrument_name: str) -> BaseLoader:
        ext = file_path.suffix.lower()
        loader_class = cls._loaders.get(ext)
        if not loader_class:
            raise ValueError(f"No loader available for extension: {ext}")
        return loader_class(instrument_name=instrument_name)
