import os
import environ
from pathlib import Path
import requests

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(
    DEBUG=(bool, False)
)
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

def verify_mail(email):
    api_key = env('API_KEY')
    url = f"https://api.zeruh.com/v1/verify?api_key={api_key}&email_address={email}"
    
    response = requests.get(url)
    data = response.json()
    
    if response.status_code == 200 and data.get('success') == True:
        verification_result = data.get('result', {})
        if verification_result.get('status') == 'deliverable':
            print("Email is valid")
            return True
        else:
            print("Email is not valid")
            return False