# ☀️ SolarSentinel AI

### AI-Powered Space Weather Intelligence Platform Inspired by ISRO's Aditya-L1 Mission

> **Transforming raw solar telemetry into explainable, real-time space weather intelligence using AI, Machine Learning, and interactive analytics.**

🌐 **Live Demo:** https://solar-sentinel-ai1.vercel.app  
⚡ **Backend API:** https://web-production-5ef63.up.railway.app

---

# 🚀 Overview

SolarSentinel AI is an end-to-end **Space Weather Intelligence Platform** built for monitoring, forecasting, and understanding solar activity. Inspired by **ISRO's Aditya-L1 Mission**, the platform combines AI-powered forecasting, explainable machine learning, scientific data processing, and interactive visualization into a unified decision-support system.

---

# 🎯 Problem Statement

Current space weather monitoring systems often:

- Require manual interpretation of telemetry
- Provide limited predictive intelligence
- Operate as black-box AI systems
- Lack unified analytics and visualization

SolarSentinel AI addresses these challenges through an explainable AI-driven pipeline capable of forecasting solar activity and estimating potential impacts on Earth.

---

# ✨ Key Features

## 🛰️ Mission Dashboard

- Live mission status monitoring
- Solar activity indicators
- Flare probability overview
- Mission health metrics

## ☀️ Solar Observatory

- Interactive telemetry visualization
- X-Ray Flux monitoring
- Electron & Proton Flux analysis
- Solar Wind & Plasma visualization
- Magnetic Field trends
- Historical waveform exploration

## 🤖 AI-Powered Solar Flare Forecasting

- LightGBM-based inference engine
- Probability-based flare prediction
- Confidence estimation
- Automated prediction pipeline

## 🧠 Explainable AI

- SHAP feature importance
- Prediction transparency
- Feature contribution analysis
- Explainable model decisions

## 🌍 Earth Impact Assessment

- Satellite communication risk
- GPS disruption estimation
- Radio communication impact
- Geomagnetic storm assessment

## 📂 Dataset Management

- CSV telemetry upload
- Dataset history
- Dataset deletion
- Automatic pipeline synchronization

## 📊 Analytics Dashboard

- Historical telemetry trends
- Prediction statistics
- Mission analytics
- Operational insights

## ⚙️ REST API

- Versioned FastAPI endpoints
- Telemetry ingestion
- AI inference
- Analytics
- System monitoring

---

# 🏗️ System Architecture

```text
                  Aditya-L1 Inspired Telemetry
                              │
                              ▼
                    CSV Upload / REST API
                              │
                              ▼
               Validation & Data Preprocessing
                              │
                              ▼
       Physics & Temporal Feature Engineering
                              │
                              ▼
             AI Inference Engine (LightGBM)
                    │                    │
                    ▼                    ▼
          Solar Flare Prediction    SHAP Explainability
                    └──────────┬──────────┘
                               ▼
                      FastAPI Backend API
                               │
                               ▼
 Mission Dashboard • Observatory • Analytics
 Forecast • Earth Impact • Dataset Manager
```

---

# ⭐ Innovation Highlights

- End-to-end AI pipeline from telemetry ingestion to prediction
- Physics-aware and temporal feature engineering
- Explainable AI using SHAP for transparent predictions
- Automatic synchronization across all dashboards after dataset upload
- Production-ready cloud-native architecture
- Modular backend supporting scalable ML workflows

---

# 🛠️ Technology Stack

| Layer | Technologies |
|--------|--------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Backend** | FastAPI, Python, Uvicorn |
| **AI / ML** | LightGBM, SHAP, Scikit-learn |
| **Data Processing** | Pandas, NumPy, SciPy, Astropy |
| **Database** | MongoDB Atlas |
| **Deployment** | Vercel, Railway |

---

# 📂 Project Structure

```text
SolarSentinel-AI
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── hooks/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── repositories/
│   │   ├── services/
│   │   └── schemas/
│   │
│   ├── ml/
│   │   ├── preprocessing/
│   │   ├── engineering/
│   │   ├── ingestion/
│   │   └── models/
│   │
│   └── configs/
│
├── docs/
└── artifacts/
```

---

# 🚀 Getting Started

### Clone Repository

```bash
git clone https://github.com/<your-username>/SolarSentinel-AI.git
cd SolarSentinel-AI
```

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn backend.app.main:app --reload
```

---

# ☁️ Deployment

| Component | Platform |
|-----------|----------|
| Frontend | Vercel |
| Backend | Railway |
| Database | MongoDB Atlas |

---

# 🔮 Future Enhancements

- Real-time Aditya-L1 telemetry integration
- Transformer/LSTM-based forecasting
- Automated space weather alerts
- Multi-mission support
- Advanced anomaly detection
- Global space weather visualization

---

# 👥 Team

Developed for **Bharatiya Antariksh Hackathon 2026**.

Inspired by **ISRO's Aditya-L1 Mission**, SolarSentinel AI demonstrates how Artificial Intelligence, Explainable Machine Learning, and modern cloud technologies can be leveraged to build an intelligent, transparent, and scalable space weather monitoring platform.
