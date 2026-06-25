from typing import Generic, TypeVar, Type, List, Optional, Any, Union
from motor.motor_asyncio import AsyncIOMotorCollection
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId
from backend.app.core.database import db_manager

T = TypeVar("T", bound=BaseModel)

class BaseRepository(Generic[T]):
    """
    Generic Asynchronous Repository for MongoDB.
    """
    def __init__(self, collection_name: str, model_type: Type[T]):
        self.collection_name = collection_name
        self.model_type = model_type

    @property
    def collection(self) -> AsyncIOMotorCollection:
        return db_manager.db[self.collection_name]

    async def create(self, item: T) -> T:
        """
        Insert a single document.
        """
        data = item.model_dump(by_alias=True, exclude={"id"})
        result = await self.collection.insert_one(data)
        item.id = result.inserted_id
        return item

    async def bulk_create(self, items: List[T]) -> List[T]:
        """
        Insert multiple documents.
        """
        docs = [item.model_dump(by_alias=True, exclude={"id"}) for item in items]
        result = await self.collection.insert_many(docs)
        for i, inserted_id in enumerate(result.inserted_ids):
            items[i].id = inserted_id
        return items

    async def find_one(self, query: dict) -> Optional[T]:
        """
        Find a single document by query.
        """
        doc = await self.collection.find_one(query)
        return self.model_type(**doc) if doc else None

    async def find_many(self, query: dict, limit: int = 100, skip: int = 0, sort: Optional[List[tuple]] = None) -> List[T]:
        """
        Find multiple documents with pagination and sorting.
        """
        cursor = self.collection.find(query).skip(skip).limit(limit)
        if sort:
            cursor = cursor.sort(sort)
        docs = await cursor.to_list(length=limit)
        return [self.model_type(**doc) for doc in docs]

    async def update(self, item_id: Union[str, ObjectId], updates: dict) -> bool:
        """
        Update a document by identifier.
        """
        if isinstance(item_id, str):
            item_id = ObjectId(item_id)
        
        updates["updated_at"] = datetime.utcnow()
        result = await self.collection.update_one({"_id": item_id}, {"$set": updates})
        return result.modified_count > 0

    async def delete(self, item_id: Union[str, ObjectId]) -> bool:
        """
        Delete a document by identifier.
        """
        if isinstance(item_id, str):
            item_id = ObjectId(item_id)
        result = await self.collection.delete_one({"_id": item_id})
        return result.deleted_count > 0

    async def count(self, query: dict) -> int:
        """
        Count documents matching the query.
        """
        return await self.collection.count_documents(query)

    async def exists(self, query: dict) -> bool:
        """
        Check if any document matches the query.
        """
        count = await self.count(query)
        return count > 0
