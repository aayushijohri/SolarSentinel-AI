import random
from datetime import datetime, timedelta
from typing import List
from backend.app.repositories.internal import DatasetRepository, TelemetryRepository
from backend.app.schemas.base import Dataset, Telemetry
from backend.configs.logging import logger

async def seed_demo_datasets():
    dataset_repo = DatasetRepository()
    telemetry_repo = TelemetryRepository()

    # Check if DB is already seeded, check if any dataset exists
    try:
        count = await dataset_repo.count({})
        if count > 0:
            logger.info("database.seeding", status="skipped", reason="datasets already exist")
            return
    except Exception as e:
        logger.error("database.seeding_check_failed", error=str(e))
        return

    logger.info("database.seeding", status="starting")

    # Define the 3 original demo datasets
    demo_datasets_definitions = [
        {
            "filename": "solexs_l1_20260624_v2.csv",
            "instrument": "SoLEXS",
            "created_at": datetime.strptime("2026-06-25 09:00:00", "%Y-%m-%d %H:%M:%S"),
        },
        {
            "filename": "hel1os_l1_20260625.csv",
            "instrument": "HEL1OS",
            "created_at": datetime.strptime("2026-06-25 09:30:00", "%Y-%m-%d %H:%M:%S"),
        },
        {
            "filename": "solexs_l1_20260625.csv",
            "instrument": "SoLEXS",
            "created_at": datetime.strptime("2026-06-25 10:00:00", "%Y-%m-%d %H:%M:%S"),
        }
    ]

    for seed_info in demo_datasets_definitions:
        filename = seed_info["filename"]
        instrument = seed_info["instrument"]
        created_at = seed_info["created_at"]

        # Create dataset object
        dataset_obj = Dataset(
            filename=filename,
            instrument=instrument,
            row_count=24,
            valid_rows=24,
            status="COMPLETED",
            created_at=created_at,
            updated_at=created_at
        )

        try:
            # Save dataset to get an ID
            await dataset_repo.create(dataset_obj)
            dataset_id = str(dataset_obj.id)
            logger.info("database.seeded_dataset", filename=filename, id=dataset_id)

            # Generate and seed corresponding telemetry data points
            telemetry_objects = []
            base_time = created_at
            for i in range(24):
                ts = base_time - timedelta(minutes=i * 5)
                # Introduce some realistic spikes
                peak = 12.0 * random.random() if i % 6 == 0 else 3.0 * random.random()
                
                if instrument == "SoLEXS":
                    data = {
                        "flux_low": round(5.0 + peak + 2 * random.random(), 2),
                        "flux_high": round(15.0 + peak * 2.0 + 5 * random.random(), 2),
                        "solexs_flux": round(5.0 + peak + 2 * random.random(), 2)
                    }
                else:  # HEL1OS
                    data = {
                        "flux_low": round(2.0 + peak * 0.5 + random.random(), 2),
                        "flux_high": round(8.0 + peak * 1.5 + 3 * random.random(), 2),
                        "hel1os_hard_flux": round(8.0 + peak * 1.5 + 3 * random.random(), 2),
                        "hel1os_soft_flux": round(2.0 + peak * 0.5 + random.random(), 2)
                    }

                telemetry = Telemetry(
                    instrument=instrument,
                    timestamp=ts,
                    data=data,
                    version="1.0",
                    dataset_id=dataset_id,
                    created_at=ts,
                    updated_at=ts
                )
                telemetry_objects.append(telemetry)

            await telemetry_repo.bulk_create(telemetry_objects)
            logger.info("database.seeded_telemetry", count=len(telemetry_objects), for_dataset=filename)

        except Exception as e:
            logger.error("database.seeding_failed", filename=filename, error=str(e))

    logger.info("database.seeding", status="completed")
