import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the API key
api_key = os.getenv("DEEPSEEK_API_KEY")

if not api_key:
    print("ERROR: DEEPSEEK_API_KEY not found in .env file.")
else:
    print(f"API Key found: ...{api_key[-4:]}") # Print last 4 chars for verification
    print("Attempting to connect to DeepSeek API...")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "user", "content": "Hello"}
        ]
    }

    try:
        response = requests.post(
            "https://api.deepseek.com/chat/completions",
            headers=headers,
            json=payload,
            timeout=20  # Add a timeout of 20 seconds
        )

        # Check the response
        if response.status_code == 200:
            print("\nSUCCESS: Successfully connected to the API and received a response.")
            print("Response:", response.json())
        else:
            print(f"\nERROR: API call failed with status code: {response.status_code}")
            print("Response Body:", response.text)

    except requests.exceptions.RequestException as e:
        print(f"\nFATAL ERROR: A network error occurred.")
        print(f"This could be a firewall issue or a problem with your internet connection.")
        print(f"Error details: {e}")