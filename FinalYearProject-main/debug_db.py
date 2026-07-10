from pymongo import MongoClient
import sys

client = MongoClient('mongodb://localhost:27017/')
db = client['sisa_project']
data_col = db['data']

target_user = 'nnn_4'
target_data = '31242bf7-7bb9-4753-a0cd-3bc6bc964645'

print(f"Total records in data: {data_col.count_documents({})}")

record = data_col.find_one({"user_id": target_user, "data_id": target_data})
if record:
    print(f"FOUND EXACT RECORD: {record}")
else:
    print("Exact record NOT found.")
    
# Search for similar user_id
similar_users = list(data_col.find({"user_id": {"$regex": f".*{target_user}.*"}}, {"_id":0, "user_id":1, "data_id":1}))
print(f"Similar user_id records: {similar_users}")

# Search for similar data_id
similar_data = list(data_col.find({"data_id": {"$regex": f".*{target_data}.*"}}, {"_id":0, "user_id":1, "data_id":1}))
print(f"Similar data_id records: {similar_data}")
