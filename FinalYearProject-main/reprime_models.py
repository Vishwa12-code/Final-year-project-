import os
import sys
from pymongo import MongoClient

# Add backend to path to import engine
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from sisa_engine import SISALearningEngine

# Initialize
client = MongoClient('mongodb://localhost:27017/')
db = client['sisa_project']
data_collection = db['data']
shards_metadata = db['shards']

NUM_SHARDS = 5
MODEL_DIR = os.path.join(os.getcwd(), 'backend', 'models')
sisa_engine = SISALearningEngine(num_shards=NUM_SHARDS, model_dir=MODEL_DIR)

print("Triggering retraining for all shards with data...")

for i in range(NUM_SHARDS):
    shard_data = list(data_collection.find({"shard_id": i}))
    if shard_data:
        print(f"Retraining Shard {i} with {len(shard_data)} records...")
        texts = [item['text'] for item in shard_data]
        labels = [item['label'] for item in shard_data]
        
        acc = sisa_engine.train_shard(i, texts, labels)
        print(f"Shard {i} retrained. Accuracy: {acc}")
        
        # Update metadata to reflect readiness
        shards_metadata.update_one(
            {"shard_id": i},
            {"$set": {"status": "ready", "accuracy": acc, "data_count": len(texts)}},
            upsert=True
        )
    else:
        print(f"Shard {i} has no data, skipping.")

print("Retraining complete. Prediction system should now be active.")
