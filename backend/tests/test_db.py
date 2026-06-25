import pytest
import asyncio
from datetime import datetime
from backend.app.core.database import db_manager
from backend.app.repositories.internal import TelemetryRepository
from backend.app.schemas.base import Telemetry
from backend.configs.settings import settings

@pytest.mark.asyncio
async def test_mongodb_connection():
    """
    Test MongoDB connectivity and lifecycle.
    """
    await db_manager.connect()
    assert db_manager.client is not None
    
    server_info = await db_manager.client.server_info()
    assert "version" in server_info
    
    await db_manager.disconnect()
    assert db_manager.client is None

@pytest.mark.asyncio
async def test_telemetry_repository_crud():
    """
    Test basic CRUD operations on TelemetryRepository.
    """
    await db_manager.connect()
    repo = TelemetryRepository(collection_name="test_telemetry")
    
    # Clean up before test
    await repo.collection.delete_many({})
    
    # 1. Create
    telemetry_data = Telemetry(
        instrument="SoLEXS",
        timestamp=datetime.utcnow(),
        data={"flux_low": 0.5, "flux_high": 1.2},
        version="1.0"
    )
    
    created = await repo.create(telemetry_data)
    assert created.id is not None
    
    # 2. Read
    found = await repo.find_one({"_id": created.id})
    assert found is not None
    assert found.instrument == "SoLEXS"
    
    # 3. Update
    updated = await repo.update(created.id, {"version": "1.1"})
    assert updated is True
    
    verify_update = await repo.find_one({"_id": created.id})
    assert verify_update.version == "1.1"
    
    # 4. Delete
    deleted = await repo.delete(created.id)
    assert deleted is True
    
    # Clean up
    await repo.collection.drop()
    await db_manager.disconnect()
