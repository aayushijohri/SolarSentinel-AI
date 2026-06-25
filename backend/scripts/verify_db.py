import asyncio
from backend.app.core.database import db_manager
from backend.app.repositories.internal import TelemetryRepository
from backend.configs.settings import settings

async def verify_db():
    print(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
    try:
        await db_manager.connect()
        print("✅ Connection Successful!")
        
        repo = TelemetryRepository()
        print(f"Checking collection: {repo.collection_name}")
        
        await repo.create_indexes()
        print("✅ Indexes Verified!")
        
        count = await repo.count({})
        print(f"📊 Current telemetry count: {count}")
        
    except Exception as e:
        print(f"❌ Verification Failed: {e}")
    finally:
        await db_manager.disconnect()

if __name__ == "__main__":
    asyncio.run(verify_db())
