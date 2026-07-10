import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from collections import Counter

class SISALearningEngine:
    def __init__(self, num_shards=5, model_dir='models'):
        self.num_shards = num_shards
        self.model_dir = model_dir
        os.makedirs(self.model_dir, exist_ok=True)
        
        # We use a shared vectorizer for simplicity in this demo,
        # In a strict SISA, vectorization vocabulary could also be sharded, 
        # but shared feature space is standard. We will fit it lazily.
        self.global_vectorizer = TfidfVectorizer(max_features=5000)
        self.vectorizer_fitted = False
        
        self.models = {}
        self.load_models()
        self.avg_shard_speed = 0.001 # Default metric

    def _get_model_path(self, shard_id):
        return os.path.join(self.model_dir, f'shard_{shard_id}_model.pkl')
        
    def _get_vectorizer_path(self):
        return os.path.join(self.model_dir, 'global_vectorizer.pkl')

    def load_models(self):
        """Loads all existing shard models from disk."""
        if os.path.exists(self._get_vectorizer_path()):
            self.global_vectorizer = joblib.load(self._get_vectorizer_path())
            self.vectorizer_fitted = True
            
        for i in range(self.num_shards):
            path = self._get_model_path(i)
            if os.path.exists(path):
                self.models[i] = joblib.load(path)

    def train_shard(self, shard_id, texts, labels):
        """Retrains a single shard entirely from scratch (SISA isolation)."""
        if len(texts) < 1:
            return 0.0 # Not enough data to train anything meaningful
            
        # Fit vectorizer if not fully fitted (simplification for the demo)
        # In production, we might update vocabulary, but Tfidf requires full corpus or a fixed hashing vectorizer
        if not self.vectorizer_fitted:
            X = self.global_vectorizer.fit_transform(texts)
            joblib.dump(self.global_vectorizer, self._get_vectorizer_path())
            self.vectorizer_fitted = True
        else:
            # Safely transform
            try:
                X = self.global_vectorizer.transform(texts)
            except ValueError:
                # Fallback if vocabulary mismatch (unlikely if vectorizer is properly saved, but just in case)
                X = self.global_vectorizer.fit_transform(texts)
                joblib.dump(self.global_vectorizer, self._get_vectorizer_path())

        y = np.array(labels)
        
        # Split for internal validation
        if X.shape[0] > 5:
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        else:
            X_train, X_test, y_train, y_test = X, X, y, y

        # Train a new isolated model for this shard
        model = SGDClassifier(loss='log_loss', max_iter=1000, random_state=42)
        
        # Fit from scratch (SISA requires complete retraining of the shard)
        model.fit(X_train, y_train)
        
        # Evaluate
        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)

        # Save model
        self.models[shard_id] = model
        joblib.dump(model, self._get_model_path(shard_id))
        
        # Mocking an average speed metric for comparison calculations
        # In reality, this would keep a running average of (num_records / time_taken)
        return acc

    def clear_shard(self, shard_id):
        """Removes a model if its shard is emptied."""
        if shard_id in self.models:
            del self.models[shard_id]
        if os.path.exists(self._get_model_path(shard_id)):
            os.remove(self._get_model_path(shard_id))

    def predict(self, text):
        """Predicts using ensemble of all trained shards."""
        if not self.vectorizer_fitted or not self.models:
            return None, {}
            
        X = self.global_vectorizer.transform([text])
        
        shard_predictions = {}
        votes = []
        
        for shard_id, model in self.models.items():
            pred = model.predict(X)[0]
            shard_predictions[shard_id] = pred
            votes.append(pred)
            
        if not votes:
            return None, {}
            
        # Majority vote aggregation
        vote_counts = Counter(votes)
        final_prediction = vote_counts.most_common(1)[0][0]
        
        return final_prediction, shard_predictions
        
    def get_avg_shard_speed(self):
        # A mocked constant speed for performance graph generation
        # Represents how many records are processed per second on average
        return 5000.0  
