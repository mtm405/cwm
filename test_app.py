"""
Simple test app with direct Firebase initialization
"""
import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from services.firebase_service import FirebaseService

# Load environment variables
load_dotenv()

# Create simple Flask app
app = Flask(__name__)

# Get Firebase config directly from environment
firebase_config = {
    "type": os.environ.get('FIREBASE_TYPE'),
    "project_id": os.environ.get('FIREBASE_PROJECT_ID'),
    "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
    "private_key": os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
    "client_email": os.environ.get('FIREBASE_CLIENT_EMAIL'),
    "client_id": os.environ.get('FIREBASE_CLIENT_ID'),
    "auth_uri": os.environ.get('FIREBASE_AUTH_URI'),
    "token_uri": os.environ.get('FIREBASE_TOKEN_URI'),
    "auth_provider_x509_cert_url": os.environ.get('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
    "client_x509_cert_url": os.environ.get('FIREBASE_CLIENT_X509_CERT_URL'),
    "universe_domain": os.environ.get('FIREBASE_UNIVERSE_DOMAIN', 'googleapis.com')
}

# Initialize Firebase
firebase_service = FirebaseService(firebase_config)

@app.route('/test')
def test():
    """Test Firebase connection"""
    if firebase_service.is_available():
        # Try to get lessons from Firebase
        try:
            lessons_ref = firebase_service.db.collection('lessons')
            lessons = []
            for doc in lessons_ref.stream():
                lesson_data = doc.to_dict()
                lesson_data['id'] = doc.id
                lessons.append(lesson_data)
            
            return jsonify({
                'status': 'success',
                'firebase_connected': True,
                'lessons_count': len(lessons),
                'lessons': lessons
            })
        except Exception as e:
            return jsonify({
                'status': 'error',
                'firebase_connected': True,
                'error': str(e)
            })
    else:
        return jsonify({
            'status': 'error',
            'firebase_connected': False,
            'error': 'Firebase not available'
        })

@app.route('/health')
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy',
        'firebase_available': firebase_service.is_available(),
        'dev_mode': os.environ.get('DEV_MODE', 'True')
    })

if __name__ == '__main__':
    print(f"🚀 Starting test app...")
    print(f"📊 Firebase available: {firebase_service.is_available()}")
    print(f"🔧 DEV_MODE: {os.environ.get('DEV_MODE')}")
    
    app.run(host='0.0.0.0', port=8081, debug=True)
