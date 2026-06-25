from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    """
    Global system settings for SolarSentinel AI.
    Validated via Pydantic.
    """
    # Base Configuration
    PROJECT_NAME: str = "SolarSentinel AI"
    ENVIRONMENT: str = "production"
    DEBUG: bool = False
    VERSION: str = "1.0.0"

    # API Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Model Registry Configuration
    MODEL_TYPE: str = "lightgbm" # default active model type
    MODEL_ID: str = "lgbm_solar_v1"
    
    # Database Configuration
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "solar_sentinel"
    MONGODB_MIN_POOL_SIZE: int = 10
    MONGODB_MAX_POOL_SIZE: int = 100
    MONGODB_TIMEOUT_SECONDS: int = 10
    
    # Preprocessing Configuration
    MISSING_DATA_STRATEGY: str = "interpolate" # Options: ffill, bfill, interpolate, median
    RESAMPLE_CADENCE: str = "1min" # Pandas offset alias (e.g., 10s, 1min, 5min)
    OUTLIER_METHOD: str = "zscore" # Options: zscore, iqr, rolling
    OUTLIER_THRESHOLD: float = 3.0
    
    # Denoising Configuration
    DENOISING_METHOD: str = "gaussian" # Options: rolling_mean, rolling_median, savgol, gaussian
    SMOOTHING_WINDOW: int = 5
    
    # Synchronization Configuration
    SYNC_STRATEGY: str = "nearest" # Options: nearest, linear, outer
    SYNC_TOLERANCE_SECONDS: float = 30.0
    
    # Feature Engineering
    FEATURE_ROLLING_WINDOWS: list[int] = [1, 5, 10, 15, 30, 60] # In minutes
    FEATURE_LAGS: list[int] = [1, 2, 3, 5, 10, 30, 60]
    FEATURE_SELECTION_ENABLED: bool = True
    VARIANCE_THRESHOLD: float = 0.01
    CORRELATION_THRESHOLD: float = 0.95
    
    # Windowing & SLiding Windows
    WINDOW_LENGTH_MIN: int = 60
    STRIDE_MIN: int = 5
    FORECAST_HORIZON_MIN: int = 30
    
    # Model Hyperparameters (Defaults)
    LGBM_PARAMS: dict = {
        "n_estimators": 1000,
        "learning_rate": 0.05,
        "num_leaves": 31,
        "objective": "binary",
        "n_jobs": -1
    }
    
    LSTM_PARAMS: dict = {
        "hidden_size": 64,
        "num_layers": 2,
        "dropout": 0.2,
        "batch_size": 32,
        "epochs": 10
    }
    
    # Benchmarking & Selection
    BENCHMARK_WEIGHTS: dict = {
        "f1_score": 0.5,
        "precision": 0.2,
        "latency": 0.2,
        "memory": 0.1
    }
    
    RANDOM_SEED: int = 42
    
    # Path Configuration
    DATA_DIR: Path = BASE_DIR / "data"
    ARTIFACTS_DIR: Path = BASE_DIR / "artifacts"
    LOG_DIR: Path = BASE_DIR / "logs"

    # Physics Constants (Defaults)
    SOLEXS_THRESHOLD: float = 100.0  # Placeholder threshold for nowcasting
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
