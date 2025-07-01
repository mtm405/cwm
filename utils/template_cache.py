"""
Advanced Template Caching System
Production-ready caching with intelligent invalidation and performance optimization
Builds on existing template caching to provide enterprise-level performance
"""

import hashlib
import json
import time
from typing import Dict, Any, Optional, List, Callable, Union
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from functools import wraps
import threading
import weakref
from pathlib import Path
import pickle
import os
from flask import current_app, request, session
from jinja2 import Template
import redis
from contextlib import contextmanager


@dataclass
class CacheEntry:
    """Individual cache entry with metadata"""
    content: str
    created_at: datetime
    last_accessed: datetime
    access_count: int = 0
    tags: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    size_bytes: int = 0
    render_time_ms: float = 0.0
    cache_key: str = ""
    
    def is_expired(self, ttl_seconds: int) -> bool:
        """Check if cache entry has expired"""
        if ttl_seconds <= 0:
            return False
        return (datetime.now() - self.created_at).total_seconds() > ttl_seconds
    
    def update_access(self):
        """Update access statistics"""
        self.last_accessed = datetime.now()
        self.access_count += 1


@dataclass
class CacheStats:
    """Cache performance statistics"""
    hits: int = 0
    misses: int = 0
    invalidations: int = 0
    total_size_bytes: int = 0
    avg_render_time_ms: float = 0.0
    memory_usage_mb: float = 0.0
    cache_efficiency: float = 0.0
    
    @property
    def hit_ratio(self) -> float:
        """Calculate cache hit ratio"""
        total = self.hits + self.misses
        return (self.hits / total * 100) if total > 0 else 0.0
    
    @property
    def total_requests(self) -> int:
        """Total cache requests"""
        return self.hits + self.misses


