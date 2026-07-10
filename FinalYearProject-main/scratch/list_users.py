from pymongo import MongoClient
client = MongoClient('mongodb://localhost:27017/')
db = client['sisa_project']
users = db['accounts'].find({}, {'_id': 0, 'email': 1})
for user in users:
    print(user['email'])
