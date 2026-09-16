def test_cleaner_bfill_strategy():
    from backend.ml.pipeline.preprocessing.cleaner import TelemetryCleaner
    import pandas as pd, numpy as np, pytest

    now = pd.Timestamp.utcnow().floor("min")
    ts = pd.date_range(now, periods=5, freq="1min", tz="UTC")
    df = pd.DataFrame({"timestamp": ts, "flux": [1.0, np.nan, np.nan, 4.0, 5.0]})
    cleaner = TelemetryCleaner()
    result = cleaner.process(df, strategy="bfill")
    assert result["flux"].iloc[1] == pytest.approx(4.0, abs=0.01)

def test_cleaner_median_strategy():
    from backend.ml.pipeline.preprocessing.cleaner import TelemetryCleaner
    import pandas as pd, numpy as np, pytest

    now = pd.Timestamp.utcnow().floor("min")
    ts = pd.date_range(now, periods=5, freq="1min", tz="UTC")
    df = pd.DataFrame({"timestamp": ts, "flux": [10.0, np.nan, 20.0, 30.0, 40.0]})
    cleaner = TelemetryCleaner()
    result = cleaner.process(df, strategy="median")
    assert result["flux"].iloc[1] == pytest.approx(25.0, abs=0.01)
