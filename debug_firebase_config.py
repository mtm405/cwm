"""
Debug Firebase configuration
"""
from config import get_config

def debug_firebase_config():
    config = get_config()
    
    print("🔍 Firebase Configuration Debug")
    print("=" * 40)
    print(f"DEV_MODE: {config.DEV_MODE}")
    print(f"Project ID: {config.FIREBASE_CONFIG.get('project_id')}")
    print(f"Client Email: {config.FIREBASE_CONFIG.get('client_email')}")
    print(f"Has Private Key: {'private_key' in config.FIREBASE_CONFIG and bool(config.FIREBASE_CONFIG.get('private_key'))}")
    
    # Check validation
    valid = config.validate_firebase_config()
    print(f"Config Valid: {valid}")
    
    if not valid:
        print("\n❌ Missing fields:")
        required_fields = [
            'project_id', 'private_key_id', 'private_key', 
            'client_email', 'client_id'
        ]
        
        for field in required_fields:
            value = config.FIREBASE_CONFIG.get(field)
            print(f"  {field}: {'✅' if value else '❌'} ({type(value).__name__})")

if __name__ == '__main__':
    debug_firebase_config()
