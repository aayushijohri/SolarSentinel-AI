"""
Add model-registered nowcast test to test_services.py to cover lines 71-72 of solar.py.
"""
import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch


def test_solar_nowcast_with_registered_model():
    """Mock model_registry to test lines 71-72 of solar.py."""
    now = datetime.utcnow()
    docs = []
    for i in range(10):
        doc = MagicMock()
        doc.data = {"solexs_flux": 10.0 + i, "hel1os_flux": 5.0 + i}
        doc.timestamp = now - timedelta(minutes=i)
        docs.append(doc)

    mock_model = MagicMock()
    mock_model.predict.return_value = [0.88]
    mock_model.model_id = "lgbm_v2_test"

    with patch("backend.app.services.solar.model_registry") as MockReg:
        MockReg.load_production_model.return_value = mock_model

        from backend.app.services.solar import ForecastingService
        svc = ForecastingService()
        svc.telemetry_repo = AsyncMock()
        svc.telemetry_repo.find_many = AsyncMock(return_value=docs)
        svc.prediction_repo = AsyncMock()

        import asyncio
        result = asyncio.run(svc.generate_nowcast("SoLEXS"))

        assert result.probability == pytest.approx(0.88)
        assert result.model_version == "lgbm_v2_test"
