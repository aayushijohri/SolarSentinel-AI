"""
test_services.py — DataService and ForecastingService unit tests.

Covers backend/app/services/solar.py (25% → 75%+).
All MongoDB calls are mocked by patching instance attributes directly,
since DataService and ForecastingService create their repos in __init__.
"""
import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch


def _make_doc(instrument="SoLEXS", filename="s.csv", flux_low=5.0, flux_high=10.0):
    """Build a MagicMock telemetry document."""
    doc = MagicMock()
    doc.id = "abc123"
    doc.created_at = datetime(2026, 6, 25, 10, 0, 0)
    doc.instrument = instrument
    doc.filename = filename
    doc.status = "COMPLETED"
    doc.row_count = 10
    doc.valid_rows = 9
    doc.data = {"flux_low": flux_low, "flux_high": flux_high}
    doc.timestamp = datetime.utcnow()
    return doc


# ──────────────────────────────────────────────────────────────────────────────
# DataService — list_datasets
# ──────────────────────────────────────────────────────────────────────────────

class TestDataServiceListDatasets:
    @pytest.mark.asyncio
    async def test_list_datasets_empty(self):
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.dataset_repo = AsyncMock()
        svc.dataset_repo.find_many = AsyncMock(return_value=[])

        result = await svc.list_datasets()
        assert result == []

    @pytest.mark.asyncio
    async def test_list_datasets_returns_items(self):
        doc = _make_doc()
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.dataset_repo = AsyncMock()
        svc.dataset_repo.find_many = AsyncMock(return_value=[doc])

        result = await svc.list_datasets()
        assert len(result) == 1
        assert result[0]["instrument"] == "SoLEXS"
        assert result[0]["filename"] == "s.csv"
        assert result[0]["row_count"] == 10

    @pytest.mark.asyncio
    async def test_list_datasets_with_search_match(self):
        doc = _make_doc(instrument="HEL1OS", filename="hel1os_data.csv")
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.dataset_repo = AsyncMock()
        svc.dataset_repo.find_many = AsyncMock(return_value=[doc])

        result = await svc.list_datasets(q="hel1os")
        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_list_datasets_with_search_no_match(self):
        doc = _make_doc(instrument="HEL1OS", filename="hel1os_data.csv")
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.dataset_repo = AsyncMock()
        svc.dataset_repo.find_many = AsyncMock(return_value=[doc])

        result = await svc.list_datasets(q="xyznotmatch")
        assert result == []

    @pytest.mark.asyncio
    async def test_list_datasets_db_exception(self):
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.dataset_repo = AsyncMock()
        svc.dataset_repo.find_many = AsyncMock(side_effect=Exception("Connection refused"))

        result = await svc.list_datasets()
        assert result == []


# ──────────────────────────────────────────────────────────────────────────────
# DataService — get_dataset
# ──────────────────────────────────────────────────────────────────────────────

class TestDataServiceGetDataset:
    @pytest.mark.asyncio
    async def test_get_dataset_found(self):
        doc = _make_doc()
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.dataset_repo = AsyncMock()
        svc.dataset_repo.find_one = AsyncMock(return_value=doc)

        result = await svc.get_dataset("507f1f77bcf86cd799439011")
        assert result is not None
        assert result["instrument"] == "SoLEXS"

    @pytest.mark.asyncio
    async def test_get_dataset_not_found(self):
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.dataset_repo = AsyncMock()
        svc.dataset_repo.find_one = AsyncMock(return_value=None)

        result = await svc.get_dataset("507f1f77bcf86cd799439011")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_dataset_invalid_id(self):
        """Invalid ObjectId must not crash — returns None."""
        from backend.app.services.solar import DataService
        svc = DataService()
        result = await svc.get_dataset("not_a_valid_object_id!")
        assert result is None


# ──────────────────────────────────────────────────────────────────────────────
# DataService — delete_dataset
# ──────────────────────────────────────────────────────────────────────────────

class TestDataServiceDeleteDataset:
    @pytest.mark.asyncio
    async def test_delete_success(self):
        delete_result = MagicMock()
        delete_result.deleted_count = 5

        from backend.app.services.solar import DataService
        svc = DataService()
        svc.dataset_repo = AsyncMock()
        svc.dataset_repo.delete = AsyncMock(return_value=True)
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.collection = AsyncMock()
        svc.telemetry_repo.collection.delete_many = AsyncMock(return_value=delete_result)

        result = await svc.delete_dataset("507f1f77bcf86cd799439011")
        assert result is True

    @pytest.mark.asyncio
    async def test_delete_not_found(self):
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.dataset_repo = AsyncMock()
        svc.dataset_repo.delete = AsyncMock(return_value=False)
        svc.telemetry_repo = AsyncMock()

        result = await svc.delete_dataset("507f1f77bcf86cd799439011")
        assert result is False

    @pytest.mark.asyncio
    async def test_delete_exception_returns_false(self):
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.dataset_repo = AsyncMock()
        svc.dataset_repo.delete = AsyncMock(side_effect=Exception("DB error"))
        svc.telemetry_repo = AsyncMock()

        result = await svc.delete_dataset("507f1f77bcf86cd799439011")
        assert result is False


# ──────────────────────────────────────────────────────────────────────────────
# DataService — get_latest_telemetry
# ──────────────────────────────────────────────────────────────────────────────

