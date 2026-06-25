from motor.motor_asyncio import AsyncIOMotorClient
from backend.configs.settings import settings
from backend.configs.logging import logger
import asyncio

class MongoDBManager:
    """
    Manages the MongoDB connection lifecycle using Motor.
    Includes connection pooling and health validation.
    """
    client: AsyncIOMotorClient = None
    db = None

    @classmethod
    async def connect(cls):
        """
        Initialize the MongoDB connection.
        """
        if cls.client is not None:
            return

        try:
            logger.info("db.connecting", url=settings.MONGODB_URL.split("@")[-1]) # Hide credentials
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
                maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
                serverSelectionTimeoutMS=settings.MONGODB_TIMEOUT_SECONDS * 1000
            )
            cls.db = cls.client[settings.DATABASE_NAME]
            
            # Basic validation
            await cls.client.admin.command('ping')
            logger.info("db.connected", database=settings.DATABASE_NAME)
        except Exception as e:
            logger.error("db.connection_failed", error=str(e))
            raise

    @classmethod
    async def disconnect(cls):
        """
        Graceful shutdown of the database client.
        """
        if cls.client:
            cls.client.close()
            cls.client = None
            cls.db = None
            logger.info("db.disconnected")

    @classmethod
    def get_db(cls):
        """
        Retrieve the database instance.
        """
        return cls.db

db_manager = MongoDBManager()
