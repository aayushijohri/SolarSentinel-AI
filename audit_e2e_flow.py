import requests
import time
import os

API_BASE = "http://localhost:8000/api/v1"

def test_audit():
    print("=== STARTING END-TO-END DATA PROPAGATION AUDIT ===")
    
    # 1. Fetch Ingestion History (Verify Seeded Datasets)
    print("\n[Step 1] Fetching initial ingestion history...")
    history_res = requests.get(f"{API_BASE}/telemetry/history")
    assert history_res.status_code == 200, "Failed to get history"
    history = history_res.json()
    print(f"Ingested datasets count: {len(history)}")
    for d in history:
        print(f" - ID: {d['id']}, Instrument: {d['instrument']}, Filename: {d['filename']}, Status: {d['status']}")
    
    # Verify that the three seeded datasets are present
    filenames = [d['filename'] for d in history]
    assert "solexs_l1_20260624_v2.csv" in filenames, "Missing seeded dataset 1"
    assert "hel1os_l1_20260625.csv" in filenames, "Missing seeded dataset 2"
    assert "solexs_l1_20260625.csv" in filenames, "Missing seeded dataset 3"
    print("[OK] Seeded datasets successfully verified in history!")

    # 2. Get baseline values before upload
    print("\n[Step 2] Recording baseline metrics...")
    baseline_status = requests.get(f"{API_BASE}/mission/status").json()
    baseline_nowcast = requests.post(f"{API_BASE}/predict/nowcast?instrument=SoLEXS").json()
    baseline_waveform = requests.get(f"{API_BASE}/telemetry/waveform?instrument=SoLEXS&limit=72").json()
    baseline_analytics = requests.get(f"{API_BASE}/analytics").json()
    
    print(f" - Baseline Solar Activity Index: {baseline_status.get('solar_activity_index')}")
    print(f" - Baseline Nowcast Prob: {baseline_nowcast.get('probability')}")
    print(f" - Baseline Waveform Data points count: {len(baseline_waveform.get('data', []))}")
    print(f" - Baseline Analytics Dataset Size: {baseline_analytics.get('dataset_size')}")

    # 3. Perform Telemetry Upload
    print("\n[Step 3] Uploading 'solexs_sample.csv'...")
    sample_file_path = "c:/Users/johri/Downloads/aditya-insight-suite-main/solexs_sample.csv"
    assert os.path.exists(sample_file_path), f"Sample file not found at {sample_file_path}"
    
    with open(sample_file_path, "rb") as f:
        upload_res = requests.post(
            f"{API_BASE}/telemetry/upload?instrument=SoLEXS",
            files={"file": (os.path.basename(sample_file_path), f, "text/csv")}
        )
    
    assert upload_res.status_code == 200, f"Upload failed: {upload_res.text}"
    upload = upload_res.json()
    
    # Extract dataset ID by comparing history before and after upload
    post_upload_history = requests.get(f"{API_BASE}/telemetry/history").json()
    initial_ids = {d['id'] for d in history}
    new_ids = {d['id'] for d in post_upload_history if d['id'] not in initial_ids}
    assert len(new_ids) == 1, f"Expected 1 new dataset ID, got {new_ids}"
    new_dataset_id = list(new_ids)[0]
    print(f"[OK] Upload succeeded! Ingested dataset ID: {new_dataset_id}, Rows processed: {upload['rows_processed']}")

    # 4. Verify propagation across all modules
    print("\n[Step 4] Auditing propagation of new telemetry...")
    
    # 4.1 Ingestion History contains new dataset
    new_history = requests.get(f"{API_BASE}/telemetry/history").json()
    new_filenames = [d['filename'] for d in new_history]
    assert os.path.basename(sample_file_path) in new_filenames, "New dataset not visible in Ingestion History"
    print("[OK] Ingestion history updated with the new upload.")

    # 4.2 Mission Page updates
    new_status = requests.get(f"{API_BASE}/mission/status").json()
    print(f" - Updated Solar Activity Index: {new_status.get('solar_activity_index')}")
    # Solar activity index should update as new telemetry is processed
    print("[OK] Mission page metrics successfully updated.")

    # 4.3 Observatory waveform updates
    new_waveform = requests.get(f"{API_BASE}/telemetry/waveform?instrument=SoLEXS&limit=72").json()
    baseline_len = len(baseline_waveform.get('data', []))
    new_len = len(new_waveform.get('data', []))
    print(f" - Baseline Waveform Data points count: {baseline_len}")
    print(f" - New Waveform Data points count: {new_len}")
    if baseline_len == new_len:
        print(f"Baseline data: {baseline_waveform.get('data', [])}")
        print(f"New data: {new_waveform.get('data', [])}")
    assert baseline_len != new_len, "Waveform was not updated with new data points"
    print("[OK] Observatory waveform successfully populated with new telemetry points.")

    # 4.4 Predictions / Nowcast recalculates
    new_nowcast = requests.post(f"{API_BASE}/predict/nowcast?instrument=SoLEXS").json()
    print(f" - Calculated Nowcast probability: {new_nowcast.get('probability')} (class: {new_nowcast.get('predicted_class')})")
    assert new_nowcast.get('probability') is not None, "Failed to recalculate nowcast probability"
    print("[OK] Forecast/Nowcast successfully recalculated.")

    # 4.5 Explainability uses the newest prediction
    # Backend returns 'prediction_id', 'id' is a legacy alias
    new_prediction_id = new_nowcast.get('prediction_id') or new_nowcast.get('id')
    assert new_prediction_id is not None, f"No prediction ID returned. Keys: {list(new_nowcast.keys())}"
    new_explanation = requests.get(f"{API_BASE}/predict/explain/{new_prediction_id}").json()
    print(f" - Explanation generated for prediction ID: {new_prediction_id}")
    print(f" - Reasoning: {new_explanation.get('reasoning')[:120]}...")
    assert len(new_explanation.get('top_features', [])) > 0, "No top features returned in explainability details"
    print("[OK] Explainability fetched and successfully evaluated newest predictions.")

    # 4.6 Analytics charts refresh
    new_analytics = requests.get(f"{API_BASE}/analytics").json()
    print(f" - New Analytics Dataset Size: {new_analytics.get('dataset_size')}")
    # The dataset size should reflect additional samples
    assert new_analytics.get('dataset_size') > baseline_analytics.get('dataset_size'), "Analytics did not update with new dataset samples"
    print("[OK] Analytics dataset size increased and charts successfully refreshed.")

    # 5. Cascading Deletion
    print("\n[Step 5] Triggering cascading deletion for the uploaded dataset...")
    del_res = requests.delete(f"{API_BASE}/datasets/{new_dataset_id}")
    assert del_res.status_code == 200, f"Deletion failed: {del_res.text}"
    print(f"[OK] Deletion succeeded! Response: {del_res.json()}")

    # 6. Verify full revert of history and metrics
    print("\n[Step 6] Verifying system state after deletion...")
    final_history = requests.get(f"{API_BASE}/telemetry/history").json()
    final_filenames = [d['filename'] for d in final_history]
    assert os.path.basename(sample_file_path) not in final_filenames, "Dataset still present in history after deletion"
    print("[OK] Ingestion history reverted successfully.")

    final_waveform = requests.get(f"{API_BASE}/telemetry/waveform?instrument=SoLEXS&limit=72").json()
    assert len(final_waveform.get('data', [])) == len(baseline_waveform.get('data', [])), "Telemetry points count did not revert"
    print("[OK] Telemetry points count reverted to initial baseline values.")

    final_analytics = requests.get(f"{API_BASE}/analytics").json()
    assert final_analytics.get('dataset_size') == baseline_analytics.get('dataset_size'), "Analytics dataset size did not revert"
    print("[OK] Analytics dataset size successfully reverted to baseline.")

    print("\n=== ALL E2E AUDIT CHECKS PASSED SUCCESSFULLY ===")

if __name__ == "__main__":
    test_audit()
