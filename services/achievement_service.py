from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid
import asyncio
from models.user_profile import Achievement, UserStats, UserActivity
from services.firebase_service import firebase_service

class AchievementService:
    """Service for managing user achievements and gamification"""
    
    def __init__(self):
        self.achievement_definitions = self._load_achievement_definitions()
    
    def _load_achievement_definitions(self) -> Dict[str, Achievement]:
        """Load achievement definitions"""
        achievements = {
            # Learning Milestones
            'first_lesson': Achievement(
                id='first_lesson',
                name='First Steps',
                description='Complete your first lesson',
                icon='🎓',
                category='learning',
                rarity='common',
                points=10,
                requirement={'lesson_completed': 1},
                max_progress=1
            ),
            'lesson_master': Achievement(
                id='lesson_master',
                name='Lesson Master',
                description='Complete 10 lessons',
                icon='📚',
                category='learning',
                rarity='uncommon',
                points=50,
                requirement={'lessons_completed': 10},
                max_progress=10
            ),
            'python_graduate': Achievement(
                id='python_graduate',
                name='Python Graduate',
                description='Complete 50 lessons',
                icon='🐍',
                category='learning',
                rarity='rare',
                points=200,
                requirement={'lessons_completed': 50},
                max_progress=50
            ),
            
            # Quiz Achievements
            'quiz_novice': Achievement(
                id='quiz_novice',
                name='Quiz Novice',
                description='Complete your first quiz',
                icon='❓',
                category='quiz',
                rarity='common',
                points=15,
                requirement={'quiz_completed': 1},
                max_progress=1
            ),
            'perfect_score': Achievement(
                id='perfect_score',
                name='Perfect Score',
                description='Get 100% on a quiz',
                icon='💯',
                category='quiz',
                rarity='uncommon',
                points=25,
                requirement={'perfect_quiz_score': 1},
                max_progress=1
            ),
            'quiz_champion': Achievement(
                id='quiz_champion',
                name='Quiz Champion',
                description='Get perfect scores on 10 quizzes',
                icon='🏆',
                category='quiz',
                rarity='rare',
                points=100,
                requirement={'perfect_quiz_scores': 10},
                max_progress=10
            ),
            
            # Code Achievements
            'code_runner': Achievement(
                id='code_runner',
                name='Code Runner',
                description='Execute your first code',
                icon='💻',
                category='code',
                rarity='common',
                points=5,
                requirement={'code_executed': 1},
                max_progress=1
            ),
            'debug_master': Achievement(
                id='debug_master',
                name='Debug Master',
                description='Fix 50 code errors',
                icon='🐛',
                category='code',
                rarity='uncommon',
                points=75,
                requirement={'errors_fixed': 50},
                max_progress=50
            ),
            'code_ninja': Achievement(
                id='code_ninja',
                name='Code Ninja',
                description='Execute 500 code snippets',
                icon='🥷',
                category='code',
                rarity='epic',
                points=300,
                requirement={'code_executions': 500},
                max_progress=500
            ),
            
            # Streak Achievements
            'streak_starter': Achievement(
                id='streak_starter',
                name='Streak Starter',
                description='Maintain a 3-day learning streak',
                icon='🔥',
                category='streak',
                rarity='common',
                points=20,
                requirement={'streak_days': 3},
                max_progress=3
            ),
            'streak_master': Achievement(
                id='streak_master',
                name='Streak Master',
                description='Maintain a 30-day learning streak',
                icon='⚡',
                category='streak',
                rarity='rare',
                points=150,
                requirement={'streak_days': 30},
                max_progress=30
            ),
            'streak_legend': Achievement(
                id='streak_legend',
                name='Streak Legend',
                description='Maintain a 100-day learning streak',
                icon='🌟',
                category='streak',
                rarity='legendary',
                points=500,
                requirement={'streak_days': 100},
                max_progress=100
            ),
            
            # XP Achievements
            'xp_collector': Achievement(
                id='xp_collector',
                name='XP Collector',
                description='Earn 1000 XP',
                icon='⭐',
                category='xp',
                rarity='uncommon',
                points=50,
                requirement={'xp_earned': 1000},
                max_progress=1000
            ),
            'xp_master': Achievement(
                id='xp_master',
                name='XP Master',
                description='Earn 10000 XP',
                icon='🌟',
                category='xp',
                rarity='epic',
                points=250,
                requirement={'xp_earned': 10000},
                max_progress=10000
            ),
            
            # Special Achievements
            'early_bird': Achievement(
                id='early_bird',
                name='Early Bird',
                description='Complete a lesson before 8 AM',
                icon='🌅',
                category='special',
                rarity='uncommon',
                points=30,
                requirement={'early_lesson': 1},
                max_progress=1
            ),
            'night_owl': Achievement(
                id='night_owl',
                name='Night Owl',
                description='Complete a lesson after 10 PM',
                icon='🦉',
                category='special',
                rarity='uncommon',
                points=30,
                requirement={'late_lesson': 1},
                max_progress=1
            ),
            'speed_learner': Achievement(
                id='speed_learner',
                name='Speed Learner',
                description='Complete a lesson in under 5 minutes',
                icon='🚀',
                category='special',
                rarity='rare',
                points=100,
                requirement={'fast_lesson': 1},
                max_progress=1
            )
        }
        return achievements
    
    async def check_achievements(self, user_id: str, action: str, data: Dict[str, Any]) -> List[Achievement]:
        """Check if user has unlocked any achievements"""
        unlocked_achievements = []
        
        # Get user's current achievements and stats
        user_achievements = await firebase_service.get_user_achievements(user_id)
        user_stats = await firebase_service.get_user_stats(user_id)
        
        # Convert to dict for easier checking
        unlocked_ids = {ach['id'] for ach in user_achievements if ach.get('unlocked')}
        
        # Check each achievement
        for achievement_id, achievement in self.achievement_definitions.items():
            if achievement_id in unlocked_ids:
                continue  # Already unlocked
            
            # Check if requirements are met
            if self._check_achievement_requirements(achievement, user_stats, action, data):
                # Unlock achievement
                achievement.unlocked = True
                achievement.unlocked_at = datetime.now()
                achievement.progress = achievement.max_progress
                
                # Save to Firebase
                await firebase_service.unlock_achievement(user_id, achievement.to_dict())
                
                # Add XP reward
                await firebase_service.add_user_xp(user_id, achievement.points)
                
                # Create activity
                await self._create_achievement_activity(user_id, achievement)
                
                unlocked_achievements.append(achievement)
        
        return unlocked_achievements
    
    def _check_achievement_requirements(self, achievement: Achievement, user_stats: UserStats, action: str, data: Dict[str, Any]) -> bool:
        """Check if achievement requirements are met"""
        requirement = achievement.requirement
        
        if not requirement:
            return False
        
        # Check based on action type
        if action == 'lesson_completed':
            if 'lesson_completed' in requirement:
                return user_stats.lessons_completed >= requirement['lesson_completed']
            if 'lessons_completed' in requirement:
                return user_stats.lessons_completed >= requirement['lessons_completed']
            if 'early_lesson' in requirement:
                current_hour = datetime.now().hour
                return current_hour < 8
            if 'late_lesson' in requirement:
                current_hour = datetime.now().hour
                return current_hour >= 22
            if 'fast_lesson' in requirement:
                completion_time = data.get('completion_time', 0)
                return completion_time < 300  # 5 minutes
        
        elif action == 'quiz_completed':
            if 'quiz_completed' in requirement:
                return user_stats.quizzes_completed >= requirement['quiz_completed']
            if 'perfect_quiz_score' in requirement:
                return data.get('score', 0) >= 100
            if 'perfect_quiz_scores' in requirement:
                perfect_scores = data.get('perfect_scores_count', 0)
                return perfect_scores >= requirement['perfect_quiz_scores']
        
        elif action == 'code_executed':
            if 'code_executed' in requirement:
                return user_stats.code_executions >= requirement['code_executed']
            if 'code_executions' in requirement:
                return user_stats.code_executions >= requirement['code_executions']
        
        elif action == 'error_fixed':
            if 'errors_fixed' in requirement:
                errors_fixed = data.get('errors_fixed_count', 0)
                return errors_fixed >= requirement['errors_fixed']
        
        elif action == 'streak_updated':
            if 'streak_days' in requirement:
                return user_stats.current_streak >= requirement['streak_days']
        
        elif action == 'xp_earned':
            if 'xp_earned' in requirement:
                return user_stats.xp >= requirement['xp_earned']
        
        return False
    
    async def _create_achievement_activity(self, user_id: str, achievement: Achievement):
        """Create achievement unlock activity"""
        activity = UserActivity(
            id=str(uuid.uuid4()),
            user_id=user_id,
            activity_type='achievement_unlocked',
            title=f'Achievement Unlocked: {achievement.name}',
            description=achievement.description,
            icon=achievement.icon,
            data={
                'achievement_id': achievement.id,
                'achievement_name': achievement.name,
                'points': achievement.points,
                'rarity': achievement.rarity
            },
            created_at=datetime.now()
        )
        
        await firebase_service.add_user_activity(user_id, activity.to_dict())
    
    async def get_achievement_progress(self, user_id: str, achievement_id: str) -> Dict[str, Any]:
        """Get progress for a specific achievement"""
        if achievement_id not in self.achievement_definitions:
            return {'error': 'Achievement not found'}
        
        achievement = self.achievement_definitions[achievement_id]
        user_stats = await firebase_service.get_user_stats(user_id)
        
        # Calculate current progress
        current_progress = 0
        requirement = achievement.requirement
        
        if 'lessons_completed' in requirement:
            current_progress = min(user_stats.lessons_completed, achievement.max_progress)
        elif 'quiz_completed' in requirement:
            current_progress = min(user_stats.quizzes_completed, achievement.max_progress)
        elif 'code_executions' in requirement:
            current_progress = min(user_stats.code_executions, achievement.max_progress)
        elif 'streak_days' in requirement:
            current_progress = min(user_stats.current_streak, achievement.max_progress)
        elif 'xp_earned' in requirement:
            current_progress = min(user_stats.xp, achievement.max_progress)
        
        return {
            'achievement_id': achievement_id,
            'current_progress': current_progress,
            'max_progress': achievement.max_progress,
            'percentage': (current_progress / achievement.max_progress) * 100 if achievement.max_progress > 0 else 0
        }
    
    async def get_user_achievements_with_progress(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all achievements with progress for a user"""
        user_achievements = await firebase_service.get_user_achievements(user_id)
        unlocked_dict = {ach['id']: ach for ach in user_achievements if ach.get('unlocked')}
        
        achievements_with_progress = []
        
        for achievement_id, achievement in self.achievement_definitions.items():
            achievement_data = achievement.to_dict()
            
            if achievement_id in unlocked_dict:
                # Achievement is unlocked
                achievement_data.update(unlocked_dict[achievement_id])
            else:
                # Get progress for locked achievement
                progress = await self.get_achievement_progress(user_id, achievement_id)
                achievement_data.update(progress)
            
            achievements_with_progress.append(achievement_data)
        
        return achievements_with_progress
    
    def get_achievement_by_id(self, achievement_id: str) -> Optional[Achievement]:
        """Get achievement definition by ID"""
        return self.achievement_definitions.get(achievement_id)
    
    def get_achievements_by_category(self, category: str) -> List[Achievement]:
        """Get achievements by category"""
        return [ach for ach in self.achievement_definitions.values() if ach.category == category]
    
    def get_achievements_by_rarity(self, rarity: str) -> List[Achievement]:
        """Get achievements by rarity"""
        return [ach for ach in self.achievement_definitions.values() if ach.rarity == rarity]

# Create global instance
achievement_service = AchievementService()

# Simple wrapper function for the existing check_achievements method
def check_achievement_progress(user_id: str, action_type: str, data: Dict[str, Any] = None):
    """
    Check if a user has unlocked any achievements based on an action
    
    Args:
        user_id: The ID of the user
        action_type: The type of action performed (e.g., 'complete_challenge', 'lesson_completed')
        data: Additional data about the action
        
    Returns:
        An achievement object if one was unlocked, None otherwise
    """
    if data is None:
        data = {}
    
    # Since this is called synchronously, we'll do a simple check
    # For daily challenges, we'll focus on streak-related achievements
    if action_type == 'complete_challenge':
        # Get the streak value from the user data
        try:
            from services.firebase_service import get_firestore_instance
            db = get_firestore_instance()
            user_ref = db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if user_doc.exists:
                user_data = user_doc.to_dict()
                current_streak = user_data.get('streak', 0)
                
                # Check if the streak milestone unlocks an achievement
                if current_streak == 3:
                    return {
                        'id': 'streak_starter',
                        'name': 'Streak Starter',
                        'description': 'Maintain a 3-day learning streak',
                        'icon': '🔥',
                        'points': 20
                    }
                elif current_streak == 7:
                    return {
                        'id': 'streak_apprentice',
                        'name': 'Streak Apprentice',
                        'description': 'Maintain a 7-day learning streak',
                        'icon': '📆',
                        'points': 50
                    }
                elif current_streak == 30:
                    return {
                        'id': 'streak_master',
                        'name': 'Streak Master',
                        'description': 'Maintain a 30-day learning streak',
                        'icon': '⚡',
                        'points': 150
                    }
                elif current_streak == 100:
                    return {
                        'id': 'streak_legend',
                        'name': 'Streak Legend',
                        'description': 'Maintain a 100-day learning streak',
                        'icon': '🌟',
                        'points': 500
                    }
        except Exception as e:
            print(f"Error checking achievements: {e}")
    
    # No achievement unlocked
    return None

def check_achievement_progress(user_id: str, activity_type: str, activity_data: dict) -> Optional[dict]:
    """
    Check and update achievement progress for a user activity
    
    Args:
        user_id: User ID
        activity_type: Type of activity (e.g., 'complete_challenge', 'complete_lesson')
        activity_data: Data about the activity
    
    Returns:
        Achievement data if one was unlocked, None otherwise
    """
    try:
        # Create instance of AchievementService
        achievement_service = AchievementService()
        
        # Check achievements using the async method
        import asyncio
        
        # Run the async method in a sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                achievement_service.check_achievements(user_id, activity_type, activity_data)
            )
            return result
        finally:
            loop.close()
            
    except Exception as e:
        print(f"Error checking achievement progress: {e}")
        return None