class CacheKeyGenerator:
    """Advanced cache key generation with intelligent hashing"""
    
    def __init__(self):
        self.key_generators: Dict[str, Callable] = {
            'user': self._generate_user_key,
            'lesson': self._generate_lesson_key,
            'quiz': self._generate_quiz_key,
            'dashboard': self._generate_dashboard_key,
            'component': self._generate_component_key
        }
    
    def generate_key(self, template_path: str, context: Dict[str, Any], 
                    cache_type: str = 'default') -> str:
        """Generate intelligent cache key based on template and context"""
        
        # Base key components
        key_parts = [
            template_path,
            self._hash_context(context),
            self._get_user_segment(),
            self._get_request_context(),
        ]
        
        # Add type-specific key generation
        if cache_type in self.key_generators:
            type_key = self.key_generators[cache_type](context)
            key_parts.append(type_key)
        
        # Create stable hash
        key_string = '|'.join(str(part) for part in key_parts if part)
        return hashlib.sha256(key_string.encode()).hexdigest()[:16]
    
    def _hash_context(self, context: Dict[str, Any]) -> str:
        """Create hash of template context variables"""
        # Extract cacheable context items
        cacheable_context = {}
        
        for key, value in context.items():
            if self._is_cacheable_value(key, value):
                cacheable_context[key] = self._serialize_value(value)
        
        # Create stable hash
        context_string = json.dumps(cacheable_context, sort_keys=True, default=str)
        return hashlib.md5(context_string.encode()).hexdigest()[:8]
    
    def _is_cacheable_value(self, key: str, value: Any) -> bool:
        """Determine if a context value should be included in cache key"""
        # Skip non-cacheable items
        skip_keys = {'request', 'session', 'current_user', 'csrf_token', '_flashes'}
        if key.startswith('_') or key in skip_keys:
            return False
        
        # Skip functions and complex objects
        if callable(value) or hasattr(value, '__dict__'):
            return False
        
        return True
    
    def _serialize_value(self, value: Any) -> str:
        """Serialize value for cache key generation"""
        if isinstance(value, (str, int, float, bool)):
            return str(value)
        elif isinstance(value, (list, tuple)):
            return str(sorted(str(item) for item in value))
        elif isinstance(value, dict):
            return str(sorted(f"{k}:{v}" for k, v in value.items()))
        else:
            return str(type(value).__name__)
    
    def _get_user_segment(self) -> str:
        """Get user segment for cache key"""
        try:
            from flask_login import current_user
            if hasattr(current_user, 'is_authenticated') and current_user.is_authenticated:
                # User level for different cache tiers
                user_level = getattr(current_user, 'level', 1)
                is_admin = getattr(current_user, 'is_admin', False)
                return f"u{user_level}{'_admin' if is_admin else ''}"
        except:
            pass
        return "anonymous"
    
    def _get_request_context(self) -> str:
        """Get request-specific context"""
        try:
            # Device type for responsive caching
            user_agent = request.headers.get('User-Agent', '')
            if 'Mobile' in user_agent:
                device = 'mobile'
            elif 'Tablet' in user_agent:
                device = 'tablet'
            else:
                device = 'desktop'
            
            # Language preference
            lang = session.get('language', 'en')
            
            return f"{device}_{lang}"
        except:
            return "default"
    
    def _generate_user_key(self, context: Dict[str, Any]) -> str:
        """Generate user-specific cache key"""
        user_id = context.get('user_id', 'anonymous')
        user_xp = context.get('user_xp', 0)
        user_level = context.get('user_level', 1)
        return f"user_{user_id}_{user_level}_{user_xp // 100}"  # Cache per 100 XP
    
    def _generate_lesson_key(self, context: Dict[str, Any]) -> str:
        """Generate lesson-specific cache key"""
        lesson_id = context.get('lesson_id', '')
        user_progress = context.get('user_progress', {})
        completed_blocks = len([b for b in user_progress.values() if b])
        return f"lesson_{lesson_id}_{completed_blocks}"
    
    def _generate_quiz_key(self, context: Dict[str, Any]) -> str:
        """Generate quiz-specific cache key"""
        quiz_id = context.get('quiz_id', '')
        user_attempts = context.get('user_attempts', 0)
        return f"quiz_{quiz_id}_{user_attempts}"
    
    def _generate_dashboard_key(self, context: Dict[str, Any]) -> str:
        """Generate dashboard-specific cache key"""
        user_stats = context.get('user_stats', {})
        stats_hash = hashlib.md5(str(sorted(user_stats.items())).encode()).hexdigest()[:8]
        return f"dashboard_{stats_hash}"
    
    def _generate_component_key(self, context: Dict[str, Any]) -> str:
        """Generate component-specific cache key"""
        component_name = context.get('component_name', '')
        component_props = context.get('component_props', {})
        props_hash = hashlib.md5(str(sorted(component_props.items())).encode()).hexdigest()[:8]
        return f"component_{component_name}_{props_hash}"


