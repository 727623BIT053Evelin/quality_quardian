import requests
import pandas as pd
import os

# Create a dummy CSV
dummy_path = os.path.abspath("test_data.csv")
df = pd.DataFrame({
    'name': ['Alice', 'Bob', 'Charlie', None],
    'age': [25, 30, 35, 40],
    'email': ['alice@example.com', 'bob', 'charlie@example.com', 'dave@example.com'],
    'phone': ['123-456-7890', '987-654-3210', None, '555-555-5555']
})
df.to_csv(dummy_path, index=False)

url = 'http://localhost:5000/process'
payload = {'filepath': dummy_path}

try:
    print(f"Sending POST request to {url} with {dummy_path}...")
    response = requests.post(url, json=payload)
    
    print(f"Status Code: {response.status_code}")
    try:
        print("Response JSON:", response.json())
    except:
        print("Response Content:", response.text)
except Exception as e:
    print(f"Request failed: {e}")
