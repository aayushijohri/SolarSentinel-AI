<div align="center">

# ☀️ SolarSentinel AI

### AI-Powered Solar Flare Forecasting & Nowcasting using **ISRO's Aditya-L1 SoLEXS & HEL1OS Data**

> **Transforming scientific solar telemetry into explainable, AI-driven space weather intelligence.**

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi)
![LightGBM](https://img.shields.io/badge/LightGBM-AI-orange?style=flat-square)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Railway](https://img.shields.io/badge/Backend-Railway-black?style=flat-square)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?style=flat-square&logo=vercel)

### 🛰 Built for **Bharatiya Antariksh Hackathon 2026**

🌐 **Live Demo:** https://solar-sentinel-ai1.vercel.app
</div>

---

# 📸 Platform Preview

<p align="center">
<img src="/solar.png" width="100%">
</p>

---

# 🚀 Overview

SolarSentinel AI is an end-to-end **Space Weather Intelligence Platform** built to **forecast and nowcast solar flares** using **Aditya-L1 SoLEXS (Soft X-Ray)** and **HEL1OS (Hard X-Ray)** observations.

The platform automates the complete scientific workflow—from telemetry ingestion and preprocessing to AI inference, explainability, visualization, and Earth impact analysis—through an interactive cloud-native dashboard.

---

# 💡 Why SolarSentinel AI?

- Combines **SoLEXS + HEL1OS** observations for richer solar event analysis.
- Bridges scientific telemetry with **Explainable AI** for transparent predictions.
- Automates the complete telemetry-to-insight pipeline.
- Synchronizes forecasting, analytics, observatory, explainability, and mission dashboards automatically after every dataset upload.

---

# 🎯 Solution Highlights

✅ Read & process **Aditya-L1 SoLEXS & HEL1OS Level-1** datasets

✅ Combined **Soft + Hard X-Ray** analysis

✅ AI-powered Solar Flare **Nowcasting**

✅ Probabilistic Solar Flare **Forecasting**

✅ Explainable AI using **SHAP**

✅ Automated telemetry preprocessing pipeline

✅ Scientific telemetry visualization

✅ Searchable telemetry & prediction database

✅ Interactive analytics & mission dashboards

---

# ✨ Core Features

| Module | Capabilities |
|---------|--------------|
| 🛰 **Mission Dashboard** | Mission health, solar activity index, flare probability, operational status |
| ☀️ **Solar Observatory** | SoLEXS & HEL1OS visualization, waveform analysis, historical telemetry |
| 🤖 **AI Forecasting** | LightGBM inference, flare probability estimation, confidence scoring |
| ⚡ **Nowcasting** | Automated flare detection using combined telemetry signals |
| 🧠 **Explainable AI** | SHAP feature importance & transparent prediction reasoning |
| 🌍 **Earth Impact** | GPS disruption, satellite risk, communication impact estimation |
| 📊 **Analytics** | Historical trends, prediction insights, telemetry statistics |
| 📂 **Dataset Manager** | CSV upload, validation, preprocessing, metadata, history, deletion |
| 🔌 **REST APIs** | Prediction, telemetry, analytics, datasets & health monitoring |

---

# 📊 Scientific Dataset

| Dataset | Description |
|---------|-------------|
| **SoLEXS (Level-1)** | Solar Low Energy X-Ray Spectrometer |
| **HEL1OS (Level-1)** | High Energy L1 Orbiting X-Ray Spectrometer |
| **Storage** | MongoDB Atlas |
| **Input Format** | CSV |

### Dataset Pipeline

- CSV Upload
- Validation
- Cleaning
- Time Synchronization
- Feature Engineering
- Database Storage
- AI Inference
- Dashboard Synchronization

---

# 🤖 AI Workflow

```text
          SoLEXS + HEL1OS
                  │
                  ▼
         Scientific Telemetry
                  │
                  ▼
          CSV Upload / API
                  │
                  ▼
      Validation & Preprocessing
                  │
                  ▼
 Physics + Temporal Feature Engineering
                  │
                  ▼
         ML Inference Engine
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
   Solar Nowcasting    Solar Forecasting
                  │
                  ▼
        SHAP Explainability
                  │
                  ▼
     FastAPI Backend Services
                  │
                  ▼
 Mission Dashboard • Observatory
 Analytics • Earth Impact
 Dataset Manager
```

> Every uploaded dataset automatically refreshes forecasting, explainability, analytics, observatory visualizations, and mission monitoring without manual intervention.

---

# ⭐ Innovation Highlights

- Combined **Soft + Hard X-Ray** telemetry analysis.
- End-to-end automated telemetry-to-insight pipeline.
- Explainable AI with SHAP for scientific transparency.
- Physics-aware & temporal feature engineering.
- Automatic synchronization across all dashboards.
- Cloud-native, modular, production-ready architecture.

---

# 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | React • TypeScript • Vite • Tailwind CSS |
| **Backend** | FastAPI • Python • Uvicorn |
| **Machine Learning** | LightGBM • SHAP • Scikit-learn |
| **Visualization** | Recharts |
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
│   ├── hooks/
│   ├── lib/
│   └── pages/
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

# 🚀 Getting Started

```bash
# Clone Repository
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

| Component | Platform |
|-----------|----------|
| 🌐 Frontend | Vercel |
| ⚡ Backend | Railway |
| 🗄 Database | MongoDB Atlas |
| 📖 API Documentation | `/docs` (Swagger UI) |

---

# 🔮 Future Scope

- Live Aditya-L1 telemetry integration
- Transformer/LSTM-based forecasting
- Real-time solar event alerts
- Advanced anomaly detection
- Multi-mission support
- Global space weather visualization

---

# 👥 Team

Developed for **Bharatiya Antariksh Hackathon 2026**.

SolarSentinel AI demonstrates how **Artificial Intelligence**, **Explainable Machine Learning**, and **scientific telemetry** can be integrated into a unified platform for intelligent space weather monitoring, solar flare forecasting, and decision support inspired by **ISRO's Aditya-L1 Mission**.
