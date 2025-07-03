"""
AI-Powered Recommendation Engine for Code with Morais
Provides intelligent learning path suggestions and personalized content recommendations
"""
import random
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import json

logger = logging.getLogger(__name__)

class RecommendationEngine:
    """
    Advanced AI recommendation engine for personalized learning experiences
    """
    
    def __init__(self, firebase_service=None):
        self.firebase_service = firebase_service
        self.learning_patterns = {
            'visual': ['interactive', 'diagram', 'chart', 'example'],
            'auditory': ['explanation', 'discussion', 'verbal'],
            'kinesthetic': ['coding', 'exercise', 'hands-on', 'practice']
        }
        
        # Difficulty progression mapping
        self.difficulty_progression = {
            'beginner': ['beginner', 'intermediate'],
            'intermediate': ['intermediate', 'advanced'],
            'advanced': ['advanced', 'expert']
        }
        
        # Learning time preferences
        self.optimal_learning_times = {
            'morning': (6, 12),
            'afternoon': (12, 18),
            'evening': (18, 24),
            'night': (0, 6)
        }
    
    def generate_personalized_recommendations(self, user_id: str, user_progress: Dict, 
                                           all_lessons: List[Dict], limit: int = 5) -> List[Dict]:
        """
        Generate comprehensive personalized recommendations for a user
        
        Args:
            user_id: User identifier
            user_progress: User's lesson progress data
            all_lessons: All available lessons
            limit: Maximum number of recommendations to return
            
        Returns:
            List of personalized recommendations
        """
        try:
            recommendations = []
            
            # Analyze user's current state
            user_analysis = self._analyze_user_learning_profile(user_id, user_progress, all_lessons)
            
            # Generate different types of recommendations
            recommendations.extend(self._get_continuation_recommendations(user_progress, all_lessons))
            recommendations.extend(self._get_skill_gap_recommendations(user_analysis, all_lessons))
            recommendations.extend(self._get_difficulty_progression_recommendations(user_analysis, all_lessons))
            recommendations.extend(self._get_learning_style_recommendations(user_analysis, all_lessons))
            recommendations.extend(self._get_time_based_recommendations(user_analysis, all_lessons))
            
            # Score and rank recommendations
            scored_recommendations = self._score_recommendations(recommendations, user_analysis)
            
            # Return top recommendations
            return scored_recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error generating personalized recommendations: {str(e)}")
            return self._get_fallback_recommendations(all_lessons, limit)
    
    def _analyze_user_learning_profile(self, user_id: str, user_progress: Dict, 
                                     all_lessons: List[Dict]) -> Dict:
        """
        Analyze user's learning patterns and preferences
        """
        analysis = {
            'user_id': user_id,
            'total_lessons': len(all_lessons),
            'completed_lessons': len([p for p in user_progress.values() if p.get('completed', False)]),
            'in_progress_lessons': len([p for p in user_progress.values() if p.get('progress', 0) > 0 and not p.get('completed', False)]),
            'completion_rate': 0,
            'average_time_per_lesson': 0,
            'preferred_difficulty': 'beginner',
            'learning_style': 'visual',
            'active_hours': 'morning',
            'consistency_score': 0,
            'skill_gaps': [],
            'strengths': [],
            'last_activity': None
        }
        
        try:
            # Calculate completion rate
            if analysis['total_lessons'] > 0:
                analysis['completion_rate'] = analysis['completed_lessons'] / analysis['total_lessons']
            
            # Analyze learning patterns
            lesson_times = []
            difficulties = []
            last_access_times = []
            
            for lesson_id, progress in user_progress.items():
                if progress.get('completed', False):
                    difficulties.append(self._get_lesson_difficulty(lesson_id, all_lessons))
                    
                if progress.get('time_spent'):
                    lesson_times.append(progress['time_spent'])
                    
                if progress.get('last_accessed'):
                    try:
                        last_access_times.append(datetime.fromisoformat(progress['last_accessed']))
                    except:
                        pass
            
            # Calculate average time per lesson
            if lesson_times:
                analysis['average_time_per_lesson'] = sum(lesson_times) / len(lesson_times)
            
            # Determine preferred difficulty
            if difficulties:
                difficulty_counts = {}
                for diff in difficulties:
                    difficulty_counts[diff] = difficulty_counts.get(diff, 0) + 1
                analysis['preferred_difficulty'] = max(difficulty_counts, key=difficulty_counts.get)
            
            # Determine active hours
            if last_access_times:
                hours = [dt.hour for dt in last_access_times]
                avg_hour = sum(hours) / len(hours)
                analysis['active_hours'] = self._categorize_time(avg_hour)
                analysis['last_activity'] = max(last_access_times).isoformat()
            
            # Calculate consistency score
            if last_access_times and len(last_access_times) > 1:
                time_gaps = []
                for i in range(1, len(last_access_times)):
                    gap = (last_access_times[i] - last_access_times[i-1]).days
                    time_gaps.append(gap)
                
                avg_gap = sum(time_gaps) / len(time_gaps) if time_gaps else 0
                analysis['consistency_score'] = max(0, 1 - (avg_gap / 7))  # Weekly consistency
            
            # Identify skill gaps and strengths
            analysis['skill_gaps'] = self._identify_skill_gaps(user_progress, all_lessons)
            analysis['strengths'] = self._identify_strengths(user_progress, all_lessons)
            
            logger.info(f"User learning profile analyzed: {analysis['completion_rate']:.2%} completion rate")
            
        except Exception as e:
            logger.error(f"Error analyzing user learning profile: {str(e)}")
        
        return analysis
    
    def _get_continuation_recommendations(self, user_progress: Dict, all_lessons: List[Dict]) -> List[Dict]:
        """
        Get recommendations for continuing in-progress lessons
        """
        recommendations = []
        
        for lesson_id, progress in user_progress.items():
            if progress.get('progress', 0) > 0 and not progress.get('completed', False):
                lesson = self._find_lesson_by_id(lesson_id, all_lessons)
                if lesson:
                    recommendations.append({
                        'type': 'continuation',
                        'lesson_id': lesson_id,
                        'lesson': lesson,
                        'reason': f"Continue '{lesson.get('title', 'lesson')}' - {progress.get('progress', 0)}% complete",
                        'priority': 'high',
                        'confidence': 0.9,
                        'progress': progress.get('progress', 0)
                    })
        
        return recommendations
    
    def _get_skill_gap_recommendations(self, user_analysis: Dict, all_lessons: List[Dict]) -> List[Dict]:
        """
        Get recommendations to fill identified skill gaps
        """
        recommendations = []
        skill_gaps = user_analysis.get('skill_gaps', [])
        
        for gap in skill_gaps:
            relevant_lessons = [
                lesson for lesson in all_lessons 
                if gap.lower() in lesson.get('category', '').lower() or 
                   gap.lower() in lesson.get('title', '').lower() or
                   gap.lower() in lesson.get('description', '').lower()
            ]
            
            for lesson in relevant_lessons[:2]:  # Top 2 per skill gap
                recommendations.append({
                    'type': 'skill_gap',
                    'lesson_id': lesson.get('id'),
                    'lesson': lesson,
                    'reason': f"Fill skill gap in {gap}",
                    'priority': 'medium',
                    'confidence': 0.7,
                    'skill_gap': gap
                })
        
        return recommendations
    
    def _get_difficulty_progression_recommendations(self, user_analysis: Dict, all_lessons: List[Dict]) -> List[Dict]:
        """
        Get recommendations for appropriate difficulty progression
        """
        recommendations = []
        preferred_difficulty = user_analysis.get('preferred_difficulty', 'beginner')
        completion_rate = user_analysis.get('completion_rate', 0)
        
        # Determine next difficulty level
        next_difficulties = self.difficulty_progression.get(preferred_difficulty, ['beginner'])
        
        # If user has high completion rate, suggest next difficulty
        if completion_rate > 0.8 and len(next_difficulties) > 1:
            target_difficulty = next_difficulties[1]
        else:
            target_difficulty = next_difficulties[0]
        
        # Find lessons of target difficulty
        suitable_lessons = [
            lesson for lesson in all_lessons 
            if lesson.get('difficulty', 'beginner') == target_difficulty
        ]
        
        for lesson in suitable_lessons[:3]:  # Top 3 difficulty-appropriate lessons
            recommendations.append({
                'type': 'difficulty_progression',
                'lesson_id': lesson.get('id'),
                'lesson': lesson,
                'reason': f"Ready for {target_difficulty} level content",
                'priority': 'medium',
                'confidence': 0.8,
                'difficulty': target_difficulty
            })
        
        return recommendations
    
    def _get_learning_style_recommendations(self, user_analysis: Dict, all_lessons: List[Dict]) -> List[Dict]:
        """
        Get recommendations based on inferred learning style
        """
        recommendations = []
        learning_style = user_analysis.get('learning_style', 'visual')
        style_keywords = self.learning_patterns.get(learning_style, [])
        
        # Find lessons that match learning style
        matching_lessons = []
        for lesson in all_lessons:
            lesson_text = f"{lesson.get('title', '')} {lesson.get('description', '')}".lower()
            if any(keyword in lesson_text for keyword in style_keywords):
                matching_lessons.append(lesson)
        
        for lesson in matching_lessons[:2]:  # Top 2 style-matching lessons
            recommendations.append({
                'type': 'learning_style',
                'lesson_id': lesson.get('id'),
                'lesson': lesson,
                'reason': f"Matches your {learning_style} learning style",
                'priority': 'low',
                'confidence': 0.6,
                'learning_style': learning_style
            })
        
        return recommendations
    
    def _get_time_based_recommendations(self, user_analysis: Dict, all_lessons: List[Dict]) -> List[Dict]:
        """
        Get recommendations based on user's active learning times
        """
        recommendations = []
        current_hour = datetime.now().hour
        active_hours = user_analysis.get('active_hours', 'morning')
        
        # Check if it's user's preferred learning time
        time_range = self.optimal_learning_times.get(active_hours, (6, 12))
        is_optimal_time = time_range[0] <= current_hour < time_range[1]
        
        if is_optimal_time:
            # Recommend shorter lessons during optimal time
            suitable_lessons = [
                lesson for lesson in all_lessons 
                if lesson.get('duration', 60) <= 30  # 30 minutes or less
            ]
            
            for lesson in suitable_lessons[:2]:  # Top 2 time-appropriate lessons
                recommendations.append({
                    'type': 'time_based',
                    'lesson_id': lesson.get('id'),
                    'lesson': lesson,
                    'reason': f"Perfect for your {active_hours} learning time",
                    'priority': 'low',
                    'confidence': 0.5,
                    'time_preference': active_hours
                })
        
        return recommendations
    
    def _score_recommendations(self, recommendations: List[Dict], user_analysis: Dict) -> List[Dict]:
        """
        Score and rank recommendations based on user analysis
        """
        for rec in recommendations:
            base_score = rec.get('confidence', 0.5)
            
            # Priority weighting
            priority_weights = {'high': 1.0, 'medium': 0.8, 'low': 0.6}
            priority_weight = priority_weights.get(rec.get('priority', 'medium'), 0.8)
            
            # Type weighting
            type_weights = {
                'continuation': 1.0,
                'skill_gap': 0.9,
                'difficulty_progression': 0.8,
                'learning_style': 0.7,
                'time_based': 0.6
            }
            type_weight = type_weights.get(rec.get('type', 'general'), 0.5)
            
            # Calculate final score
            final_score = base_score * priority_weight * type_weight
            rec['score'] = final_score
            
            # Add display-friendly information
            rec['display_title'] = rec['lesson'].get('title', 'Untitled Lesson')
            rec['display_description'] = rec['lesson'].get('description', '')
            rec['estimated_time'] = rec['lesson'].get('duration', 30)
            rec['xp_reward'] = rec['lesson'].get('xp_reward', 50)
        
        # Sort by score (highest first)
        recommendations.sort(key=lambda x: x.get('score', 0), reverse=True)
        
        return recommendations
    
    def _get_fallback_recommendations(self, all_lessons: List[Dict], limit: int = 5) -> List[Dict]:
        """
        Provide fallback recommendations when analysis fails
        """
        fallback_recommendations = []
        
        # Get first few lessons as fallback
        for lesson in all_lessons[:limit]:
            fallback_recommendations.append({
                'type': 'fallback',
                'lesson_id': lesson.get('id'),
                'lesson': lesson,
                'reason': 'Start your learning journey',
                'priority': 'medium',
                'confidence': 0.5,
                'score': 0.5,
                'display_title': lesson.get('title', 'Untitled Lesson'),
                'display_description': lesson.get('description', ''),
                'estimated_time': lesson.get('duration', 30),
                'xp_reward': lesson.get('xp_reward', 50)
            })
        
        return fallback_recommendations
    
    def _find_lesson_by_id(self, lesson_id: str, all_lessons: List[Dict]) -> Optional[Dict]:
        """Find lesson by ID"""
        for lesson in all_lessons:
            if lesson.get('id') == lesson_id:
                return lesson
        return None
    
    def _get_lesson_difficulty(self, lesson_id: str, all_lessons: List[Dict]) -> str:
        """Get lesson difficulty by ID"""
        lesson = self._find_lesson_by_id(lesson_id, all_lessons)
        return lesson.get('difficulty', 'beginner') if lesson else 'beginner'
    
    def _categorize_time(self, hour: int) -> str:
        """Categorize hour into time period"""
        if 6 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 18:
            return 'afternoon'
        elif 18 <= hour < 24:
            return 'evening'
        else:
            return 'night'
    
    def _identify_skill_gaps(self, user_progress: Dict, all_lessons: List[Dict]) -> List[str]:
        """Identify potential skill gaps based on uncompleted lessons"""
        skill_gaps = []
        
        # Get categories of uncompleted lessons
        uncompleted_categories = set()
        for lesson in all_lessons:
            lesson_id = lesson.get('id')
            if lesson_id not in user_progress or not user_progress[lesson_id].get('completed', False):
                category = lesson.get('category', 'python')
                uncompleted_categories.add(category)
        
        # Convert to skill gaps
        category_to_skill = {
            'python': 'Python Basics',
            'data-structures': 'Data Structures',
            'functions': 'Functions',
            'oop': 'Object-Oriented Programming',
            'algorithms': 'Algorithms',
            'web': 'Web Development',
            'database': 'Database Management'
        }
        
        for category in uncompleted_categories:
            skill = category_to_skill.get(category, category.title())
            skill_gaps.append(skill)
        
        return skill_gaps[:3]  # Top 3 skill gaps
    
    def _identify_strengths(self, user_progress: Dict, all_lessons: List[Dict]) -> List[str]:
        """Identify user's strengths based on completed lessons"""
        strengths = []
        
        # Get categories of completed lessons
        completed_categories = {}
        for lesson in all_lessons:
            lesson_id = lesson.get('id')
            if lesson_id in user_progress and user_progress[lesson_id].get('completed', False):
                category = lesson.get('category', 'python')
                completed_categories[category] = completed_categories.get(category, 0) + 1
        
        # Find top categories
        sorted_categories = sorted(completed_categories.items(), key=lambda x: x[1], reverse=True)
        
        category_to_strength = {
            'python': 'Python Fundamentals',
            'data-structures': 'Data Structures',
            'functions': 'Functions & Methods',
            'oop': 'Object-Oriented Programming',
            'algorithms': 'Algorithm Design',
            'web': 'Web Development',
            'database': 'Database Skills'
        }
        
        for category, count in sorted_categories[:3]:  # Top 3 strengths
            if count > 0:
                strength = category_to_strength.get(category, category.title())
                strengths.append(strength)
        
        return strengths
    
    def predict_lesson_success(self, user_id: str, lesson_id: str, user_analysis: Dict) -> float:
        """
        Predict probability of user successfully completing a lesson
        """
        try:
            # Base success rate
            base_success = 0.7
            
            # Adjust based on completion rate
            completion_rate = user_analysis.get('completion_rate', 0.5)
            completion_modifier = completion_rate * 0.3
            
            # Adjust based on consistency
            consistency_score = user_analysis.get('consistency_score', 0.5)
            consistency_modifier = consistency_score * 0.2
            
            # Calculate final prediction
            success_probability = base_success + completion_modifier + consistency_modifier
            success_probability = max(0.1, min(1.0, success_probability))  # Clamp between 0.1 and 1.0
            
            return success_probability
            
        except Exception as e:
            logger.error(f"Error predicting lesson success: {str(e)}")
            return 0.7  # Default success rate
    
    def get_learning_insights(self, user_id: str, user_analysis: Dict) -> Dict:
        """
        Generate learning insights and recommendations for the user
        """
        insights = {
            'overall_progress': {
                'completion_rate': user_analysis.get('completion_rate', 0),
                'consistency_score': user_analysis.get('consistency_score', 0),
                'learning_velocity': self._calculate_learning_velocity(user_analysis)
            },
            'learning_pattern': {
                'preferred_difficulty': user_analysis.get('preferred_difficulty', 'beginner'),
                'active_hours': user_analysis.get('active_hours', 'morning'),
                'average_session_time': user_analysis.get('average_time_per_lesson', 0)
            },
            'recommendations': {
                'next_steps': self._get_next_steps_insight(user_analysis),
                'focus_areas': user_analysis.get('skill_gaps', []),
                'strengths': user_analysis.get('strengths', [])
            },
            'predictions': {
                'estimated_completion_time': self._estimate_completion_time(user_analysis),
                'success_likelihood': self._calculate_success_likelihood(user_analysis)
            }
        }
        
        return insights
    
    def _calculate_learning_velocity(self, user_analysis: Dict) -> float:
        """Calculate user's learning velocity (lessons per week)"""
        try:
            completed_lessons = user_analysis.get('completed_lessons', 0)
            if user_analysis.get('last_activity'):
                last_activity = datetime.fromisoformat(user_analysis['last_activity'])
                weeks_active = max(1, (datetime.now() - last_activity).days / 7)
                return completed_lessons / weeks_active
            return 0
        except:
            return 0
    
    def _get_next_steps_insight(self, user_analysis: Dict) -> str:
        """Get personalized next steps insight"""
        completion_rate = user_analysis.get('completion_rate', 0)
        
        if completion_rate < 0.25:
            return "Focus on building strong fundamentals"
        elif completion_rate < 0.5:
            return "Continue with consistent practice"
        elif completion_rate < 0.75:
            return "Ready for more advanced concepts"
        else:
            return "Time to apply skills to real projects"
    
    def _estimate_completion_time(self, user_analysis: Dict) -> int:
        """Estimate time to complete remaining lessons (in hours)"""
        try:
            remaining_lessons = user_analysis.get('total_lessons', 0) - user_analysis.get('completed_lessons', 0)
            avg_time_per_lesson = user_analysis.get('average_time_per_lesson', 30)  # minutes
            return int((remaining_lessons * avg_time_per_lesson) / 60)  # hours
        except:
            return 0
    
    def _calculate_success_likelihood(self, user_analysis: Dict) -> float:
        """Calculate likelihood of user completing their learning path"""
        try:
            completion_rate = user_analysis.get('completion_rate', 0)
            consistency_score = user_analysis.get('consistency_score', 0)
            
            # Base success likelihood
            base_success = 0.6
            
            # Adjust based on current progress
            progress_modifier = completion_rate * 0.3
            
            # Adjust based on consistency
            consistency_modifier = consistency_score * 0.2
            
            success_likelihood = base_success + progress_modifier + consistency_modifier
            return max(0.1, min(1.0, success_likelihood))
        except:
            return 0.6
