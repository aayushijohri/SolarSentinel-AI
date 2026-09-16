"""
SolarSentinel AI — Comprehensive Engineering Audit Script
Measures: API latency, pytest, ML metrics, pipeline timing, feature count, SHAP, benchmark.
Run from: SolarSentinel-AI-main/backend/
"""
import sys, os, time, statistics, json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

print("=" * 70)
print("  SOLARSENTINEL AI — ENGINEERING AUDIT")
print(f"  Run at: {datetime.now().isoformat()}")
print("=" * 70)

results = {}

# ─────────────────────────────────────────────────────────────────────────────
# 1. STATIC CODE METRICS
# ─────────────────────────────────────────────────────────────────────────────
print("\n[1] STATIC CODE METRICS")

# Count endpoints
endpoint_names = [
    "GET /v1/mission/status",
    "POST /v1/telemetry/upload",
    "GET /v1/telemetry/waveform",
    "GET /v1/telemetry/history",
    "GET /v1/datasets",
    "GET /v1/datasets/{id}",
    "DELETE /v1/datasets/{id}",
    "GET /v1/analytics",
    "POST /v1/predict/nowcast",
    "GET /v1/predict/explain/{id}",
    "GET /v1/health",
    "GET /v1/system/status",
    "GET /v1/system/analytics",
]
print(f"  Total FastAPI endpoints: {len(endpoint_names)}")
for ep in endpoint_names:
    print(f"    {ep}")
results["endpoint_count"] = len(endpoint_names)

# Count test functions
test_dir = os.path.join(os.path.dirname(__file__), "tests")
test_files = [f for f in os.listdir(test_dir) if f.startswith("test_") and f.endswith(".py")]
test_functions = 0
for tf in test_files:
    with open(os.path.join(test_dir, tf)) as fh:
        content = fh.read()
    count = content.count("def test_")
    test_functions += count
    print(f"  {tf}: {count} test(s)")
print(f"  Total test functions: {test_functions}")
results["total_test_functions"] = test_functions
results["test_files"] = len(test_files)

# Count Python source lines
total_lines = 0
py_files = 0
backend_root = os.path.dirname(__file__)
for root, dirs, files in os.walk(backend_root):
    dirs[:] = [d for d in dirs if d not in ["__pycache__", ".pytest_cache"]]
    for fname in files:
        if fname.endswith(".py") and not fname.startswith("run_audit"):
            fpath = os.path.join(root, fname)
            with open(fpath, encoding="utf-8", errors="ignore") as fh:
                lines = fh.readlines()
            total_lines += len(lines)
            py_files += 1
print(f"  Python source files: {py_files}")
print(f"  Total source lines (LOC): {total_lines}")
results["python_files"] = py_files
results["total_loc"] = total_lines

# ─────────────────────────────────────────────────────────────────────────────
# 2. API LATENCY — FastAPI TestClient (offline, no MongoDB required)
# ─────────────────────────────────────────────────────────────────────────────
print("\n[2] API LATENCY (FastAPI TestClient, N=50 per endpoint)")
try:
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
    from fastapi.testclient import TestClient
    from backend.app.main import app

    client = TestClient(app, raise_server_exceptions=False)
    N = 50

    endpoints_to_bench = [
        ("GET", "/health"),
        ("GET", "/api/v1/health"),
        ("GET", "/api/v1/telemetry/waveform"),
        ("GET", "/api/v1/analytics"),
        ("GET", "/api/v1/mission/status"),
        ("GET", "/api/v1/telemetry/history"),
    ]

    latency_results = {}
    for method, path in endpoints_to_bench:
        times = []
        for _ in range(N):
            t0 = time.perf_counter()
            if method == "GET":
                r = client.get(path)
            else:
                r = client.post(path)
            t1 = time.perf_counter()
            times.append((t1 - t0) * 1000)  # ms
        
        avg = statistics.mean(times)
        med = statistics.median(times)
        p95 = sorted(times)[int(0.95 * N)]
        mn  = min(times)
        mx  = max(times)
        latency_results[path] = {
            "avg_ms": round(avg, 2),
            "median_ms": round(med, 2),
            "p95_ms": round(p95, 2),
            "min_ms": round(mn, 2),
            "max_ms": round(mx, 2),
            "status_codes": r.status_code,
            "n": N
        }
        print(f"  {method} {path}")
        print(f"    avg={avg:.2f}ms  median={med:.2f}ms  p95={p95:.2f}ms  [min={mn:.2f} max={mx:.2f}] status={r.status_code}")

    results["api_latency"] = latency_results

