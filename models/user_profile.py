from datetime import datetime
from dataclasses import dataclass
from typing import Dict, List, Optional, Any

@dataclass
class UserProfile:
    """User profile data model"""
    user_id: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None
    profile_public: bool = True
    show_achievements: bool = True
    show_activity: bool = True
    show_stats: bool = True
    theme_color: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert profile to dictionary"""
        return {
            'user_id': self.user_id,
            'display_name': self.display_name,
            'bio': self.bio,
            'location': self.location,
            'website': self.website,
            'avatar_url': self.avatar_url,
            'banner_url': self.banner_url,
            'social_links': self.social_links or {},
            'profile_public': self.profile_public,
            'show_achievements': self.show_achievements,
            'show_activity': self.show_activity,
            'show_stats': self.show_stats,
            'theme_color': self.theme_color,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserProfile':
        """Create profile from dictionary"""
        return cls(
            user_id=data.get('user_id'),
            display_name=data.get('display_name'),
            bio=data.get('bio'),
            location=data.get('location'),
            website=data.get('website'),
            avatar_url=data.get('avatar_url'),
            banner_url=data.get('banner_url'),
            social_links=data.get('social_links', {}),
            profile_public=data.get('profile_public', True),
            show_achievements=data.get('show_achievements', True),
            show_activity=data.get('show_activity', True),
            show_stats=data.get('show_stats', True),
            theme_color=data.get('theme_color'),
            created_at=datetime.fromisoformat(data['created_at']) if data.get('created_at') else None,
            updated_at=datetime.fromisoformat(data['updated_at']) if data.get('updated_at') else None
        )

@dataclass
class UserStats:
    """User statistics data model"""
    user_id: str
    xp: int = 0
    level: int = 1
    lessons_completed: int = 0
    quizzes_completed: int = 0
    challenges_completed: int = 0
    code_executions: int = 0
    study_time_minutes: int = 0
    current_streak: int = 0
    max_streak: int = 0
    achievements_unlocked: int = 0
    last_activity: Optional[datetime] = None
    join_date: Optional[datetime] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert stats to dictionary"""
        return {
            'user_id': self.user_id,
            'xp': self.xp,
            'level': self.level,
            'lessons_completed': self.lessons_completed,
            'quizzes_completed': self.quizzes_completed,
            'challenges_completed': self.challenges_completed,
            'code_executions': self.code_executions,
            'study_time_minutes': self.study_time_minutes,
            'current_streak': self.current_streak,
            'max_streak': self.max_streak,
            'achievements_unlocked': self.achievements_unlocked,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None,
            'join_date': self.join_date.isoformat() if self.join_date else None
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserStats':
        """Create stats from dictionary"""
        return cls(
            user_id=data.get('user_id'),
            xp=data.get('xp', 0),
            level=data.get('level', 1),
            lessons_completed=data.get('lessons_completed', 0),
            quizzes_completed=data.get('quizzes_completed', 0),
            challenges_completed=data.get('challenges_completed', 0),
            code_executions=data.get('code_executions', 0),
            study_time_minutes=data.get('study_time_minutes', 0),
            current_streak=data.get('current_streak', 0),
            max_streak=data.get('max_streak', 0),
            achievements_unlocked=data.get('achievements_unlocked', 0),
            last_activity=datetime.fromisoformat(data['last_activity']) if data.get('last_activity') else None,
            join_date=datetime.fromisoformat(data['join_date']) if data.get('join_date') else None
        )
    
    def calculate_level(self) -> int:
        """Calculate user level based on XP"""
        if self.xp < 100:
            return 1
        elif self.xp < 250:
            return 2
        elif self.xp < 500:
            return 3
        elif self.xp < 1000:
            return 4
        elif self.xp < 2000:
            return 5
        else:
            return min(50, 5 + (self.xp - 2000) // 1000)
    
    def xp_to_next_level(self) -> int:
        """Calculate XP needed for next level"""
        current_level = self.level
        if current_level == 1:
            return 100 - self.xp
        elif current_level == 2:
            return 250 - self.xp
        elif current_level == 3:
            return 500 - self.xp
        elif current_level == 4:
            return 1000 - self.xp
        elif current_level == 5:
            return 2000 - self.xp
        else:
            return (current_level - 4) * 1000 + 2000 - self.xp

@dataclass
class Achievement:
    """Achievement data model"""
    id: str
    name: str
    description: str
    icon: str
    category: str
    rarity: str = 'common'  # common, uncommon, rare, epic, legendary
    points: int = 10
    requirement: Dict[str, Any] = None
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None
    progress: int = 0
    max_progress: int = 1
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert achievement to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'category': self.category,
            'rarity': self.rarity,
            'points': self.points,
            'requirement': self.requirement or {},
            'unlocked': self.unlocked,
            'unlocked_at': self.unlocked_at.isoformat() if self.unlocked_at else None,
            'progress': self.progress,
            'max_progress': self.max_progress
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Achievement':
        """Create achievement from dictionary"""
        return cls(
            id=data.get('id'),
            name=data.get('name'),
            description=data.get('description'),
            icon=data.get('icon'),
            category=data.get('category'),
            rarity=data.get('rarity', 'common'),
            points=data.get('points', 10),
            requirement=data.get('requirement', {}),
            unlocked=data.get('unlocked', False),
            unlocked_at=datetime.fromisoformat(data['unlocked_at']) if data.get('unlocked_at') else None,
            progress=data.get('progress', 0),
            max_progress=data.get('max_progress', 1)
        )

@dataclass
class UserActivity:
    """User activity data model"""
    id: str
    user_id: str
    activity_type: str  # lesson_completed, quiz_completed, achievement_unlocked, etc.
    title: str
    description: str
    icon: str
    data: Dict[str, Any]
    created_at: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert activity to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'activity_type': self.activity_type,
            'title': self.title,
            'description': self.description,
            'icon': self.icon,
            'data': self.data,
            'created_at': self.created_at.isoformat()
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'UserActivity':
        """Create activity from dictionary"""
        return cls(
            id=data.get('id'),
            user_id=data.get('user_id'),
            activity_type=data.get('activity_type'),
            title=data.get('title'),
            description=data.get('description'),
            icon=data.get('icon'),
            data=data.get('data', {}),
            created_at=datetime.fromisoformat(data['created_at'])
        )
