import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Alert {
  id: string;
  severity: string;
  message: string;
  ts: string;
}

export interface TimelineEvent {
  title: string;
  status: string;
  ts: string;
}

export interface MissionStatus {
  solar_activity_index: number;
  current_flare_class: string;
  forecast_confidence: number;
  forecast_lead_time_h: number;
  satellite_health: number;
  telemetry_throughput_gbs: number;
  telemetry: {
    active_stream: string;
    latency_ms: number;
    throughput_gbs: number;
    packets_received: number;
    dropped_frames: number;
  };
  alerts: Alert[];
  timeline: TimelineEvent[];
  system_health: {
    onboard_temp: number;
    power_bus_v: number;
    instrument_sync: string;
    cpu_usage: number;
    mem_usage: number;
  };
  command_log: { cmd: string; user: string; status: string; ts: string }[];
  mission_objectives: { task: string; progress: number }[];
  subsystems: { name: string; value: number; status: string }[];
  active_nodes?: number;
  pipeline_status?: string;
  last_updated: string;
}

export interface PredictionResult {
  prediction: number;
  probability: number;
  confidence: number;
  predicted_class: string;
  lead_time_min: number;
  model_version: string;
  processing_duration_ms: number;
  derived_metrics?: {
    bz_nt: number;
    vsw_kms: number;
    dst_nt: number;
  };
  id?: string;
}

export interface AnalyticsMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  auroc: number;
  inference_ms: number;
  dataset_size: number;
  training_history: { epoch: number; loss: number; val_loss: number }[];
  scatter_points: { x: number; y: number; z: number }[];
  correlation_matrix: number[][];
  probability_curve: { h: string; low: number; mid: number; hi: number }[];
  flare_distribution?: { c: string; v: number }[];
  labels: string[];
}

export const fetchMissionStatus = async (): Promise<MissionStatus> => {
  const response = await apiClient.get('/mission/status');
  return response.data;
};

export const uploadTelemetry = async (file: File, instrument: string) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post(`/telemetry/upload?instrument=${instrument}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getNowcast = async (instrument: string = "SoLEXS"): Promise<PredictionResult> => {
  const response = await apiClient.post(`/predict/nowcast?instrument=${instrument}`);
  return response.data;
};

export const fetchAnalytics = async (): Promise<AnalyticsMetrics> => {
  const response = await apiClient.get('/analytics');
  return response.data;
};

export const getExplanation = async (predictionId: string) => {
  const response = await apiClient.get(`/predict/explain/${predictionId}`);
  return response.data;
};

export const fetchIngestionHistory = async () => {
  const response = await apiClient.get('/telemetry/history');
  return response.data;
};

export const fetchLatestTelemetry = async (instrument: string, limit: number = 50) => {
  const response = await apiClient.get(`/telemetry/latest?instrument=${instrument}&limit=${limit}`);
  return response.data;
};

export const fetchWaveformData = async (instrument: string = "SoLEXS", limit: number = 72) => {
  const response = await apiClient.get(`/telemetry/waveform?instrument=${instrument}&limit=${limit}`);
  return response.data;
};
