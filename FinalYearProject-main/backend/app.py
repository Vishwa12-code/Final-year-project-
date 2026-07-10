from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
import threading
import uuid
import time
import os
import bcrypt
from sisa_engine import SISALearningEngine
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/')
db = client['sisa_project']
data_collection = db['data']
logs_collection = db['logs']
metrics_collection = db['metrics']
shards_metadata = db['shards']
users_collection = db['users']
deleted_records_collection = db['deleted_records']
accounts_collection = db['accounts']


# Initialize SISA Engine
NUM_SHARDS = 5
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
sisa_engine = SISALearningEngine(num_shards=NUM_SHARDS, model_dir=MODEL_DIR)

def log_event(event_type, description, metadata=None):
    log_entry = {
        "timestamp": datetime.now(),
        "type": event_type,
        "description": description,
        "metadata": metadata or {}
    }
    logs_collection.insert_one(log_entry)

def retrain_shard_background(shard_id):
    """Background task to retrain a specific shard and measure time."""
    start_time = time.time()
    
    # Fetch all data for this shard
    shard_data_cursor = data_collection.find({"shard_id": shard_id})
    shard_data = list(shard_data_cursor)
    
    texts = [item['text'] for item in shard_data]
    labels = [item['label'] for item in shard_data]
    
    if len(texts) > 0:
        accuracy = sisa_engine.train_shard(shard_id, texts, labels)
    else:
        # If no data, clear the model
        sisa_engine.clear_shard(shard_id)
        accuracy = 0.0
        
    end_time = time.time()
    time_taken = end_time - start_time
    
    # Update shard metadata
    shards_metadata.update_one(
        {"shard_id": shard_id},
        {"$set": {
            "status": "ready", 
            "last_trained": datetime.now(),
            "accuracy": accuracy,
            "data_count": len(texts),
            "last_train_time": time_taken
        }},
        upsert=True
    )
    
    log_event("SHARD_RETRAIN", f"Shard {shard_id} retrained", {"shard_id": shard_id, "time_taken": time_taken, "accuracy": accuracy})
    
    # For Unlearning Metrics comparison
    return time_taken

@app.route('/register', methods=['POST'])
def register():
    body = request.json
    email = body.get('email')
    password = body.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    if accounts_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400
        
    # Use proper encoding (utf-8) before hashing
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    accounts_collection.insert_one({
        "email": email,
        "password": hashed_password
    })
    
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    body = request.json
    email = body.get('email')
    password = body.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
        
    user = accounts_collection.find_one({"email": email})
    
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
        
    # Compare entered password with stored hashed password
    if bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/data', methods=['POST'])
def add_data():
    """Adds new data and assigns to a shard."""
    body = request.json
    text = body.get('text')
    label = body.get('label')
    user_id = body.get('user_id')
    age = body.get('age')
    
    if not text or label is None:
        return jsonify({"error": "Missing text or label"}), 400
        
    # Assign to shard deterministically or randomly (here we use simple round robin or random)
    shard_counts = list(shards_metadata.find().sort("data_count", 1).limit(1))
    shard_id = 0
    if shard_counts:
        shard_id = shard_counts[0]['shard_id']
        
    # If user_id is provided, use it. Otherwise, generate new.
    print(f"DEBUG: Processing add_data with user_id input: '{user_id}'")
    if user_id:
        user_id = str(user_id).strip()
    else:
        user_id = str(uuid.uuid4())
        
    print(f"DEBUG: Assigned user_id: '{user_id}'")
        
    data_id = str(uuid.uuid4())
    record = {
        "user_id": user_id,
        "data_id": data_id,
        "text": text,
        "label": label,
        "image": body.get('image'), # Added image field (Base64)
        "shard_id": shard_id,
        "created_at": datetime.now()
    }
    
    result = data_collection.insert_one(record)
    
    # Update or create user registry
    user_doc = users_collection.find_one({"user_id": user_id})
    if user_doc:
        users_collection.update_one(
            {"user_id": user_id},
            {"$push": {"records": data_id}}
        )
    else:
        users_collection.insert_one({
            "user_id": user_id,
            "age": age if age is not None else "Unknown",
            "records": [data_id]
        })
    
    log_event("DATA_ADDED", "New user data added", {"user_id": user_id, "data_id": data_id, "shard_id": shard_id, "age": age})
    
    # Retrain shard in background
    shards_metadata.update_one({"shard_id": shard_id}, {"$set": {"status": "retraining"}}, upsert=True)
    threading.Thread(target=retrain_shard_background, args=(shard_id,)).start()
    
    return jsonify({
        "message": "Data added successfully", 
        "user_id": user_id, 
        "data_id": data_id,
        "shard_id": shard_id,
        "id": str(result.inserted_id)
    })

