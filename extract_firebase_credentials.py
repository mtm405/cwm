"""
Extract Firebase credentials from the downloaded JSON file and update .env
"""
import json
import os

def extract_firebase_credentials():
    """Extract credentials from Firebase JSON file"""
    
    # Path to your downloaded Firebase JSON file
    json_file_path = r"C:\Users\marco.morais\Downloads\code-with-morais-405-firebase-adminsdk-fbsvc-a683ead014.json"
    
    if not os.path.exists(json_file_path):
        print(f"❌ Firebase JSON file not found at: {json_file_path}")
        return None
    
    try:
        with open(json_file_path, 'r') as f:
            firebase_data = json.load(f)
        
        # Extract the credentials
        credentials = {
            'FIREBASE_TYPE': firebase_data.get('type', 'service_account'),
            'FIREBASE_PROJECT_ID': firebase_data.get('project_id'),
            'FIREBASE_PRIVATE_KEY_ID': firebase_data.get('private_key_id'),
            'FIREBASE_PRIVATE_KEY': firebase_data.get('private_key', '').replace('\n', '\\n'),
            'FIREBASE_CLIENT_EMAIL': firebase_data.get('client_email'),
            'FIREBASE_CLIENT_ID': firebase_data.get('client_id'),
            'FIREBASE_AUTH_URI': firebase_data.get('auth_uri'),
            'FIREBASE_TOKEN_URI': firebase_data.get('token_uri'),
            'FIREBASE_AUTH_PROVIDER_X509_CERT_URL': firebase_data.get('auth_provider_x509_cert_url'),
            'FIREBASE_CLIENT_X509_CERT_URL': firebase_data.get('client_x509_cert_url'),
            'FIREBASE_UNIVERSE_DOMAIN': firebase_data.get('universe_domain', 'googleapis.com')
        }
        
        print("✅ Successfully extracted Firebase credentials!")
        print(f"📧 Client Email: {credentials['FIREBASE_CLIENT_EMAIL']}")
        print(f"🆔 Project ID: {credentials['FIREBASE_PROJECT_ID']}")
        
        return credentials
        
    except Exception as e:
        print(f"❌ Error reading Firebase JSON: {str(e)}")
        return None

def update_env_file(credentials):
    """Update .env file with real Firebase credentials"""
    
    env_file_path = ".env"
    
    try:
        # Read current .env file
        with open(env_file_path, 'r') as f:
            env_content = f.read()
        
        # Replace placeholder values with real credentials
        replacements = {
            'FIREBASE_PRIVATE_KEY_ID=your-private-key-id-here': f'FIREBASE_PRIVATE_KEY_ID={credentials["FIREBASE_PRIVATE_KEY_ID"]}',
            'FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nyour-private-key-here\\n-----END PRIVATE KEY-----"': f'FIREBASE_PRIVATE_KEY="{credentials["FIREBASE_PRIVATE_KEY"]}"',
            'FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@code-with-morais-405.iam.gserviceaccount.com': f'FIREBASE_CLIENT_EMAIL={credentials["FIREBASE_CLIENT_EMAIL"]}',
            'FIREBASE_CLIENT_ID=your-client-id-here': f'FIREBASE_CLIENT_ID={credentials["FIREBASE_CLIENT_ID"]}',
            'FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xyz%40code-with-morais-405.iam.gserviceaccount.com': f'FIREBASE_CLIENT_X509_CERT_URL={credentials["FIREBASE_CLIENT_X509_CERT_URL"]}'
        }
        
        # Apply replacements
        for old_value, new_value in replacements.items():
            env_content = env_content.replace(old_value, new_value)
        
        # Write updated content back to .env
        with open(env_file_path, 'w') as f:
            f.write(env_content)
        
        print("✅ Successfully updated .env file with real Firebase credentials!")
        return True
        
    except Exception as e:
        print(f"❌ Error updating .env file: {str(e)}")
        return False

def main():
    print("🔑 Extracting Firebase Admin SDK Credentials")
    print("=" * 50)
    
    # Extract credentials from JSON
    credentials = extract_firebase_credentials()
    
    if not credentials:
        print("❌ Failed to extract credentials")
        return False
    
    # Update .env file
    success = update_env_file(credentials)
    
    if success:
        print("\n🎉 Firebase credentials successfully configured!")
        print("✅ Your .env file now contains real Firebase credentials")
        print("✅ Ready to connect to Firebase!")
        
        # Clean up - remove the JSON file for security
        json_file_path = r"C:\Users\marco.morais\Downloads\code-with-morais-405-firebase-adminsdk-fbsvc-a683ead014.json"
        try:
            os.remove(json_file_path)
            print("🗑️ Removed Firebase JSON file for security")
        except:
            print("⚠️ Please manually delete the Firebase JSON file from Downloads for security")
        
        return True
    else:
        print("❌ Failed to update .env file")
        return False

if __name__ == '__main__':
    main()
