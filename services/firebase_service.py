"""
Secure Firebase service with proper error handling and logging.
"""
import logging
import firebase_admin
from firebase_admin import credentials, firestore, auth
from typing import Optional, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class FirebaseService:
    """Secure Firebase service with comprehensive error handling."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize Firebase service with configuration."""
        self.config = config
        self.db: Optional[firestore.Client] = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase with proper error handling."""
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                self.db = firestore.client()
                logger.info("Using existing Firebase app")
                return
            
            # Try to use service account key file first
            import os
            service_key_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'serviceAccountKey.json')
            
            if os.path.exists(service_key_path):
                logger.info(f"Using service account key file: {service_key_path}")
                cred = credentials.Certificate(service_key_path)
                firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                logger.info("Firebase initialized successfully with service account key file")
                return
            
            # Fallback to environment variables
            if not self._validate_config():
                raise ValueError("Invalid Firebase configuration")
            
            # Initialize Firebase with environment variables
            cred = credentials.Certificate(self.config)
            firebase_admin.initialize_app(cred, {
                'projectId': self.config.get('project_id')
            })
            self.db = firestore.client()
            
            logger.info("Firebase initialized successfully with environment variables")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            self.db = None
            # Don't raise in production - allow graceful degradation
            if not self.config.get('project_id') and not os.path.exists(service_key_path):
                logger.warning("Firebase configuration missing - running in offline mode")
            else:
                raise
    
    def _validate_config(self) -> bool:
        """Validate Firebase configuration."""
        required_fields = [
            'type', 'project_id', 'private_key_id', 'private_key',
            'client_email', 'client_id', 'auth_uri', 'token_uri'
        ]
        
        for field in required_fields:
            if not self.config.get(field):
                logger.error(f"Missing required Firebase config field: {field}")
                return False
        return True
    
    def is_available(self) -> bool:
        """Check if Firebase service is available."""
        return self.db is not None
    
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user data with error handling."""
        if not self.is_available():
            logger.warning("Firebase not available, cannot get user")
            return None
        
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                logger.debug(f"Retrieved user data for {user_id}")
                return user_doc.to_dict()
            else:
                logger.info(f"User {user_id} not found")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving user {user_id}: {str(e)}")
            return None
    
    def update_user(self, user_id: str, data: Dict[str, Any]) -> bool:
        """Update user data with validation and error handling."""
        if not self.is_available():
            logger.warning("Firebase not available, cannot update user")
            return False
        
        try:
            # Validate data
            if not isinstance(data, dict):
                logger.error("User data must be a dictionary")
                return False
            
            # Add timestamp
            data['updated_at'] = datetime.now()
            
            user_ref = self.db.collection('users').document(user_id)
            user_ref.update(data)
            
            logger.info(f"Updated user {user_id} with {len(data)} fields")
            return True
            
        except Exception as e:
            logger.error(f"Error updating user {user_id}: {str(e)}")
            return False
    
    def create_user(self, user_id: str, user_data: Dict[str, Any]) -> bool:
        """Create new user with validation."""
        if not self.is_available():
            logger.warning("Firebase not available, cannot create user")
            return False
        
        try:
            # Add metadata
            user_data.update({
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            })
            
            user_ref = self.db.collection('users').document(user_id)
            user_ref.set(user_data)
            
            logger.info(f"Created user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating user {user_id}: {str(e)}")
            return False
      def save_quiz_result(self, user_id: str, quiz_id: str, result: Dict[str, Any]) -> bool:
        """Save quiz result with validation."""
        if not self.is_available():
            logger.warning("Firebase not available, cannot save quiz result")
            return False
        
        try:
            result_data = {
                'quiz_id': quiz_id,
                'user_id': user_id,
                'timestamp': datetime.now(),
                **result
            }
            
            # Save to quiz_results collection
            self.db.collection('quiz_results').add(result_data)
            
            # Update user's quiz scores
            user_ref = self.db.collection('users').document(user_id)
            user_ref.update({
                f'quiz_scores.{quiz_id}': result.get('score', 0)
            })
            
            logger.info(f"Saved quiz result for user {user_id}, quiz {quiz_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving quiz result: {str(e)}")
            return False
        
    def save_quiz_result_by_id(self, result_id: str, result_data: Dict[str, Any]) -> bool:
        """Save quiz result with result ID and data"""
        if not self.is_available():
            logger.warning("Firebase not available, cannot save quiz result")
            return False
        
        try:
            # Save to quiz_results collection with specified ID
            self.db.collection('quiz_results').document(result_id).set(result_data)
            logger.info(f"Saved quiz result with ID: {result_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving quiz result: {str(e)}")
            return False
    
    def get_lesson(self, lesson_id: str) -> Optional[Dict[str, Any]]:
        """Get lesson from Firebase"""
        if not self.is_available():
            logger.warning("Firebase not available for lesson retrieval")
            return None
            
        try:
            lesson_ref = self.db.collection('lessons').document(lesson_id)
            lesson_doc = lesson_ref.get()
            
            if lesson_doc.exists:
                lesson_data = lesson_doc.to_dict()
                lesson_data['id'] = lesson_doc.id  # Ensure ID is included
                logger.debug(f"Retrieved lesson {lesson_id} from Firebase")
                return lesson_data
            else:
                logger.info(f"Lesson {lesson_id} not found in Firebase")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving lesson {lesson_id}: {str(e)}")
            return None
    
    def get_all_lessons(self) -> list:
        """Get all lessons from Firebase"""
        if not self.is_available():
            logger.warning("Firebase not available for lessons retrieval")
            return []
        
        try:
            lessons = []
            lessons_ref = self.db.collection('lessons')
            
            # Order by 'order' field if it exists
            query = lessons_ref.order_by('order')
            
            for doc in query.stream():
                lesson_data = doc.to_dict()
                lesson_data['id'] = doc.id
                lessons.append(lesson_data)
            
            logger.debug(f"Retrieved {len(lessons)} lessons from Firebase")
            return lessons
            
        except Exception as e:
            logger.error(f"Error retrieving lessons: {str(e)}")
            return []
    
    def save_lesson(self, lesson_id: str, lesson_data: Dict[str, Any]) -> bool:
        """Save lesson to Firebase"""
        if not self.is_available():
            logger.warning("Firebase not available for lesson save")
            return False
        
        try:
            # Add metadata
            lesson_data.update({
                'updated_at': datetime.now(),
                'id': lesson_id
            })
            
            lesson_ref = self.db.collection('lessons').document(lesson_id)
            lesson_ref.set(lesson_data)
            
            logger.info(f"Lesson {lesson_id} saved successfully to Firebase")
            return True
            
        except Exception as e:
            logger.error(f"Error saving lesson {lesson_id}: {str(e)}")
            return False
    
    def get_quiz(self, quiz_id: str) -> Optional[Dict[str, Any]]:
        """Get quiz from Firebase"""
        if not self.is_available():
            logger.warning("Firebase not available for quiz retrieval")
            return None
            
        try:
            quiz_ref = self.db.collection('quizzes').document(quiz_id)
            quiz_doc = quiz_ref.get()
            
            if quiz_doc.exists:
                quiz_data = quiz_doc.to_dict()
                quiz_data['id'] = quiz_doc.id
                logger.debug(f"Retrieved quiz {quiz_id} from Firebase")
                return quiz_data
            else:
                logger.info(f"Quiz {quiz_id} not found in Firebase")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving quiz {quiz_id}: {str(e)}")
            return None
    
    def save_quiz(self, quiz_id: str, quiz_data: Dict[str, Any]) -> bool:
        """Save quiz to Firebase"""
        if not self.is_available():
            logger.warning("Firebase not available for quiz save")
            return False
        
        try:
            quiz_data.update({
                'updated_at': datetime.now(),
                'id': quiz_id
            })
            
            quiz_ref = self.db.collection('quizzes').document(quiz_id)
            quiz_ref.set(quiz_data)
            
            logger.info(f"Quiz {quiz_id} saved successfully to Firebase")
            return True
            
        except Exception as e:
            logger.error(f"Error saving quiz {quiz_id}: {str(e)}")
            return False
    
    def get_user_dashboard_data(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive user dashboard data."""
        if not self.is_available():
            logger.warning("Firebase not available, cannot get user dashboard data")
            return {}
        
        try:
            user_data = self.get_user(user_id) or {}
            
            # Calculate derived values
            if user_data:
                user_data['current_streak'] = self._calculate_streak(user_data)
                user_data['lessons_completed'] = user_data.get('lessons_completed', [])
                user_data['total_lessons'] = 10  # You can make this dynamic
                user_data['progress_percentage'] = (len(user_data.get('lessons_completed', [])) / 10) * 100
                
            return user_data
            
        except Exception as e:
            logger.error(f"Error getting user dashboard data: {str(e)}")
            return {}
    
    def _calculate_streak(self, user_data: Dict[str, Any]) -> int:
        """Calculate user's current learning streak."""
        try:
            # Get user's recent activities
            activities = self.get_user_activities(user_data.get('uid', ''), limit=30)
            if not activities:
                return 0
            
            from datetime import datetime, timedelta
            
            current_date = datetime.now().date()
            streak = 0
            check_date = current_date
            
            # Group activities by date
            activity_dates = set()
            for activity in activities:
                if activity.get('timestamp'):
                    # Handle both Firestore timestamp and datetime objects
                    activity_date = activity['timestamp']
                    if hasattr(activity_date, 'date'):
                        activity_dates.add(activity_date.date())
                    elif isinstance(activity_date, str):
                        try:
                            parsed_date = datetime.fromisoformat(activity_date.replace('Z', '+00:00'))
                            activity_dates.add(parsed_date.date())
                        except:
                            continue
            
            # Calculate streak
            while check_date in activity_dates:
                streak += 1
                check_date -= timedelta(days=1)
                
                # Prevent infinite loops
                if streak > 365:
                    break
            
            return streak
            
        except Exception as e:
            logger.error(f"Error calculating streak: {str(e)}")
            return 0
    
    def get_user_activities(self, user_id: str, limit: int = 10) -> list:
        """Get user's recent activities."""
        if not self.is_available():
            logger.warning("Firebase not available, cannot get user activities")
            return []
        
        try:
            activities_ref = self.db.collection('activities')
            query = activities_ref.where('user_id', '==', user_id).order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit)
            
            activities = []
            for doc in query.stream():
                activity_data = doc.to_dict()
                activity_data['id'] = doc.id
                activities.append(activity_data)
            
            logger.debug(f"Retrieved {len(activities)} activities for user {user_id}")
            return activities
            
        except Exception as e:
            logger.error(f"Error retrieving user activities: {str(e)}")
            return []
    
    def get_leaderboard(self, limit: int = 10) -> list:
        """Get global leaderboard."""
        if not self.is_available():
            logger.warning("Firebase not available, cannot get leaderboard")
            return []
        
        try:
            users_ref = self.db.collection('users')
            query = users_ref.order_by('xp', direction=firestore.Query.DESCENDING).limit(limit)
            
            leaderboard = []
            for doc in query.stream():
                user_data = doc.to_dict()
                user_data['uid'] = doc.id
                # Only include necessary fields for leaderboard
                leaderboard_entry = {
                    'uid': user_data.get('uid'),
                    'username': user_data.get('username', user_data.get('display_name', 'Anonymous')),
                    'display_name': user_data.get('display_name', user_data.get('username', 'Anonymous')),
                    'xp': user_data.get('xp', 0),
                    'level': user_data.get('level', 1),
                    'profile_picture': user_data.get('profile_picture', '')
                }
                leaderboard.append(leaderboard_entry)
            
            logger.debug(f"Retrieved leaderboard with {len(leaderboard)} users")
            return leaderboard
            
        except Exception as e:
            logger.error(f"Error retrieving leaderboard: {str(e)}")
            return []
    
    def get_daily_challenge(self, date_str: str = None) -> Optional[Dict[str, Any]]:
        """Get daily challenge for a specific date."""
        if not self.is_available():
            logger.warning("Firebase not available, cannot get daily challenge")
            return None
        
        try:
            from datetime import datetime
            
            if date_str is None:
                date_str = datetime.now().strftime('%Y-%m-%d')
            
            # Direct document fetch by ID (date) instead of query
            challenge_ref = self.db.collection('daily_challenges').document(date_str)
            challenge = challenge_ref.get()
            
            if challenge.exists:
                challenge_data = challenge.to_dict()
                challenge_data['id'] = challenge.id
                logger.debug(f"Found daily challenge for {date_str}")
                return challenge_data
            else:
                logger.info(f"No daily challenge found for {date_str}")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving daily challenge: {str(e)}")
            return None
    
    def get_server_timestamp(self):
        """Get Firebase server timestamp."""
        if not self.is_available():
            return datetime.now()
        return firestore.SERVER_TIMESTAMP
    
    def verify_id_token(self, id_token: str) -> Optional[Dict[str, Any]]:
        """Verify Firebase ID token and return decoded claims."""
        try:
            if not self.is_available():
                logger.warning("Firebase not available, cannot verify token")
                return None
            
            decoded_token = auth.verify_id_token(id_token)
            logger.info(f"Token verified for user: {decoded_token.get('email', 'unknown')}")
            return decoded_token
            
        except Exception as e:
            logger.error(f"Error verifying ID token: {str(e)}")
            return None
    
    def create_user_if_not_exists(self, user_id: str, user_data: Dict[str, Any]) -> bool:
        """Create user only if they don't already exist."""
        if not self.is_available():
            return False
        
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                # Update last login
                user_ref.update({
                    'last_login': self.get_server_timestamp()
                })
                logger.info(f"Updated existing user login: {user_id}")
                return True
            else:
                # Create new user
                user_data.update({
                    'created_at': self.get_server_timestamp(),
                    'updated_at': self.get_server_timestamp(),
                    'last_login': self.get_server_timestamp()
                })
                user_ref.set(user_data)
                logger.info(f"Created new user: {user_id}")
                return True
                
        except Exception as e:
            logger.error(f"Error creating/updating user {user_id}: {str(e)}")
            return False
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email address."""
        if not self.is_available():
            logger.warning("Firebase not available, cannot get user by email")
            return None
        
        try:
            users_ref = self.db.collection('users')
            query = users_ref.where('email', '==', email).limit(1)
            docs = list(query.stream())
            
            if docs:
                user_data = docs[0].to_dict()
                user_data['uid'] = docs[0].id
                logger.debug(f"Found user by email: {email}")
                return user_data
            else:
                logger.info(f"No user found with email: {email}")
                return None
                
        except Exception as e:
            logger.error(f"Error getting user by email {email}: {str(e)}")
            return None
    
    def create_user_from_google(self, user_id: str, google_user_info: Dict[str, Any]) -> bool:
        """Create user from Google OAuth data."""
        if not self.is_available():
            logger.warning("Firebase not available, cannot create user from Google")
            return False
        
        try:
            # Extract user data from Google info
            full_name = google_user_info.get('name', '')
            name_parts = full_name.split(' ') if full_name else []
            first_name = name_parts[0] if name_parts else ''
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            user_data = {
                'uid': user_id,
                'email': google_user_info.get('email'),
                'username': google_user_info.get('name', '').replace(' ', '').lower() or google_user_info.get('email', '').split('@')[0],
                'display_name': full_name,
                'first_name': first_name,
                'last_name': last_name,
                'profile_picture': google_user_info.get('picture', ''),
                'email_verified': google_user_info.get('email_verified', False),
                'auth_provider': 'google',
                'is_admin': False,
                'xp': 0,
                'level': 1,
                'pycoins': 100,  # Welcome bonus
                'streak': 0,
                'lesson_progress': {},
                'quiz_scores': {},
                'achievements': [],
                'settings': {
                    'theme': 'dark',
                    'notifications': True
                },
                'created_at': self.get_server_timestamp(),
                'updated_at': self.get_server_timestamp(),
                'last_login': self.get_server_timestamp()
            }
            
            # Create user document
            user_ref = self.db.collection('users').document(user_id)
            user_ref.set(user_data)
            
            logger.info(f"Created user from Google OAuth: {google_user_info.get('email')}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating user from Google data: {str(e)}")
            return False
    
    def is_user_admin(self, user_id: str) -> bool:
        """Check if user has admin privileges."""
        if not self.is_available():
            return False
        
        try:
            user_data = self.get_user(user_id)
            if user_data:
                return user_data.get('is_admin', False)
            return False
            
        except Exception as e:
            logger.error(f"Error checking admin status for {user_id}: {str(e)}")
            return False
    
    def set_user_admin(self, user_id: str, is_admin: bool) -> bool:
        """Set user admin status."""
        if not self.is_available():
            return False
        
        try:
            user_ref = self.db.collection('users').document(user_id)
            user_ref.update({
                'is_admin': is_admin,
                'updated_at': self.get_server_timestamp()
            })
            
            logger.info(f"Set admin status for {user_id}: {is_admin}")
            return True
            
        except Exception as e:
            logger.error(f"Error setting admin status: {str(e)}")
            return False
    
    def save_announcement(self, announcement_data: Dict[str, Any]) -> bool:
        """Save announcement to Firebase."""
        if not self.is_available():
            return False
        
        try:
            announcement_data.update({
                'created_at': self.get_server_timestamp(),
                'updated_at': self.get_server_timestamp()
            })
            
            self.db.collection('announcements').add(announcement_data)
            logger.info("Announcement saved successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error saving announcement: {str(e)}")
            return False
    
    def get_latest_announcement(self) -> Optional[Dict[str, Any]]:
        """Get the latest announcement."""
        if not self.is_available():
            return None
        
        try:
            announcements_ref = self.db.collection('announcements')
            query = announcements_ref.order_by('created_at', direction=firestore.Query.DESCENDING).limit(1)
            docs = list(query.stream())
            
            if docs:
                announcement_data = docs[0].to_dict()
                announcement_data['id'] = docs[0].id
                return announcement_data
            return None
            
        except Exception as e:
            logger.error(f"Error getting latest announcement: {str(e)}")
            return None
    
    def update_user_rewards(self, user_id: str, xp_gained: int, coins_gained: int) -> bool:
        """Update user's total XP and PyCoins"""
        try:
            if not self._validate_user_id(user_id):
                return False
            
            user_ref = self.db.collection('users').document(user_id)
            
            # Use atomic transaction to ensure consistency
            @firestore.transactional
            def update_in_transaction(transaction):
                user_doc = transaction.get(user_ref)
                
                if user_doc.exists:
                    current_data = user_doc.to_dict()
                    current_xp = current_data.get('total_xp', 0)
                    current_coins = current_data.get('pycoins', 0)
                    
                    # Calculate new totals
                    new_xp = current_xp + xp_gained
                    new_coins = current_coins + coins_gained
                    
                    # Calculate level from XP
                    new_level = self._calculate_level(new_xp)
                    current_level = self._calculate_level(current_xp)
                    
                    update_data = {
                        'total_xp': new_xp,
                        'pycoins': new_coins,
                        'level': new_level,
                        'last_reward_update': firestore.SERVER_TIMESTAMP
                    }
                    
                    # Check for level up
                    if new_level > current_level:
                        update_data['level_up_timestamp'] = firestore.SERVER_TIMESTAMP
                        logger.info(f"User {user_id} leveled up to level {new_level}")
                    
                    transaction.update(user_ref, update_data)
                    
                    logger.info(f"Updated rewards for user {user_id}: +{xp_gained} XP, +{coins_gained} coins")
                    return True
                else:
                    logger.error(f"User {user_id} not found for reward update")
                    return False
            
            # Execute transaction
            transaction = self.db.transaction()
            return update_in_transaction(transaction)
            
        except Exception as e:
            logger.error(f"Error updating user rewards: {str(e)}")
            return False
    
    def _calculate_level(self, total_xp: int) -> int:
        """Calculate user level based on total XP"""
        # Level calculation: level = floor(sqrt(xp/100)) + 1
        # This means: Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
        import math
        if total_xp < 100:
            return 1
        return int(math.sqrt(total_xp / 100)) + 1

# Legacy support functions for backward compatibility
# TODO: Remove in Phase 2
db = None

def initialize_firebase():
    """Legacy function - use FirebaseService class instead."""
    logger.warning("Using deprecated initialize_firebase function")
    return None

# Create a global firebase_service instance for backward compatibility
firebase_service = None

def get_firebase_service():
    """Get the global firebase service instance."""
    return firebase_service

def set_firebase_service(service):
    """Set the global firebase service instance."""
    global firebase_service
    firebase_service = service