class CacheInvalidator:
    """Intelligent cache invalidation system"""
    
    def __init__(self, cache_instance):
        self.cache = cache_instance
        self.dependency_graph: Dict[str, List[str]] = {}
        self.tag_mappings: Dict[str, List[str]] = {}
        self.invalidation_rules: List[Callable] = []
    
    def add_dependency(self, cache_key: str, dependency: str):
        """Add dependency relationship"""
        if dependency not in self.dependency_graph:
            self.dependency_graph[dependency] = []
        self.dependency_graph[dependency].append(cache_key)
    
    def add_tag_mapping(self, tag: str, cache_key: str):
        """Add tag to cache key mapping"""
        if tag not in self.tag_mappings:
            self.tag_mappings[tag] = []
        self.tag_mappings[tag].append(cache_key)
    
    def invalidate_by_dependency(self, dependency: str):
        """Invalidate all cache entries dependent on a resource"""
        if dependency in self.dependency_graph:
            cache_keys = self.dependency_graph[dependency]
            for cache_key in cache_keys:
                self.cache.delete(cache_key)
            
            # Update stats
            self.cache.stats.invalidations += len(cache_keys)
            
            # Clean up dependency graph
            del self.dependency_graph[dependency]
    
    def invalidate_by_tag(self, tag: str):
        """Invalidate all cache entries with specific tag"""
        if tag in self.tag_mappings:
            cache_keys = self.tag_mappings[tag]
            for cache_key in cache_keys:
                self.cache.delete(cache_key)
            
            # Update stats
            self.cache.stats.invalidations += len(cache_keys)
            
            # Clean up tag mappings
            del self.tag_mappings[tag]
    
    def invalidate_by_pattern(self, pattern: str):
        """Invalidate cache entries matching pattern"""
        matching_keys = []
        for cache_key in self.cache.entries.keys():
            if pattern in cache_key:
                matching_keys.append(cache_key)
        
        for cache_key in matching_keys:
            self.cache.delete(cache_key)
        
        self.cache.stats.invalidations += len(matching_keys)
    
    def add_invalidation_rule(self, rule_function: Callable):
        """Add custom invalidation rule"""
        self.invalidation_rules.append(rule_function)
    
    def check_invalidation_rules(self, context: Dict[str, Any]):
        """Check and apply custom invalidation rules"""
        for rule in self.invalidation_rules:
            try:
                rule(context, self)
            except Exception as e:
                current_app.logger.error(f"Cache invalidation rule error: {e}")


