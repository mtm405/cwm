"""
Debug environment variables
"""
import os
from dotenv import load_dotenv

def debug_env():
    print("🔍 Environment Debug")
    print("=" * 30)
    
    # Load .env file
    load_dotenv()
    
    print(f"DEV_MODE from env: '{os.environ.get('DEV_MODE')}'")
    print(f"SECRET_KEY from env: '{os.environ.get('SECRET_KEY')[:20]}...'")
    print(f"FIREBASE_PROJECT_ID from env: '{os.environ.get('FIREBASE_PROJECT_ID')}'")
    
    # Test the conversion
    dev_mode_raw = os.environ.get('DEV_MODE', 'True')
    dev_mode_bool = dev_mode_raw.lower() == 'true'
    print(f"Raw DEV_MODE: '{dev_mode_raw}'")
    print(f"Converted to bool: {dev_mode_bool}")

if __name__ == '__main__':
    debug_env()
