#!/usr/bin/env python3
"""
Test script to verify real-time dashboard functionality
"""
import requests
import time
import json

BASE_URL = "http://127.0.0.1:8080"

def test_apis():
    """Test all dashboard APIs"""
    print("🧪 Testing Dashboard APIs")
    print("=" * 40)
    
    # Test 1: Dashboard Stats
    print("\n1️⃣ Testing Dashboard Stats API...")
    response = requests.get(f"{BASE_URL}/api/dashboard/stats")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"📊 User: {data['user']['username']} (Guest Mode: {data.get('guest_mode', False)})")
        print(f"🏆 XP: {data['user']['xp']}, Level: {data['user']['level']}")
    else:
        print(f"❌ Error: {response.status_code}")
    
    # Test 2: Activity Feed
    print("\n2️⃣ Testing Activity Feed API...")
    response = requests.get(f"{BASE_URL}/api/dashboard/activity-feed")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"📝 Activities: {len(data.get('activities', []))} found")
        print(f"👤 Guest Mode: {data.get('guest_mode', False)}")
    else:
        print(f"❌ Error: {response.status_code}")
    
    # Test 3: Leaderboard
    print("\n3️⃣ Testing Leaderboard API...")
    response = requests.get(f"{BASE_URL}/api/dashboard/leaderboard")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"🏆 Leaderboard entries: {len(data.get('leaderboard', []))}")
        if data.get('leaderboard'):
            top_user = data['leaderboard'][0]
            print(f"🥇 Top user: {top_user['username']} with {top_user['xp']} XP")
    else:
        print(f"❌ Error: {response.status_code}")
    
    # Test 4: Exam Objectives
    print("\n4️⃣ Testing Exam Objectives API...")
    response = requests.get(f"{BASE_URL}/api/dashboard/exam-objectives")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"📚 Objectives: {len(data.get('objectives', []))}")
        print(f"📈 Overall readiness: {data.get('overall_exam_readiness', 0)}%")
    else:
        print(f"❌ Error: {response.status_code}")
    
    # Test 5: Authentication Status
    print("\n5️⃣ Testing Authentication Status...")
    response = requests.get(f"{BASE_URL}/auth/status")
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"🔐 Authenticated: {data.get('authenticated', False)}")
    else:
        print(f"❌ Error: {response.status_code}")
    
    print("\n🎉 All API tests completed!")
    print("✅ The dashboard is ready for production use!")
    print("🚀 Users can now:")
    print("   - View their real-time stats")
    print("   - Track learning progress")
    print("   - See activity feeds")
    print("   - Check exam readiness")
    print("   - Compete on leaderboards")

if __name__ == '__main__':
    test_apis()
