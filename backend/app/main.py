from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.configs.settings import settings
from backend.configs.logging import setup_logging, logger
from backend.app.core.database import db_manager
from backend.app.repositories.internal import TelemetryRepository, PredictionRepository, AlertRepository
from backend.app.api.v1.endpoints import router as api_v1_router
import time

# Initialize Logging
setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend for SolarSentinel AI - ISRO Aditya-L1 Mission.",
    debug=settings.DEBUG
)

app.include_router(api_v1_router, prefix="/api")

import os

# CORS — in production set ALLOWED_ORIGINS env var to your Vercel URL(s).
# e.g. ALLOWED_ORIGINS=https://solarsentinel.vercel.app,https://www.yourdomain.com
_raw_origins = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = (
    [o.strip() for o in _raw_origins.split(",") if o.strip()]
    if _raw_origins
    else ["*"]  # wildcard only when env var is not set (local dev)
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """
    Actions to perform on application startup.
    """
    logger.info("system.startup", project=settings.PROJECT_NAME, version=settings.VERSION)
    
    # Initialize Database
    try:
        await db_manager.connect()
        
        # Create Indexes
        from backend.app.repositories.internal import DatasetRepository
        await DatasetRepository().create_indexes()
        await TelemetryRepository().create_indexes()
        await PredictionRepository().create_indexes()
        await AlertRepository().create_indexes()
        logger.info("database.initialized")
        
        # Seed initial demo datasets if database is empty
        try:
            from backend.app.core.seeding import seed_demo_datasets
            await seed_demo_datasets()
        except Exception as seed_err:
            logger.error("database.seeding_failed", error=str(seed_err))
            
    except Exception as e:
        logger.warning("database.connection_failed", error=str(e), detail="Continuing in degraded mode without persistence.")

@app.on_event("shutdown")
async def shutdown_event():
    """
    Actions to perform on application shutdown.
    """
    await db_manager.disconnect()
    logger.info("system.shutdown")

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Advanced health check including DB connectivity and latency.
    """
    db_status = "offline"
    db_latency = None
    
    if db_manager.client:
        try:
            start_time = time.time()
            server_info = await db_manager.client.server_info()
            db_latency = round((time.time() - start_time) * 1000, 2)
            db_status = "online"
        except Exception:
            db_status = "error"

    return {
        "status": "operational" if db_status == "online" else "degraded",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": {
            "status": db_status,
            "latency_ms": db_latency,
            "version": server_info.get("version") if db_status == "online" else None
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
