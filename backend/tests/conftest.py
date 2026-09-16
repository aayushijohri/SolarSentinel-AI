"""
conftest.py — Shared pytest configuration for SolarSentinel AI backend tests.

Sets asyncio_mode="auto" so every async test function is automatically
treated as a coroutine without requiring the @pytest.mark.asyncio decorator
on each one. Also provides a reusable event loop fixture.
"""
import asyncio
import pytest


# Tell pytest-asyncio to auto-detect and run all async test functions
def pytest_configure(config):
    config.addinivalue_line(
        "markers", "asyncio: mark test as async (handled by pytest-asyncio)"
    )


@pytest.fixture(scope="session")
def event_loop_policy():
    return asyncio.DefaultEventLoopPolicy()
