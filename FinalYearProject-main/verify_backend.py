import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_user_lookup():
    print("Testing User Lookup Feature...")
    
    # 1. Add data with a specific User ID and Age
    test_user_id = "TEST-USER-123"
    test_age = 35
    payload = {
        "text": "This is a test sentence for sentiment analysis.",
        "label": 1,
        "user_id": test_user_id,
        "age": test_age
    }
    
    print(f"Adding data for user {test_user_id} with age {test_age}...")
    res = requests.post(f"{BASE_URL}/api/data", json=payload)
    if res.status_code != 200:
        print(f"Failed to add data: {res.text}")
        return
    
    print("Data added successfully.")
    
    # 2. Retrieve user info via the new endpoint
    print(f"Retrieving info for user {test_user_id}...")
    res = requests.get(f"{BASE_URL}/api/user/{test_user_id}")
    if res.status_code != 200:
        print(f"Failed to retrieve user info: {res.text}")
        return
    
    data = res.json()
    print(f"Retrieved data: {json.dumps(data, indent=2)}")
    
    if data.get("age") == test_age:
        print("Success! The retrieved age matches the input age.")
    else:
        print(f"Failure! Expected age {test_age}, but got {data.get('age')}.")

if __name__ == "__main__":
    try:
        test_user_lookup()
    except Exception as e:
        print(f"An error occurred: {e}")