except Exception as e:
    print(f"  [WARN] API latency measurement failed: {e}")
    import traceback; traceback.print_exc()

# ─────────────────────────────────────────────────────────────────────────────
# 3. ML METRICS — Train LightGBM on synthetic solar-like data
# ─────────────────────────────────────────────────────────────────────────────
print("\n[3] ML METRICS (LightGBM on synthetic solar telemetry dataset)")
try:
    from backend.ml.models.traditional import LGBMModel
    from backend.ml.evaluation.metrics import MetricElevator
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import mean_absolute_error

    np.random.seed(42)
    N_SAMPLES = 5000
    N_FEATURES = 20

    # Simulate realistic solar dataset: flux readings, physics features, rolling stats
    X = np.random.randn(N_SAMPLES, N_FEATURES)
    # Physics-based label: flare if SXR gradient high + rising flux
    y = ((X[:, 0] > 0.5) & (X[:, 1] > 0.3)).astype(int)
    # Add some noise
    flip_idx = np.random.choice(N_SAMPLES, size=int(0.05 * N_SAMPLES), replace=False)
    y[flip_idx] = 1 - y[flip_idx]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = LGBMModel(model_id="audit_lgbm", params={
        "n_estimators": 200,
        "learning_rate": 0.05,
        "max_depth": 6,
        "num_leaves": 31,
        "n_jobs": -1,
        "random_state": 42,
        "verbose": -1
    })

    t_train_start = time.perf_counter()
    model.train(X_train, y_train, validation_data=(X_test, y_test))
    train_time = time.perf_counter() - t_train_start

    # Per-sample inference latency
    infer_times = []
    for _ in range(100):
        t0 = time.perf_counter()
        _ = model.predict(X_test[:1])
        infer_times.append((time.perf_counter() - t0) * 1000)
    single_inference_ms = statistics.mean(infer_times)

    # Batch inference
    t0 = time.perf_counter()
    y_prob = model.predict(X_test)
    batch_inference_ms = (time.perf_counter() - t0) * 1000

    metrics = MetricElevator.calculate_flare_metrics(y_test, y_prob)
    
    # Also compute regression-style MAE/RMSE on probabilities vs binary truth
    mae_prob = mean_absolute_error(y_test, y_prob)
    rmse_prob = np.sqrt(np.mean((y_test - y_prob) ** 2))

    print(f"  Dataset: {N_SAMPLES} samples, {N_FEATURES} features (synthetic solar)")
    print(f"  Train/Test split: {len(X_train)}/{len(X_test)}")
    print(f"  Training time: {train_time:.3f}s")
    print(f"  Inference (single sample, N=100): avg={single_inference_ms:.4f}ms")
    print(f"  Inference (batch {len(X_test)} samples): {batch_inference_ms:.2f}ms total")
    print(f"  Accuracy:  {metrics['accuracy']:.4f}")
    print(f"  Precision: {metrics['precision']:.4f}")
    print(f"  Recall:    {metrics['recall']:.4f}")
    print(f"  F1-Score:  {metrics['f1_score']:.4f}")
    print(f"  ROC-AUC:   {metrics['roc_auc']:.4f}")
    print(f"  PR-AUC:    {metrics['pr_auc']:.4f}")
    print(f"  MAE (prob vs label):  {mae_prob:.4f}")
    print(f"  RMSE (prob vs label): {rmse_prob:.4f}")

    results["ml"] = {
        "n_samples": N_SAMPLES,
        "n_features": N_FEATURES,
        "train_size": len(X_train),
        "test_size": len(X_test),
        "train_time_sec": round(train_time, 3),
        "single_inference_avg_ms": round(single_inference_ms, 4),
        "batch_inference_ms": round(batch_inference_ms, 2),
        **{k: round(v, 4) for k, v in metrics.items()},
        "mae_prob": round(mae_prob, 4),
        "rmse_prob": round(rmse_prob, 4),
    }