@app.route('/api/unlearn', methods=['POST'])
def unlearn_user_data():
    """Removes a user's data and triggers SISA unlearning process."""
    body = request.json
    user_id_raw = body.get('user_id')
    data_id_raw = body.get('data_id')
    
    if not user_id_raw or not data_id_raw:
        return jsonify({
            "status": "error",
            "message": "Record not found (check full user_id and data_id)"
        }), 404
        
    user_id = str(user_id_raw or "").strip()
    data_id = str(data_id_raw or "").strip()
    
    print(f"DEBUG: Unlearn request for user_id: '{user_id}', data_id: '{data_id}'")
    
    record = data_collection.find_one({
        "user_id": user_id,
        "data_id": data_id
    })
    
    if not record:
        # Check if it was ALREADY unlearned (Historical lookup)
        historical = deleted_records_collection.find_one({
            "user_id": user_id,
            "data_id": data_id
        })
        if historical:
            print(f"DEBUG: Record found in historical deleted_records for user_id={user_id}")
            # Fetch other remaining records for this user to rebuild the full view
            remaining_cursor = data_collection.find({"user_id": user_id}, {"_id": 0, "data_id": 1, "text": 1, "label": 1, "image": 1, "age": 1})
            remaining_data = list(remaining_cursor)
            
            return jsonify({
                "status": "success",
                "is_historical": True,
                "deleted": {
                    "user_id": historical['user_id'],
                    "data_id": historical['data_id'],
                    "text": historical['text'],
                    "age": historical['age'],
                    "image": historical.get('image')
                },
                "remaining": {
                    "user_id": user_id,
                    "age": historical['age'],
                    "records_left": len(remaining_data),
                    "records": remaining_data
                },
                "affected_shard": historical['shard_id'],
                "retrain_time": 0 # Already retrained previously
            })
            
        print(f"DEBUG: Record NOT found in database for user_id={user_id}, data_id={data_id}")
        return jsonify({
            "status": "error",
            "message": "Record not found (check full user_id and data_id)"
        }), 404
        
    shard_id = record['shard_id']
    deleted_text = record['text']
    deleted_label = record['label']
    
    # Get user metadata
    user_doc = users_collection.find_one({"user_id": user_id})
    user_age = user_doc.get('age') if user_doc else "Unknown"
    
    # Track what was deleted
    deleted_records_collection.insert_one({
        "user_id": user_id,
        "data_id": data_id,
        "text": deleted_text,
        "label": deleted_label,
        "image": record.get('image'), # Track deleted image
        "age": user_age,
        "shard_id": shard_id,
        "deleted_at": datetime.now()
    })
    
    # Execute deletion
    delete_result = data_collection.delete_one({
        "user_id": user_id,
        "data_id": data_id
    })
    
    # Update registry and see remaining
    if user_doc:
        users_collection.update_one(
            {"user_id": user_id},
            {"$pull": {"records": data_id}}
        )
    
    # Find remaining data
    remaining_cursor = data_collection.find({"user_id": user_id}, {"_id": 0, "data_id": 1, "text": 1, "label": 1, "image": 1, "age": 1})
    remaining_data = list(remaining_cursor)
    
    # Retrain affected shard
    shards_metadata.update_one({"shard_id": shard_id}, {"$set": {"status": "unlearning"}})
    actual_sisa_time = retrain_shard_background(shard_id)
    
    log_event("DATA_DELETED", "Targeted sentence unlearned", {
        "user_id": user_id, 
        "data_id": data_id,
        "shard_id": shard_id,
        "records_removed": 1,
        "retrain_time": actual_sisa_time
    })
    
    return jsonify({
        "status": "success",
        "deleted": {
            "user_id": user_id,
            "data_id": data_id,
            "text": deleted_text,
            "age": user_age,
            "image": record.get('image') # Return image in response
        },
        "remaining": {
            "user_id": user_id,
            "age": user_age,
            "records_left": len(remaining_data),
            "records": remaining_data
        },
        "affected_shard": shard_id,
        "retrain_time": round(actual_sisa_time, 4)
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predicts label for input text using aggregated ensemble."""
    body = request.json
    text = body.get('text')
    
    if not text:
        return jsonify({"error": "Missing text"}), 400
        
    prediction, shard_predictions = sisa_engine.predict(text)
    
    if prediction is None:
        return jsonify({"error": "Models not trained yet"}), 503
        
    # Try to convert np.int64 to pure int for JSON serialization
    try:
        prediction = int(prediction)
        for k in shard_predictions:
            shard_predictions[k] = int(shard_predictions[k])
    except Exception:
        pass
        
    return jsonify({
        "final_prediction": prediction,
        "shard_predictions": shard_predictions
    })

@app.route('/api/user/<user_id>', methods=['GET'])
def get_user_data(user_id):
    """Retrieves user metadata (like age) for a given User ID."""
    user_id = str(user_id).strip()
    user_doc = users_collection.find_one({"user_id": user_id}, {"_id": 0})
    
    if not user_doc:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify(user_doc)

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard_metrics():
    """Returns overarching KPIs."""
    total_data = data_collection.count_documents({})
    
    shards = list(shards_metadata.find({}, {"_id": 0}))
    if not shards:
        # Initialize default shard status
        for i in range(NUM_SHARDS):
            shards.append({
                "shard_id": i,
                "status": "idle",
                "accuracy": 0,
                "data_count": 0
            })
            
    recent_logs = list(logs_collection.find({}, {"_id": 0}).sort("timestamp", -1).limit(10))
    for log in recent_logs:
        log['timestamp'] = log['timestamp'].isoformat()
        
    unlearn_metrics = list(metrics_collection.find({}, {"_id": 0}).sort("timestamp", -1))
    for metric in unlearn_metrics:
        metric['timestamp'] = metric['timestamp'].isoformat()
        
    # Calculate average accuracy
    valid_shards = [s for s in shards if s.get('accuracy', 0) > 0]
    avg_acc = sum([s['accuracy'] for s in valid_shards]) / len(valid_shards) if valid_shards else 0
    
    avg_time_saved = 0
    if unlearn_metrics:
        avg_time_saved = sum([m.get('time_saved_percent', 0) for m in unlearn_metrics]) / len(unlearn_metrics)
    # Fetch recent records for the Privacy Registry
    recent_records_cursor = data_collection.find({}, {"_id": 0, "user_id": 1, "data_id": 1, "age": 1, "text": 1, "image": 1, "shard_id": 1}).sort("created_at", -1).limit(50)
    recent_records = list(recent_records_cursor)

    return jsonify({
        "kpis": {
            "total_data": total_data,
            "shard_count": NUM_SHARDS,
            "overall_accuracy": round(avg_acc, 2),
            "avg_time_saved_percent": round(avg_time_saved, 2)
        },
        "shards": shards,
        "recent_logs": recent_logs,
        "performance_history": unlearn_metrics,
        "records": recent_records
    })

if __name__ == '__main__':
    # Create required directories
    os.makedirs(MODEL_DIR, exist_ok=True)
    # Ensure default metadata for shards exists
    if shards_metadata.count_documents({}) == 0:
        for i in range(NUM_SHARDS):
            shards_metadata.insert_one({
                "shard_id": i,
                "status": "idle",
                "accuracy": 0,
                "data_count": 0
            })
    app.run(debug=True, port=5000)
