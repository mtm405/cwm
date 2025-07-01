"""
Test Firebase connection with real credentials
"""
import logging
from config import get_config, setup_logging
from services.firebase_service import FirebaseService

def test_firebase_connection():
    """Test if Firebase connection works with real credentials"""
    
    # Setup logging
    config = get_config()
    setup_logging(config)
    logger = logging.getLogger(__name__)
    
    print("🔥 Testing Firebase Connection")
    print("=" * 40)
    
    try:
        # Initialize Firebase service
        firebase_service = FirebaseService(config.FIREBASE_CONFIG)
        
        if firebase_service.is_available():
            print("✅ Firebase connection successful!")
            print(f"📊 Project ID: {config.FIREBASE_CONFIG.get('project_id')}")
            
            # Test basic operations
            print("\n🧪 Testing basic operations...")
            
            # Test writing a document
            test_data = {
                'test': True,
                'timestamp': 'test_connection',
                'message': 'Firebase connection test successful'
            }
            
            # Try to write to a test collection
            try:
                test_ref = firebase_service.db.collection('test_connection').document('connection_test')
                test_ref.set(test_data)
                print("✅ Write operation successful")
                
                # Try to read it back
                doc = test_ref.get()
                if doc.exists:
                    print("✅ Read operation successful")
                    print(f"📄 Data: {doc.to_dict()}")
                    
                    # Clean up test document
                    test_ref.delete()
                    print("✅ Delete operation successful")
                else:
                    print("⚠️ Document not found after write")
                    
            except Exception as e:
                print(f"❌ Firebase operations failed: {str(e)}")
                return False
            
            print("\n🎉 All Firebase operations working correctly!")
            return True
            
        else:
            print("❌ Firebase connection failed")
            return False
            
    except Exception as e:
        print(f"❌ Firebase initialization failed: {str(e)}")
        return False

if __name__ == '__main__':
    success = test_firebase_connection()
    if success:
        print("\n✅ Firebase is ready for use!")
    else:
        print("\n❌ Firebase connection issues detected")
        print("Check your .env file and Firebase project settings")