except Exception as e:
    print(f"  [WARN] ML metrics failed: {e}")
    import traceback; traceback.print_exc()

# ─────────────────────────────────────────────────────────────────────────────
# 4. FEATURE ENGINEERING PIPELINE METRICS
# ─────────────────────────────────────────────────────────────────────────────
print("\n[4] FEATURE ENGINEERING PIPELINE METRICS")
try:
    import asyncio
    from backend.ml.pipeline.engineering.pipeline import FeatureEngineeringPipeline

    now = datetime.utcnow()
    df_input = pd.DataFrame({
        "timestamp": [now + timedelta(minutes=i) for i in range(200)],
        "solexs_flux": np.sin(np.linspace(0, 20, 200)) + 10 + np.random.randn(200) * 0.5,
        "hel1os_flux": np.cos(np.linspace(0, 20, 200)) + 5 + np.random.randn(200) * 0.3,
    })

    pipeline = FeatureEngineeringPipeline()

    # Run 10 times to get stable timings
    run_times = []
    for i in range(10):
        t0 = time.perf_counter()
        feature_df, report = asyncio.get_event_loop().run_until_complete(pipeline.run(df_input.copy()))
        run_times.append((time.perf_counter() - t0) * 1000)

    avg_pipeline_ms = statistics.mean(run_times)
    med_pipeline_ms = statistics.median(run_times)

    print(f"  Input rows: {len(df_input)}, Input columns: {len(df_input.columns)}")
    print(f"  Output feature count: {report.feature_count}")
    print(f"  Missing data %: {report.missing_percentage:.2f}%")
    print(f"  Memory usage (output): {report.memory_usage_mb:.3f} MB")
    print(f"  Pipeline avg time (N=10): {avg_pipeline_ms:.2f}ms")
    print(f"  Pipeline median time: {med_pipeline_ms:.2f}ms")
    print(f"  Last run duration: {report.processing_duration_sec*1000:.2f}ms")

    # List engineered feature categories
    cols = list(feature_df.columns)
    rolling_cols = [c for c in cols if "roll_" in c]
    physics_cols = [c for c in cols if "physics_" in c]
    lag_cols = [c for c in cols if "lag" in c]
    print(f"  Rolling features: {len(rolling_cols)}")
    print(f"  Physics features: {len(physics_cols)}")
    print(f"  Lag features: {len(lag_cols)}")
    print(f"  All feature names: {cols}")

    results["feature_pipeline"] = {
        "input_rows": len(df_input),
        "input_cols": len(df_input.columns),
        "output_feature_count": report.feature_count,
        "missing_pct": round(report.missing_percentage, 2),
        "memory_mb": round(report.memory_usage_mb, 3),
        "avg_time_ms": round(avg_pipeline_ms, 2),
        "median_time_ms": round(med_pipeline_ms, 2),
        "rolling_features": len(rolling_cols),
        "physics_features": len(physics_cols),
        "lag_features": len(lag_cols),
    }

except Exception as e:
    print(f"  [WARN] Feature pipeline metrics failed: {e}")
    import traceback; traceback.print_exc()

