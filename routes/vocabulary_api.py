"""
API routes for vocabulary functionality.
"""
from flask import Blueprint, jsonify, request, current_app
from services.firebase_service import get_firebase_service
import logging

logger = logging.getLogger(__name__)

vocabulary_api = Blueprint('vocabulary_api', __name__)

@vocabulary_api.route('/api/vocabulary', methods=['GET'])
def get_all_vocabulary():
    """Get all vocabulary terms or filter by category."""
    try:
        firebase_service = get_firebase_service()
        
        if not firebase_service:
            return jsonify({'error': 'Firebase service unavailable'}), 503
        
        # Check if category filter is provided
        category = request.args.get('category')
        
        if category:
            # Get vocabulary filtered by category
            vocabulary = firebase_service.get_vocabulary_by_category(category)
            logger.info(f"Retrieved {len(vocabulary)} vocabulary terms for category: {category}")
        else:
            # Get all vocabulary
            vocabulary = firebase_service.get_all_vocabulary()
            logger.info(f"Retrieved {len(vocabulary)} vocabulary terms")
        
        return jsonify(vocabulary), 200
        
    except Exception as e:
        logger.error(f"Error retrieving vocabulary: {str(e)}")
        return jsonify({'error': 'Failed to retrieve vocabulary'}), 500

@vocabulary_api.route('/api/vocabulary/categories', methods=['GET'])
def get_vocabulary_categories():
    """Get all vocabulary categories."""
    try:
        firebase_service = get_firebase_service()
        
        if not firebase_service:
            return jsonify({'error': 'Firebase service unavailable'}), 503
        
        categories = firebase_service.get_vocabulary_categories()
        logger.info(f"Retrieved {len(categories)} vocabulary categories")
        
        return jsonify(categories), 200
        
    except Exception as e:
        logger.error(f"Error retrieving vocabulary categories: {str(e)}")
        return jsonify({'error': 'Failed to retrieve vocabulary categories'}), 500

@vocabulary_api.route('/api/vocabulary/<term_id>', methods=['GET'])
def get_vocabulary_term(term_id):
    """Get a specific vocabulary term."""
    try:
        firebase_service = get_firebase_service()
        
        if not firebase_service:
            return jsonify({'error': 'Firebase service unavailable'}), 503
        
        term = firebase_service.get_vocabulary_term(term_id)
        
        if term:
            logger.info(f"Retrieved vocabulary term: {term_id}")
            return jsonify(term), 200
        else:
            logger.warning(f"Vocabulary term not found: {term_id}")
            return jsonify({'error': 'Vocabulary term not found'}), 404
            
    except Exception as e:
        logger.error(f"Error retrieving vocabulary term {term_id}: {str(e)}")
        return jsonify({'error': 'Failed to retrieve vocabulary term'}), 500

@vocabulary_api.route('/api/vocabulary/random', methods=['GET'])
def get_random_vocabulary():
    """Get a random set of vocabulary terms for flash cards."""
    try:
        firebase_service = get_firebase_service()
        
        if not firebase_service:
            return jsonify({'error': 'Firebase service unavailable'}), 503
        
        # Get all vocabulary
        all_terms = firebase_service.get_all_vocabulary()
        
        if not all_terms:
            return jsonify([]), 200
            
        # Limit number of terms (optional)
        limit = request.args.get('limit', default=10, type=int)
        
        # Import random here to avoid global import
        import random
        
        # Select random terms
        if len(all_terms) <= limit:
            random_terms = all_terms
        else:
            random_terms = random.sample(all_terms, limit)
        
        logger.info(f"Retrieved {len(random_terms)} random vocabulary terms")
        return jsonify(random_terms), 200
        
    except Exception as e:
        logger.error(f"Error retrieving random vocabulary terms: {str(e)}")
        return jsonify({'error': 'Failed to retrieve random vocabulary terms'}), 500

@vocabulary_api.route('/api/vocabulary/stats', methods=['GET'])
def get_vocabulary_stats():
    """Get vocabulary statistics."""
    try:
        firebase_service = get_firebase_service()
        
        if not firebase_service:
            return jsonify({'error': 'Firebase service unavailable'}), 503
        
        stats = firebase_service.get_vocabulary_stats()
        logger.info(f"Retrieved vocabulary stats: {stats}")
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error retrieving vocabulary stats: {str(e)}")
        return jsonify({'error': 'Failed to retrieve vocabulary statistics'}), 500

@vocabulary_api.route('/api/vocabulary/search', methods=['GET'])
def search_vocabulary():
    """Search vocabulary terms by query."""
    try:
        firebase_service = get_firebase_service()
        
        if not firebase_service:
            return jsonify({'error': 'Firebase service unavailable'}), 503
        
        query = request.args.get('q', '').strip().lower()
        category = request.args.get('category')
        difficulty = request.args.get('difficulty')
        
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        # Get vocabulary terms based on filters
        if category:
            terms = firebase_service.get_vocabulary_by_category(category)
        else:
            terms = firebase_service.get_all_vocabulary()
        
        # Filter by difficulty if specified
        if difficulty:
            terms = [term for term in terms if term.get('difficulty') == difficulty]
        
        # Search through terms
        matching_terms = []
        for term in terms:
            # Search in term name, definition, and tags
            if (query in term.get('term', '').lower() or
                query in term.get('definition', '').lower() or
                any(query in tag.lower() for tag in term.get('tags', []))):
                matching_terms.append(term)
        
        logger.info(f"Found {len(matching_terms)} terms matching query: {query}")
        return jsonify(matching_terms), 200
        
    except Exception as e:
        logger.error(f"Error searching vocabulary: {str(e)}")
        return jsonify({'error': 'Failed to search vocabulary'}), 500
