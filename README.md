# ☀️ SolarSentinel AI
<div align="center">

### **AI-Powered Solar Flare Forecasting & Nowcasting using Aditya-L1 SoLEXS + HEL1OS Data**

*Built for **Bharatiya Antariksh Hackathon 2026***

🌐 **Live Demo:** https://solar-sentinel-ai1.vercel.app  

</div>

---

## 📸 Platform Preview

<p align="center">
<img src="/solar.png" width="100%">
</p>

---

# 🚀 Overview

SolarSentinel AI is an end-to-end **Space Weather Intelligence Platform** designed for **forecasting and nowcasting solar flares** using **combined SoLEXS (Soft X-Ray)** and **HEL1OS (Hard X-Ray)** observations from **ISRO's Aditya-L1 Mission**.

The platform automates the complete pipeline—from telemetry ingestion and preprocessing to AI inference, explainability, visualization, and dataset management—through an interactive cloud-native dashboard.

---

# 🎯 Problem Statement Coverage

✔ Read SoLEXS & HEL1OS Level-1 datasets

✔ Process combined soft & hard X-Ray light curves

✔ Visualize scientific telemetry

✔ Automated flare detection (Nowcasting)

✔ Solar flare probability forecasting

✔ Explainable AI predictions

✔ Automated flare database

✔ Interactive monitoring dashboard

✔ REST APIs for analytics & prediction

---

# ✨ Core Features

| Module | Features |
|---------|----------|
| 🛰 **Mission Dashboard** | Mission health, solar activity, prediction summary, operational status |
| ☀️ **Solar Observatory** | SoLEXS & HEL1OS waveform visualization, historical telemetry, interactive charts |
| 🤖 **AI Forecasting** | Time-series prediction, flare probability estimation, LightGBM inference |
| ⚡ **Nowcasting** | Automated flare detection, event classification, combined X-Ray analysis |
| 🧠 **Explainable AI** | SHAP explanations, feature importance, transparent model reasoning |
| 🌍 **Earth Impact** | GPS disruption, communication impact, satellite risk estimation |
| 📊 **Analytics** | Historical trends, telemetry insights, prediction statistics |
| 📂 **Dataset Manager** | Upload CSV, preprocessing, metadata, history, delete datasets |
| 🔌 **REST API** | Prediction, telemetry, analytics, datasets, health monitoring |

---

# 📊 Dataset

| Source | Description |
|---------|-------------|
| **SoLEXS (Level-1)** | Solar Low Energy X-Ray Spectrometer |
| **HEL1OS (Level-1)** | High Energy L1 Orbiting X-Ray Spectrometer |
| **Storage** | MongoDB Atlas |
| **Supported Format** | CSV |

### Dataset Pipeline

- Upload scientific telemetry
- Validation
- Cleaning & preprocessing
- Time synchronization
- Feature engineering
- Database storage
- AI inference
- Dashboard visualization

---

# 🤖 AI Pipeline

```text
SoLEXS + HEL1OS
        │
        ▼
Telemetry Upload
        │
        ▼
Validation & Cleaning
        │
        ▼
Feature Engineering
        │
        ▼
LightGBM Model
   │          │
   ▼          ▼
Nowcasting  Forecasting
        │
        ▼
 SHAP Explainability
        │
        ▼
 FastAPI APIs
        │
        ▼
 Interactive Dashboard
```

---

# ⭐ Innovation Highlights

- Combined **Soft + Hard X-Ray** analysis instead of a single data source
- Automated end-to-end telemetry processing pipeline
- Explainable AI using SHAP for scientific transparency
- Cloud-native architecture with scalable REST APIs
- Integrated visualization, analytics, forecasting and dataset management in one platform

---

# 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React • TypeScript • Vite • Tailwind CSS |
| **Backend** | FastAPI • Python • Uvicorn |
| **Machine Learning** | LightGBM • SHAP • Scikit-learn |
| **Data Processing** | Pandas • NumPy • SciPy |
| **Database** | MongoDB Atlas |
| **Deployment** | Vercel • Railway |

---

# 📂 Project Structure

```text
SolarSentinel-AI
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   └── lib/
│
├── backend/
│   ├── api/
│   ├── ml/
│   ├── repositories/
│   ├── services/
│   └── configs/
│
├── docs/
└── artifacts/
```

---

# 🌐 REST API

| Endpoint | Purpose |
|----------|---------|
| `/api/v1/mission/status` | Mission monitoring |
| `/api/v1/telemetry/upload` | Upload telemetry |
| `/api/v1/telemetry/waveform` | Waveform visualization |
| `/api/v1/telemetry/history` | Dataset history |
| `/api/v1/datasets` | Dataset management |
| `/api/v1/predict/nowcast` | Solar flare prediction |
| `/api/v1/predict/explain/{id}` | SHAP explanation |
| `/api/v1/analytics` | Analytics dashboard |
| `/api/v1/health` | Health monitoring |

---

# 🚀 Getting Started

```bash
git clone https://github.com/<your-username>/SolarSentinel-AI.git

cd SolarSentinel-AI

# Frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

---

# ☁️ Deployment

| Service | Platform |
|---------|----------|
| **Frontend** | Vercel |
| **Backend** | Railway |
| **Database** | MongoDB Atlas |

---

# 🔮 Future Improvements

- Live Aditya-L1 telemetry ingestion
- Transformer/LSTM forecasting
- Real-time alert system
- Advanced anomaly detection
- Multi-mission support

---

# 👥 Team

**Built for Bharatiya Antariksh Hackathon 2026**

SolarSentinel AI demonstrates how AI, Explainable Machine Learning and scientific telemetry can be combined to build an intelligent, transparent and scalable space weather forecasting platform inspired by ISRO's Aditya-L1 mission.