class AdvancedTemplateCache:
    """Advanced template caching system with intelligent invalidation"""
    
    def __init__(self, 
                 max_size_mb: int = 100,
                 default_ttl_seconds: int = 3600,
                 redis_url: Optional[str] = None,
                 enable_persistence: bool = True):
        
        self.max_size_bytes = max_size_mb * 1024 * 1024
        self.default_ttl = default_ttl_seconds
        self.enable_persistence = enable_persistence
        
        # Cache storage
        self.entries: Dict[str, CacheEntry] = {}
        self.stats = CacheStats()
        
        # Cache components
        self.key_generator = CacheKeyGenerator()
        self.invalidator = CacheInvalidator(self)
        
        # Redis connection (optional)
        self.redis_client = None
        if redis_url:
            try:
                import redis
                self.redis_client = redis.from_url(redis_url)
            except ImportError:
                current_app.logger.warning("Redis not available, using memory cache only")
        
        # Thread safety
        self._lock = threading.RLock()
        
        # Persistence
        self.cache_file = Path("cache_data.pkl")
        if enable_persistence:
            self._load_cache_from_disk()
        
        # Cleanup thread
        self._start_cleanup_thread()
    
    def cache_key(self, template_path: str, context: Dict[str, Any], 
                  cache_type: str = 'default', ttl: Optional[int] = None,
                  tags: Optional[List[str]] = None,
                  dependencies: Optional[List[str]] = None) -> str:
        """Generate cache key for template"""
        return self.key_generator.generate_key(template_path, context, cache_type)
    
    def get(self, cache_key: str) -> Optional[str]:
        """Get cached template content"""
        with self._lock:
            entry = self.entries.get(cache_key)
            
            if entry is None:
                self.stats.misses += 1
                return None
            
            # Check TTL
            if entry.is_expired(self.default_ttl):
                self.delete(cache_key)
                self.stats.misses += 1
                return None
            
            # Update access stats
            entry.update_access()
            self.stats.hits += 1
            
            return entry.content
    
    def set(self, cache_key: str, content: str, 
            ttl: Optional[int] = None,
            tags: Optional[List[str]] = None,
            dependencies: Optional[List[str]] = None,
            render_time_ms: float = 0.0):
        """Store template content in cache"""
        
        with self._lock:
            # Calculate content size
            content_size = len(content.encode('utf-8'))
            
            # Check if we need to make space
            self._ensure_space(content_size)
            
            # Create cache entry
            entry = CacheEntry(
                content=content,
                created_at=datetime.now(),
                last_accessed=datetime.now(),
                tags=tags or [],
                dependencies=dependencies or [],
                size_bytes=content_size,
                render_time_ms=render_time_ms,
                cache_key=cache_key
            )
            
            # Store entry
            self.entries[cache_key] = entry
            
            # Update stats
            self.stats.total_size_bytes += content_size
            
            # Register tags and dependencies
            if tags:
                for tag in tags:
                    self.invalidator.add_tag_mapping(tag, cache_key)
            
            if dependencies:
                for dep in dependencies:
                    self.invalidator.add_dependency(cache_key, dep)
            
            # Store in Redis if available
            if self.redis_client:
                try:
                    self.redis_client.setex(
                        f"template_cache:{cache_key}",
                        ttl or self.default_ttl,
                        content
                    )
                except Exception as e:
                    current_app.logger.warning(f"Redis cache error: {e}")
    
    def delete(self, cache_key: str) -> bool:
        """Delete cache entry"""
        with self._lock:
            entry = self.entries.pop(cache_key, None)
            if entry:
                self.stats.total_size_bytes -= entry.size_bytes
                
                # Remove from Redis
                if self.redis_client:
                    try:
                        self.redis_client.delete(f"template_cache:{cache_key}")
                    except Exception:
                        pass
                
                return True
            return False
    
    def clear(self):
        """Clear all cache entries"""
        with self._lock:
            self.entries.clear()
            self.stats = CacheStats()
            
            if self.redis_client:
                try:
                    # Clear Redis keys with our prefix
                    keys = self.redis_client.keys("template_cache:*")
                    if keys:
                        self.redis_client.delete(*keys)
                except Exception:
                    pass
    
    def invalidate_by_tag(self, tag: str):
        """Invalidate all entries with specific tag"""
        self.invalidator.invalidate_by_tag(tag)
    
    def invalidate_by_dependency(self, dependency: str):
        """Invalidate entries dependent on resource"""
        self.invalidator.invalidate_by_dependency(dependency)
    
    def invalidate_by_pattern(self, pattern: str):
        """Invalidate entries matching pattern"""
        self.invalidator.invalidate_by_pattern(pattern)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        with self._lock:
            # Update memory usage
            self.stats.memory_usage_mb = self.stats.total_size_bytes / (1024 * 1024)
            
            # Calculate efficiency
            if self.stats.total_requests > 0:
                self.stats.cache_efficiency = (
                    self.stats.hits / self.stats.total_requests * 100
                )
            
            # Calculate average render time
            if self.entries:
                avg_render = sum(e.render_time_ms for e in self.entries.values())
                self.stats.avg_render_time_ms = avg_render / len(self.entries)
            
            return {
                'hit_ratio': self.stats.hit_ratio,
                'hits': self.stats.hits,
                'misses': self.stats.misses,
                'total_requests': self.stats.total_requests,
                'cache_size_mb': self.stats.memory_usage_mb,
                'entry_count': len(self.entries),
                'invalidations': self.stats.invalidations,
                'avg_render_time_ms': self.stats.avg_render_time_ms,
                'cache_efficiency': self.stats.cache_efficiency
            }
    
    def _ensure_space(self, required_bytes: int):
        """Ensure enough space for new cache entry"""
        if self.stats.total_size_bytes + required_bytes <= self.max_size_bytes:
            return
        
        # Need to evict entries - use LRU strategy
        entries_by_access = sorted(
            self.entries.items(),
            key=lambda x: (x[1].last_accessed, x[1].access_count)
        )
        
        bytes_to_free = (self.stats.total_size_bytes + required_bytes) - self.max_size_bytes
        bytes_freed = 0
        
        for cache_key, entry in entries_by_access:
            if bytes_freed >= bytes_to_free:
                break
            
            bytes_freed += entry.size_bytes
            self.delete(cache_key)
    
    def _start_cleanup_thread(self):
        """Start background cleanup thread"""
        def cleanup_worker():
            while True:
                try:
                    time.sleep(300)  # Run every 5 minutes
                    self._cleanup_expired_entries()
                    
                    if self.enable_persistence:
                        self._save_cache_to_disk()
                        
                except Exception as e:
                    current_app.logger.error(f"Cache cleanup error: {e}")
        
        cleanup_thread = threading.Thread(target=cleanup_worker, daemon=True)
        cleanup_thread.start()
    
    def _cleanup_expired_entries(self):
        """Remove expired cache entries"""
        with self._lock:
            expired_keys = []
            
            for cache_key, entry in self.entries.items():
                if entry.is_expired(self.default_ttl):
                    expired_keys.append(cache_key)
            
            for cache_key in expired_keys:
                self.delete(cache_key)
    
    def _save_cache_to_disk(self):
        """Save cache to disk for persistence"""
        try:
            with open(self.cache_file, 'wb') as f:
                pickle.dump({
                    'entries': self.entries,
                    'stats': self.stats
                }, f)
        except Exception as e:
            current_app.logger.error(f"Cache persistence save error: {e}")
    
    def _load_cache_from_disk(self):
        """Load cache from disk"""
        try:
            if self.cache_file.exists():
                with open(self.cache_file, 'rb') as f:
                    data = pickle.load(f)
                    self.entries = data.get('entries', {})
                    self.stats = data.get('stats', CacheStats())
        except Exception as e:
            current_app.logger.error(f"Cache persistence load error: {e}")