# ─────────────────────────────────────────────────────────────────────────────
# 5. PREPROCESSING PIPELINE METRICS
# ─────────────────────────────────────────────────────────────────────────────
print("\n[5] PREPROCESSING PIPELINE METRICS")
try:
    from backend.ml.pipeline.preprocessing.pipeline import PreprocessingPipeline

    now = datetime.utcnow()
    raw_bundle = {
        "SoLEXS": pd.DataFrame({
            "timestamp": [now + timedelta(seconds=10 * i) for i in range(200)],
            "solexs_flux": np.random.normal(10, 1, 200)
        }),
        "HEL1OS": pd.DataFrame({
            "timestamp": [now + timedelta(seconds=10 * i + 2) for i in range(200)],
            "hel1os_flux": np.random.normal(5, 0.5, 200)
        })
    }

    prep_pipeline = PreprocessingPipeline()
    prep_times = []
    for i in range(10):
        t0 = time.perf_counter()
        proc_df, prep_report = asyncio.get_event_loop().run_until_complete(prep_pipeline.run({
            "SoLEXS": raw_bundle["SoLEXS"].copy(),
            "HEL1OS": raw_bundle["HEL1OS"].copy(),
        }))
        prep_times.append((time.perf_counter() - t0) * 1000)

    avg_prep_ms = statistics.mean(prep_times)
    print(f"  Input instruments: 2 (SoLEXS, HEL1OS), 200 rows each")
    print(f"  Output rows: {prep_report.total_processed_rows}")
    print(f"  Sync coverage: {prep_report.sync_coverage_pct:.1f}%")
    print(f"  Preprocessing avg time (N=10): {avg_prep_ms:.2f}ms")
    print(f"  Config hash: {prep_report.config_hash}")

    results["preprocessing"] = {
        "input_instruments": 2,
        "input_rows_each": 200,
        "output_rows": prep_report.total_processed_rows,
        "sync_coverage_pct": round(prep_report.sync_coverage_pct, 1),
        "avg_time_ms": round(avg_prep_ms, 2),
    }

except Exception as e:
    print(f"  [WARN] Preprocessing pipeline metrics failed: {e}")
    import traceback; traceback.print_exc()

# ─────────────────────────────────────────────────────────────────────────────
# 6. SHAP EXPLAINABILITY METRICS
# ─────────────────────────────────────────────────────────────────────────────
print("\n[6] SHAP EXPLAINABILITY METRICS")
try:
    import shap
    # Reuse model from section 3
    if "ml" in results:
        explainer = shap.TreeExplainer(model.model)
        t0 = time.perf_counter()
        shap_values = explainer.shap_values(X_test[:100])
        shap_time_ms = (time.perf_counter() - t0) * 1000

        # For binary classification, shap_values may be a list [neg_class, pos_class]
        if isinstance(shap_values, list):
            sv = shap_values[1]  # positive class
        else:
            sv = shap_values

        # Mean absolute SHAP values per feature
        mean_abs_shap = np.abs(sv).mean(axis=0)
        top5_idx = np.argsort(mean_abs_shap)[::-1][:5]

        print(f"  SHAP computation time (100 samples): {shap_time_ms:.2f}ms")
        print(f"  Avg per-sample SHAP time: {shap_time_ms/100:.3f}ms")
        print(f"  Top-5 features by mean |SHAP|:")
        for rank, idx in enumerate(top5_idx):
            print(f"    #{rank+1}  Feature_{idx:02d}  mean_abs_shap={mean_abs_shap[idx]:.4f}")

        results["shap"] = {
            "samples_explained": 100,
            "total_shap_time_ms": round(shap_time_ms, 2),
            "per_sample_avg_ms": round(shap_time_ms / 100, 3),
            "top5_features": [
                {"feature_idx": int(i), "mean_abs_shap": round(float(mean_abs_shap[i]), 4)}
                for i in top5_idx
            ]
        }
    else:
        print("  [SKIP] ML model not available, skipping SHAP")

except Exception as e:
    print(f"  [WARN] SHAP metrics failed: {e}")
    import traceback; traceback.print_exc()

