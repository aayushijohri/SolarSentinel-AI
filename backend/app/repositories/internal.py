from backend.app.repositories.base import BaseRepository
from backend.app.schemas.base import Telemetry, Prediction, Alert, Dataset
from backend.configs.logging import logger

class DatasetRepository(BaseRepository[Dataset]):
    def __init__(self, collection_name: str = "datasets"):
        super().__init__(collection_name, Dataset)

    async def create_indexes(self):
        await self.collection.create_index([("created_at", -1)])
        logger.info("db.indexes.created", collection=self.collection_name)

class TelemetryRepository(BaseRepository[Telemetry]):
    def __init__(self, collection_name: str = "raw_telemetry"):
        super().__init__(collection_name, Telemetry)

    async def create_indexes(self):
        """
        Create indexes for telemetry queries.
        - instrument + timestamp: Primary query pattern for dashboard charts.
        """
        await self.collection.create_index([("instrument", 1), ("timestamp", -1)])
        logger.info("db.indexes.created", collection=self.collection_name)

class PredictionRepository(BaseRepository[Prediction]):
    def __init__(self):
        super().__init__("predictions", Prediction)

    async def create_indexes(self):
        """
        Create indexes for prediction retrieval.
        - prediction_time: For history lookups.
        - flare_class: For filtering by severity.
        """
        await self.collection.create_index([("prediction_time", -1)])
        await self.collection.create_index([("flare_class", 1)])
        logger.info("db.indexes.created", collection=self.collection_name)

class AlertRepository(BaseRepository[Alert]):
    def __init__(self):
        super().__init__("alerts", Alert)

    async def create_indexes(self):
        await self.collection.create_index([("timestamp", -1)])
        await self.collection.create_index([("severity", 1)])
        logger.info("db.indexes.created", collection=self.collection_name)

# Model & Experiment Repositories (Placeholders for schemas that will be refined in ML Module)
class ModelRepository(BaseRepository):
    def __init__(self):
        super().__init__("models", None) # Schema will be defined in ML Module

class ExperimentRepository(BaseRepository):
    def __init__(self):
        super().__init__("experiments", None)