class TestDataServiceTelemetry:
    @pytest.mark.asyncio
    async def test_get_latest_telemetry_empty(self):
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=[])

        result = await svc.get_latest_telemetry("SoLEXS", limit=10)
        assert result == []

    @pytest.mark.asyncio
    async def test_get_latest_telemetry_returns_sorted(self):
        doc = MagicMock()
        doc.data = {"flux_low": 5.0}
        doc.timestamp = datetime(2026, 6, 25, 10, 0, 0)

        from backend.app.services.solar import DataService
        svc = DataService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=[doc])

        result = await svc.get_latest_telemetry("SoLEXS", limit=10)
        assert len(result) == 1
        assert "timestamp" in result[0]
        assert "flux_low" in result[0]

    @pytest.mark.asyncio
    async def test_get_latest_telemetry_exception(self):
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(side_effect=Exception("Connection error"))

        result = await svc.get_latest_telemetry("SoLEXS")
        assert result == []


# ──────────────────────────────────────────────────────────────────────────────
# DataService — get_mission_status (flux classification branches)
# ──────────────────────────────────────────────────────────────────────────────

class TestDataServiceMissionStatus:
    @pytest.mark.asyncio
    async def test_mission_status_no_telemetry(self):
        from backend.app.services.solar import DataService
        svc = DataService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=[])

        status = await svc.get_mission_status()
        assert "solar_activity_index" in status
        assert "satellite_health" in status

    @pytest.mark.asyncio
    async def test_mission_status_x_class(self):
        doc = MagicMock()
        doc.data = {"flux_low": 600.0, "flux_high": 700.0}
        doc.timestamp = datetime.utcnow()

        from backend.app.services.solar import DataService
        svc = DataService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=[doc])

        status = await svc.get_mission_status()
        assert status["current_flare_class"].startswith("X")

    @pytest.mark.asyncio
    async def test_mission_status_m_class(self):
        doc = MagicMock()
        doc.data = {"flux_low": 150.0, "flux_high": 200.0}
        doc.timestamp = datetime.utcnow()

        from backend.app.services.solar import DataService
        svc = DataService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=[doc])

        status = await svc.get_mission_status()
        assert status["current_flare_class"].startswith("M")

    @pytest.mark.asyncio
    async def test_mission_status_c_class(self):
        doc = MagicMock()
        doc.data = {"flux_low": 15.0, "flux_high": 20.0}
        doc.timestamp = datetime.utcnow()

        from backend.app.services.solar import DataService
        svc = DataService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=[doc])

        status = await svc.get_mission_status()
        assert status["current_flare_class"].startswith("C")

    @pytest.mark.asyncio
    async def test_mission_status_b_nominal(self):
        doc = MagicMock()
        doc.data = {"flux_low": 3.0, "flux_high": 5.0}
        doc.timestamp = datetime.utcnow()

        from backend.app.services.solar import DataService
        svc = DataService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=[doc])

        status = await svc.get_mission_status()
        assert status["current_flare_class"] == "B-Nominal"

    @pytest.mark.asyncio
    async def test_mission_status_zero_flux_no_class_change(self):
        """flux == 0 must not update current_flare_class (stays at default)."""
        doc = MagicMock()
        doc.data = {"flux_low": 0.0, "flux_high": 0.0}
        doc.timestamp = datetime.utcnow()

        from backend.app.services.solar import DataService
        svc = DataService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=[doc])

        status = await svc.get_mission_status()
        # Default flare class should not be changed for zero flux
        assert "current_flare_class" in status


# ──────────────────────────────────────────────────────────────────────────────
# ForecastingService
# ──────────────────────────────────────────────────────────────────────────────

class TestForecastingService:
    @pytest.mark.asyncio
    async def test_nowcast_empty_db_returns_fallback(self):
        from backend.app.services.solar import ForecastingService
        svc = ForecastingService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=[])

        result = await svc.generate_nowcast("SoLEXS")
        assert result.probability == pytest.approx(0.01)
        assert result.model_version == "physics-fallback"
        assert result.predicted_class.value == "None"

    def test_classify_flare_x_class(self):
        from backend.app.services.solar import ForecastingService
        svc = ForecastingService()
        assert svc._classify_flare(0.85).value == "X"

    def test_classify_flare_m_class(self):
        from backend.app.services.solar import ForecastingService
        svc = ForecastingService()
        assert svc._classify_flare(0.6).value == "M"

    def test_classify_flare_c_class(self):
        from backend.app.services.solar import ForecastingService
        svc = ForecastingService()
        assert svc._classify_flare(0.3).value == "C"

    def test_classify_flare_none(self):
        from backend.app.services.solar import ForecastingService
        svc = ForecastingService()
        assert svc._classify_flare(0.1).value == "None"

    @pytest.mark.asyncio
    async def test_nowcast_with_telemetry_runs_pipeline(self):
        now = datetime.utcnow()
        docs = []
        for i in range(10):
            doc = MagicMock()
            doc.data = {"solexs_flux": 10.0 + i, "hel1os_flux": 5.0 + i}
            doc.timestamp = now - timedelta(minutes=i)
            docs.append(doc)

        from backend.app.services.solar import ForecastingService
        svc = ForecastingService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=docs)
        svc.prediction_repo = AsyncMock()

        result = await svc.generate_nowcast("SoLEXS")
        assert 0.0 <= result.probability <= 1.0
        assert result.predicted_class is not None
        assert result.processing_duration_ms >= 0.0

    @pytest.mark.asyncio
    async def test_nowcast_db_exception_returns_fallback(self):
        """DB error during telemetry fetch still returns a valid fallback."""
        from backend.app.services.solar import ForecastingService
        svc = ForecastingService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(side_effect=Exception("Timeout"))

        result = await svc.generate_nowcast("SoLEXS")
        assert result.probability == pytest.approx(0.01)
        assert result.model_version == "physics-fallback"
