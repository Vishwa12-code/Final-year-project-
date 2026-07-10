# Project Appendices: SISA Machine Unlearning System

This document contains the core implementation details, performance metrics, and dataset characteristics for the SISA (Sharded, Isolated, Sliced, Aggregated) framework.

---

## APPENDIX 1: Sample Coding

### 1.1 Core SISA Engine (`sisa_engine.py`)
The logic below demonstrates how data is partitioned into isolated shards and then retrained independently to facilitate rapid unlearning.

```python
class SISALearningEngine:
    def train_shard(self, shard_id, texts, labels):
        """
        Retrains a single shard entirely from scratch (SISA isolation).
        Isolation ensures that retraining this shard does not affect 
        the weights or learned features of other shards.
        """
        X = self.global_vectorizer.transform(texts)
        y = np.array(labels)
        
        # New model initialized for full retraining
        model = SGDClassifier(loss='log_loss', max_iter=1000)
        model.fit(X, y)
        
        # Persistent storage of the shard's weights
        self.models[shard_id] = model
        joblib.dump(model, self._get_model_path(shard_id))
        
        return accuracy_score(y, model.predict(X))

    def predict(self, text):
        """Ensemble aggregation using majority voting."""
        X = self.global_vectorizer.transform([text])
        votes = [model.predict(X)[0] for model in self.models.values()]
        
        # Final prediction via majority consensus
        final_prediction = Counter(votes).most_common(1)[0][0]
        return final_prediction
```

### 1.2 Unlearning Protocol API (`app.py`)
The following Flask endpoint handles the targeted deletion of user data and initiates the asynchronous retraining of the affected shard.

```python
@app.route('/api/unlearn', methods=['POST'])
def unlearn_user_data():
    user_id = request.json.get('user_id')
    data_id = request.json.get('data_id')
    
    # 1. Locate the record and its shard assignment
    record = data_collection.find_one({"user_id": user_id, "data_id": data_id})
    shard_id = record['shard_id']
    
    # 2. Perform the 'Permanent Delete' from the database
    data_collection.delete_one({"_id": record['_id']})
    
    # 3. Trigger SISA retrain for the single affected shard
    # This replaces the need for a full model retrain on the entire dataset
    actual_sisa_time = retrain_shard_background(shard_id)
    
    return jsonify({
        "status": "success",
        "affected_shard": shard_id,
        "retrain_time": round(actual_sisa_time, 4)
    })
```

---

## APPENDIX 2: Sample Output

Refer to the visual dashboard representation generated in the project artifacts for a comprehensive look at the system's real-time analytics.

*   **KPIs Displayed**: Total Data Records, Active Shards, Average Accuracy (%), and **Time Saved (%)** (the primary metric for unlearning efficiency).

---

## APPENDIX 3: Dataset Details

### 3.1 Overview
The system uses a Sentiment Analysis dataset for product reviews to demonstrate unlearning logic.

| Field | Type | Description |
| :--- | :--- | :--- |
| **text** | String | The raw user-generated content (reviews). |
| **label** | Integer | Binary classification (1 for Positive, 0 for Negative). |

### 3.2 Sample Dataset Records (`sample_dataset.csv`)

```csv
"This product is amazing I love it",1
"Terrible experience, would not recommend",0
"The battery life is really good",1
"It broke after 2 days of use",0
"Customer service was incredibly helpful",1
"Shipping was delayed by a month",0
"Highly recommend this to everyone",1
"Worst purchase I ever made",0
"Decent quality for the price",1
"The screen has dead pixels",0
"My data is secure and I feel safe",1
"I want my data deleted immediately",0
```

### 3.3 Distribution Metrics
*   **Total Initial Samples**: 16
*   **Positive Sentiment (1)**: 50%
*   **Negative Sentiment (0)**: 50%
*   **Target Models**: Gradient Descent with TF-IDF Vectorization.
