"""
Mission and Heliophysics constants for SolarSentinel AI.
Reference: ISRO Aditya-L1 Mission Specifications.
"""
from enum import Enum

class SolarFlareClass(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    M = "M"
    X = "X"
    NONE = "None"

class Instrument(str, Enum):
    SOLEXS = "SoLEXS"
    HEL1OS = "HEL1OS"
    MAG = "MAG"
    ASPEX = "ASPEX"
    PAPA = "PAPA"
    SUIT = "SUIT"
    VELC = "VELC"

# Physical Constants
SPEED_OF_LIGHT = 299792458  # m/s
AU = 1.496e11  # km (Astronomical Unit)

# Aditya-L1 Specifics
L1_DISTANCE_KM = 1.5e6  # Lagrangian point 1 distance from Earth
TELEMETRY_LATENCY_MS = 5000  # Expected avg latency

# Energy Bins for SoLEXS (Example placeholder ranges in keV)
SOLEXS_ENERGY_RANGES = {
    "low": (1.0, 3.0),
    "mid": (3.0, 8.0),
    "high": (8.0, 22.0)
}