# Global cache instance
template_cache = AdvancedTemplateCache()


def smart_cached_component(template_path: str, 
                          cache_type: str = 'component',
                          ttl: Optional[int] = None,
                          tags: Optional[List[str]] = None,
                          dependencies: Optional[List[str]] = None,
                          enable_cache: bool = True):
    """Decorator for smart template caching"""
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not enable_cache:
                return func(*args, **kwargs)
            
            # Get template context
            context = kwargs.copy()
            context.update(dict(zip(func.__code__.co_varnames, args)))
            
            # Generate cache key
            cache_key = template_cache.cache_key(template_path, context, cache_type)
            
            # Try to get from cache
            cached_content = template_cache.get(cache_key)
            if cached_content:
                return cached_content
            
            # Render template and cache result
            start_time = time.time()
            result = func(*args, **kwargs)
            render_time = (time.time() - start_time) * 1000
            
            # Cache the result
            template_cache.set(
                cache_key=cache_key,
                content=result,
                ttl=ttl,
                tags=tags,
                dependencies=dependencies,
                render_time_ms=render_time
            )
            
            return result
        
        return wrapper
    return decorator


@contextmanager
def cache_invalidation_context(tags: List[str] = None, 
                              dependencies: List[str] = None):
    """Context manager for batch cache invalidation"""
    try:
        yield template_cache.invalidator
    finally:
        if tags:
            for tag in tags:
                template_cache.invalidate_by_tag(tag)
        
        if dependencies:
            for dep in dependencies:
                template_cache.invalidate_by_dependency(dep)


# Helper functions for easy integration
def invalidate_user_cache(user_id: str):
    """Invalidate all cache entries for a specific user"""
    template_cache.invalidate_by_pattern(f"user_{user_id}")


def invalidate_lesson_cache(lesson_id: str):
    """Invalidate all cache entries for a specific lesson"""
    template_cache.invalidate_by_dependency(f"lesson_{lesson_id}")


def invalidate_component_cache(component_name: str):
    """Invalidate all cache entries for a specific component"""
    template_cache.invalidate_by_tag(f"component_{component_name}")


def get_cache_performance() -> Dict[str, Any]:
    """Get current cache performance metrics"""
    return template_cache.get_stats()