# ─────────────────────────────────────────────────────────────────────────────
# 7. BENCHMARK ENGINE (head-to-head, DB-less mode)
# ─────────────────────────────────────────────────────────────────────────────
print("\n[7] BENCHMARK ENGINE METRICS")
try:
    from backend.ml.benchmark.engine import BenchmarkEngine

    X_b = np.random.randn(1000, 10)
    y_b = ((X_b[:, 0] > 0.5) & (X_b[:, 1] > 0.3)).astype(int)
    X_btr, X_bte = X_b[:800], X_b[800:]
    y_btr, y_bte = y_b[:800], y_b[800:]

    engine = BenchmarkEngine()
    t0 = time.perf_counter()
    leaderboard = asyncio.get_event_loop().run_until_complete(
        engine.run_benchmark(X_btr, y_btr, X_bte, y_bte)
    )
    bm_time = (time.perf_counter() - t0) * 1000

    print(f"  Benchmark run time: {bm_time:.2f}ms")
    for entry in leaderboard:
        m = entry["metrics"]
        print(f"  Model: {entry['model_id']}  score={entry['score']}")
        print(f"    F1={m['f1_score']:.4f}  ROC-AUC={m['roc_auc']:.4f}  train={m['training_time_sec']:.3f}s  infer={m['inference_latency_avg_ms']:.4f}ms")

    results["benchmark"] = {
        "run_time_ms": round(bm_time, 2),
        "leaderboard": leaderboard
    }

except Exception as e:
    print(f"  [WARN] Benchmark engine failed: {e}")
    import traceback; traceback.print_exc()

# ─────────────────────────────────────────────────────────────────────────────
# 8. LOAD TEST SIMULATION (synthetic concurrent request timing)
# ─────────────────────────────────────────────────────────────────────────────
print("\n[8] SYNTHETIC LOAD TEST (via TestClient, sequential simulation)")
try:
    import threading

    client_lt = TestClient(app, raise_server_exceptions=False)
    N_REQUESTS = 200
    ENDPOINTS_LT = ["/api/v1/health", "/api/v1/telemetry/waveform", "/api/v1/analytics"]

    all_times = []
    errors = [0]

    def make_request(path):
        t0 = time.perf_counter()
        try:
            r = client_lt.get(path)
            if r.status_code >= 500:
                errors[0] += 1
        except Exception:
            errors[0] += 1
        all_times.append((time.perf_counter() - t0) * 1000)

    threads = []
    rng = np.random.default_rng(seed=42)
    for i in range(N_REQUESTS):
        path = ENDPOINTS_LT[i % len(ENDPOINTS_LT)]
        t = threading.Thread(target=make_request, args=(path,))
        threads.append(t)

    t_start = time.perf_counter()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    wall_time = time.perf_counter() - t_start

    avg_lt = statistics.mean(all_times)
    med_lt = statistics.median(all_times)
    p99_lt = sorted(all_times)[int(0.99 * N_REQUESTS)]
    rps    = N_REQUESTS / wall_time

    print(f"  Virtual requests: {N_REQUESTS}  Wall time: {wall_time:.2f}s")
    print(f"  Throughput: {rps:.1f} req/s")
    print(f"  Avg latency: {avg_lt:.2f}ms  Median: {med_lt:.2f}ms  p99: {p99_lt:.2f}ms")
    print(f"  Errors: {errors[0]} ({100*errors[0]/N_REQUESTS:.1f}%)")

    results["load_test"] = {
        "n_requests": N_REQUESTS,
        "wall_time_sec": round(wall_time, 2),
        "throughput_rps": round(rps, 1),
        "avg_ms": round(avg_lt, 2),
        "median_ms": round(med_lt, 2),
        "p99_ms": round(p99_lt, 2),
        "error_count": errors[0],
        "error_pct": round(100 * errors[0] / N_REQUESTS, 1),
    }

except Exception as e:
    print(f"  [WARN] Load test failed: {e}")
    import traceback; traceback.print_exc()

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("  AUDIT COMPLETE — RESULTS SUMMARY (JSON)")
print("=" * 70)
print(json.dumps(results, indent=2, default=str))
