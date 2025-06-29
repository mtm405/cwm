import pytest
import json
from flask import session
from datetime import datetime
from app import app, get_current_user, award_xp_and_coins, DEV_USER

@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_user():
    """Return mock user data"""
    return {
        'uid': 'test-user-001',
        'username': 'TestUser',
        'xp': 1000,
        'pycoins': 50,
        'level': 3,
        'streak': 1
    }

def test_index_route(client):
    """Test landing page"""
    response = client.get('/')
    assert response.status_code == 200
    assert b'Learn Python the Fun Way!' in response.data

def test_dashboard_route(client):
    """Test dashboard page"""
    response = client.get('/dashboard')
    assert response.status_code == 200
    
def test_lessons_route(client):
    """Test lessons page"""
    response = client.get('/lessons')
    assert response.status_code == 200
    assert b'Python Learning Path' in response.data
    
def test_lesson_detail_route(client):
    """Test individual lesson page"""
    response = client.get('/lesson/python-basics')
    assert response.status_code == 200
    assert b'Python Basics' in response.data

def test_lesson_not_found(client):
    """Test non-existent lesson"""
    response = client.get('/lesson/non-existent')
    assert response.status_code == 404

def test_complete_subtopic_api(client):
    """Test subtopic completion API"""
    # Mock authentication
    with client.session_transaction() as sess:
        sess['user_id'] = 'test_user'
        
    response = client.post('/api/lesson/complete-subtopic', 
                         json={
                             'lesson_id': 'python-basics',
                             'subtopic_id': 'variables'
                         })
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] == True
    assert 'xp_earned' in data
    assert 'new_progress' in data

def test_submit_code_api(client):
    """Test code submission API"""
    data = {
        'code': 'print("Hello World")',
        'lesson_id': 'python-basics',
        'challenge_id': 'hello_world_challenge'
    }
    
    response = client.post('/api/submit-code',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 200
    result = json.loads(response.data)
    assert result['success'] == True
    assert 'xp_earned' in result
    assert 'coins_earned' in result

def test_quiz_start_api(client):
    """Test quiz start API"""
    response = client.post('/api/quiz/python-basics-quiz/start')
    
    assert response.status_code == 200
    result = json.loads(response.data)
    assert result['success'] == True
    assert 'quiz' in result
    assert 'questions' in result['quiz']

def test_quiz_submit_api(client):
    """Test quiz submission API"""
    answers = {
        '0': 'print("Hello World")',
        '1': 'True',
        '2': '='
    }
    
    response = client.post('/api/quiz/python-basics-quiz/submit',
                          data=json.dumps({'answers': answers}),
                          content_type='application/json')
    
    assert response.status_code == 200
    result = json.loads(response.data)
    assert 'score' in result
    assert 'passed' in result
    assert 'results' in result

def test_spend_coins_api(client):
    """Test coin spending API"""
    data = {
        'amount': 10,
        'item': 'quiz_retake'
    }
    
    response = client.post('/api/spend-coins',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 200
    result = json.loads(response.data)
    assert result['success'] == True
    assert 'new_balance' in result

def test_spend_coins_insufficient(client):
    """Test spending more coins than available"""
    # Set user coins to a low amount
    original_coins = DEV_USER['pycoins']
    DEV_USER['pycoins'] = 5
    
    data = {
        'amount': 10,
        'item': 'quiz_retake'
    }
    
    response = client.post('/api/spend-coins',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 400
    result = json.loads(response.data)
    assert 'error' in result
    
    # Restore original coins
    DEV_USER['pycoins'] = original_coins

def test_update_theme_api(client):
    """Test theme update API"""
    data = {'theme': 'light'}
    
    response = client.post('/api/update-theme',
                          data=json.dumps(data),
                          content_type='application/json')
    
    assert response.status_code == 200
    result = json.loads(response.data)
    assert result['success'] == True
    assert result['theme'] == 'light'

def test_award_xp_and_coins():
    """Test XP and coin awarding function"""
    original_xp = DEV_USER['xp']
    original_coins = DEV_USER['pycoins']
    
    result = award_xp_and_coins('dev-user-001', xp=100, coins=20)
    
    assert result is not None
    assert DEV_USER['xp'] == original_xp + 100
    assert DEV_USER['pycoins'] == original_coins + 20
    
    # Restore original values
    DEV_USER['xp'] = original_xp
    DEV_USER['pycoins'] = original_coins

def test_get_current_user():
    """Test getting current user in dev mode"""
    user = get_current_user()
    assert user is not None
    assert user['uid'] == 'dev-user-001'
    assert 'username' in user
    assert 'xp' in user
    assert 'pycoins' in user

def test_mock_lessons_data(client):
    """Test that mock lessons data is properly structured"""
    response = client.get('/lessons')
    assert response.status_code == 200
    
    # Check that lessons are displayed
    assert b'Python Basics' in response.data
    assert b'Control Flow' in response.data
    assert b'Functions' in response.data

def test_daily_challenge_structure():
    """Test daily challenge data structure"""
    from app import get_daily_challenge
    
    challenge = get_daily_challenge()
    assert challenge is not None
    assert 'id' in challenge
    assert 'title' in challenge
    assert 'xp_reward' in challenge
    assert 'coin_reward' in challenge

def test_recent_activity_structure():
    """Test recent activity data structure"""
    from app import get_recent_activity
    
    activities = get_recent_activity('dev-user-001')
    assert isinstance(activities, list)
    assert len(activities) > 0
    
    for activity in activities:
        assert 'type' in activity
        assert 'message' in activity
        assert 'timestamp' in activity
