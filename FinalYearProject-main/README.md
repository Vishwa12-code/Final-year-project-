# Privacy-Preserving Machine Unlearning System (SISA Framework)

A complete, production-level Full-Stack AI System demonstrating the **SISA (Sharded, Isolated, Sliced, Aggregated)** framework for efficient Machine Unlearning. 

---

## 🚀 Features

- **Advanced SISA Engine**: Data is distributed geometrically across isolated shards. Unlearning a user's data only requires retraining the specific shard containing that data, dramatically reducing computational overhead and saving time.
- **REST API (Flask)**: High-performance backend routing, background threading for asynchronous retraining, and real-time MongoDB integration.
- **Dynamic React Dashboard**: A cybersecurity-styled, glassmorphism UI built with **Vite, React, Tailwind CSS, ShadCN principles, and Framer Motion**.
- **Real-time Analytics**: Built-in metrics engine to calculate and visualize unlearning time savings (SISA vs Full Retrain).

---

## 📂 Architecture

```
/project (Current Directory)
│
├── backend/                  # Flask + Scikit-Learn API
│   ├── app.py                # Main orchestrator & API Endpoints
│   ├── sisa_engine.py        # Core SISA Algorithm Implementation
│   ├── requirements.txt      # Python dependencies
│   └── models/               # Auto-generated Shard Models
│
├── frontend/                 # Vite + React Dashboard
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite & API Proxy
│   └── src/                  # React Source Code (Components, UI)
│
└── data/                     # Data assets
    └── sample_dataset.csv    # Initial load data
```

---

## 🛠️ Prerequisites & Setup

### 1. Database Requirement
This system uses **MongoDB** to manage data shards, metrics, and activity logs. 
- You must have MongoDB installed and running locally on the default port: `mongodb://localhost:27017/`

### 2. Backend Initialization (Python)
Ensure you have Python 3.9+ installed.

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Run the Flask API server
python app.py
```
*The server will start on `http://localhost:5000`.*

### 3. Frontend Initialization (Node.js)
Ensure you have Node.js (v18+) and npm installed.

```bash
cd frontend

# Install all Vite, React, Tailwind, and Recharts dependencies
npm install

# Start the Vite development server
npm run dev
```
*The frontend dashboard will be available at `http://localhost:5173`. It will automatically proxy API requests to your Flask backend.*

---

## 🧪 How to Demo the System

1. **Ingest Data**: Open the dashboard and start sending random data into the system through the **"Ingest Data"** panel. Watch the "Active Shards" status update as models are asynchronously retrained. (You can also script a loop to push data from `data/sample_dataset.csv`).
2. **Predict**: Use the **"Live Ensemble Prediction"** panel to see how all `K` shards vote on a piece of text, and how the final aggregation is determined via majority vote.
3. **Machine Unlearning Request**: 
   - Look at your recent Activity Logs to find a `user_id` that was added.
   - Paste that ID into the **"Unlearn Request"** panel.
   - Click "Execute Unlearn Protocol". 
   - **Observe the magic**: The UI will tell you exactly which isolated shard was located, securely wiped of the data, and retrained in milliseconds, and the UI will show you the exact percentage of **Time Saved** compared to retraining the complete dataset.

---

*Academic Project Implementation by Antigravity*
