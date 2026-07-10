# Privacy-Preserving Machine Unlearning System using SISA Framework

A Machine Learning-based web application that implements the **SISA (Sharded, Isolated, Sliced, and Aggregated)** framework to support **privacy-preserving machine unlearning**. The system enables users to request deletion of their data from trained machine learning models without retraining the entire model, reducing computation time while maintaining prediction accuracy.

---

## Project Overview

Traditional machine learning models require complete retraining when user data needs to be removed. This project solves that problem using the **SISA Framework**, where data is divided into independent shards and only the affected shard is retrained after a deletion request.

The application also provides sentiment prediction, real-time dashboard monitoring, and efficient background retraining.

---

## Features

- User review submission
- Data sharding using the SISA framework
- Text preprocessing with TF-IDF
- Independent model training for each shard
- Ensemble prediction using Majority Voting
- Machine unlearning (delete user data)
- Background retraining
- Real-time dashboard and performance monitoring

---

## Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- ShadCN UI
- Recharts
- Framer Motion

### Backend
- Flask
- Python
- REST API

### Machine Learning
- Scikit-learn
- TF-IDF Vectorizer
- SGD Classifier
- Majority Voting
- SISA Framework

### Database
- MongoDB

---

## Project Modules

### 1. User Data Input
- Collect user reviews
- Store user information with unique IDs
- Send data to backend using REST APIs

### 2. Data Sharding
- Divide dataset into independent shards
- Assign records to individual shard IDs
- Store data separately for isolation

### 3. Data Preprocessing
- Text cleaning
- Tokenization
- TF-IDF Vectorization
- Feature normalization

### 4. Model Training
- Train separate ML models for each shard
- Save individual trained models
- Learn sentiment patterns independently

### 5. Prediction & Aggregation
- Send input to every shard model
- Collect predictions
- Final prediction using Majority Voting

### 6. Machine Unlearning
- Accept user deletion requests
- Identify affected shard
- Remove user data
- Retrain only the affected shard

### 7. Background Retraining
- Automatic asynchronous retraining
- No interruption to application usage

### 8. Dashboard & Monitoring
- View active shards
- Monitor model accuracy
- Display retraining statistics
- Visualize performance metrics

---

## Workflow

```text
User Input
      │
      ▼
Data Sharding
      │
      ▼
Data Preprocessing
      │
      ▼
Model Training
      │
      ▼
Prediction & Aggregation
      │
      ▼
Machine Unlearning Request
      │
      ▼
Affected Shard Retraining
      │
      ▼
Dashboard Monitoring
```

---

## Repository Structure

```
├── frontend/
├── backend/
├── models/
├── dataset/
├── api/
├── screenshots/
├── README.md
└── requirements.txt
```

---

## Installation

```bash
git clone https://github.com/yourusername/project-name.git

cd project-name

pip install -r requirements.txt
```

Run Backend

```bash
python app.py
```

Run Frontend

```bash
npm install
npm run dev
```

---

## Future Enhancements

- Deep Learning integration
- Cloud deployment
- Docker support
- Authentication and authorization
- Real-time analytics

---

## Contributors

- Vishwa S
- Team Members

---

## License

This project is developed for educational and academic purposes.
