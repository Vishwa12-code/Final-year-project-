import bcrypt
from pymongo import MongoClient
hashed = bcrypt.hashpw(b'password123', bcrypt.gensalt())
client = MongoClient('mongodb://localhost:27017/')
db = client['sisa_project']
db['accounts'].update_many({}, {'$set': {'password': hashed}})
print("Passwords updated!")
