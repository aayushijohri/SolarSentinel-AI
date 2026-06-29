import pandas as pd
import numpy as np
from backend.ml.pipeline.engineering.base_engineer import BaseFeatureEngineer

class PhysicsEngineer(BaseFeatureEngineer):
    """
    Derives solar-physics specific metrics from multi-instrument telemetry.
    """
    def engineer(self, df: pd.DataFrame) -> pd.DataFrame:
        # 1. SXR/HXR Ratio (Soft/Hard X-ray Ratio)
        # Note: Using prefix names from the synchronizer output
        solexs_flux = [c for c in df.columns if 'solexs' in c and 'flux' in c and 'is_outlier' not in c]
        hel1os_flux = [c for c in df.columns if 'hel1os' in c and 'flux' in c and 'is_outlier' not in c]

        new_cols: dict = {}

        if solexs_flux and hel1os_flux:
            # Aggregate total fluxes for the ratio
            total_sxr = df[solexs_flux].sum(axis=1)
            total_hxr = df[hel1os_flux].sum(axis=1)

            # Ratio is a primary indicator of thermal vs non-thermal phases
            new_cols["physics_sxr_hxr_ratio"]    = total_sxr / (total_hxr + 1e-9)
            new_cols["physics_flux_difference"]   = total_sxr - total_hxr

        # 2. Flux Gradients
        for col in solexs_flux + hel1os_flux:
            # Gradient captures the steepness of the flare rise
            new_cols[f"physics_{col}_gradient"]   = np.gradient(df[col].fillna(0))

        # 3. Volatility (Scientific Proxy for flare instability)
        for col in solexs_flux + hel1os_flux:
            roll = df[col].rolling(window=10)
            new_cols[f"physics_{col}_volatility"] = roll.std() / (roll.mean() + 1e-9)

        # 4. Instrument Agreement
        if len(solexs_flux) > 0 and len(hel1os_flux) > 0:
            new_cols["physics_instrument_agreement"] = df[solexs_flux[0]].corr(df[hel1os_flux[0]])
            new_cols["physics_rolling_correlation"]  = (
                df[solexs_flux[0]].rolling(window=20).corr(df[hel1os_flux[0]])
            )

        # Single concat — avoids repeated fragmentation from per-column assignment
        return pd.concat([df, pd.DataFrame(new_cols, index=df.index)], axis=1)
