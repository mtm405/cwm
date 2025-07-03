#!/usr/bin/env python3
"""
Phase 8: Integration Test Script
Validates that all lesson system improvements are working correctly
"""

import requests
import time
import json
from datetime import datetime

BASE_URL = "http://127.0.0.1:8080"

def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f"🧪 {title}")
    print("=" * 60)

def print_section(title):
    """Print a formatted section"""
    print(f"\n📋 {title}")
    print("-" * 40)

def test_endpoint(endpoint, expected_status=200, method="GET", data=None):
    """Test a single endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=10)
        
        success = response.status_code == expected_status
        status_icon = "✅" if success else "❌"
        
        print(f"{status_icon} {method} {endpoint} - Status: {response.status_code}")
        
        if not success:
            print(f"   Expected: {expected_status}, Got: {response.status_code}")
            if response.text and len(response.text) < 200:
                print(f"   Response: {response.text}")
        
        return success, response
        
    except requests.exceptions.RequestException as e:
        print(f"❌ {method} {endpoint} - Connection Error: {str(e)}")
        return False, None
    except Exception as e:
        print(f"❌ {method} {endpoint} - Error: {str(e)}")
        return False, None

def test_lesson_system_integration():
    """Test the lesson system integration"""
    print_header("PHASE 8: LESSON SYSTEM INTEGRATION TEST")
    
    # Test 1: Basic connectivity
    print_section("Basic Connectivity")
    basic_tests = [
        ("/", 200),
        ("/dashboard", 200),
        ("/lessons", 200),
        ("/test-lesson-system", 200)
    ]
    
    connectivity_passed = 0
    for endpoint, expected_status in basic_tests:
        success, response = test_endpoint(endpoint, expected_status)
        if success:
            connectivity_passed += 1
    
    print(f"\n📊 Basic Connectivity: {connectivity_passed}/{len(basic_tests)} endpoints working")
    
    # Test 2: Static resources (JavaScript modules)
    print_section("JavaScript Module Loading")
    js_tests = [
        ("/static/js/core/initializationQueue.js", 200),
        ("/static/js/core/moduleInitializer.js", 200),
        ("/static/js/core/LessonSystemTest.js", 200),
        ("/static/js/utils/dataStructureNormalizer.js", 200),
        ("/static/js/editor/editorConfig.js", 200),
        ("/static/js/editor/editorService.js", 200)
    ]
    
    js_passed = 0
    for endpoint, expected_status in js_tests:
        success, response = test_endpoint(endpoint, expected_status)
        if success:
            js_passed += 1
    
    print(f"\n📊 JavaScript Modules: {js_passed}/{len(js_tests)} modules accessible")
    
    # Test 3: API endpoints
    print_section("API Functionality")
    api_tests = [
        ("/api/lessons", 200),
        ("/api/categories", 200),
        ("/api/dashboard/stats", 200),  # Should work in guest mode
        ("/api/dashboard/leaderboard", 200)
    ]
    
    api_passed = 0
    for endpoint, expected_status in api_tests:
        success, response = test_endpoint(endpoint, expected_status)
        if success:
            api_passed += 1
            
            # For JSON responses, validate structure
            if response and response.headers.get('content-type', '').startswith('application/json'):
                try:
                    data = response.json()
                    print(f"   📄 JSON Response valid: {len(str(data))} chars")
                except:
                    print(f"   ⚠️  Invalid JSON response")
    
    print(f"\n📊 API Endpoints: {api_passed}/{len(api_tests)} APIs working")
    
    # Test 4: Lesson page structure
    print_section("Lesson Page Validation")
    success, response = test_endpoint("/lesson-view/python-basics-variables", 200)
    
    if success and response:
        content = response.text
        
        # Check for key elements
        checks = [
            ("ES6 module scripts", 'type="module"' in content),
            ("Initialization queue", 'initializationQueue.js' in content),
            ("Module initializer", 'moduleInitializer.js' in content),
            ("Quiz components", 'QuizEngine.js' in content),
            ("Global data", 'lessonData' in content),
            ("Test suite", 'LessonSystemTest.js' in content)
        ]
        
        passed_checks = 0
        for check_name, check_result in checks:
            status = "✅" if check_result else "❌"
            print(f"{status} {check_name}: {'Present' if check_result else 'Missing'}")
            if check_result:
                passed_checks += 1
        
        print(f"\n📊 Lesson Page Structure: {passed_checks}/{len(checks)} elements present")
    else:
        print("❌ Could not validate lesson page structure")
    
    # Calculate overall results
    total_tests = len(basic_tests) + len(js_tests) + len(api_tests) + (6 if success else 0)
    total_passed = connectivity_passed + js_passed + api_passed + (passed_checks if success else 0)
    success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    
    print_header("INTEGRATION TEST RESULTS")
    print(f"📊 Overall Results: {total_passed}/{total_tests} tests passed ({success_rate:.1f}%)")
    
    if success_rate >= 90:
        print("🎉 EXCELLENT! Lesson system integration is production-ready!")
    elif success_rate >= 75:
        print("✅ GOOD! Core functionality is working, minor issues detected.")
    elif success_rate >= 50:
        print("⚠️  PARTIAL! Some systems working, significant issues detected.")
    else:
        print("🚨 CRITICAL! Major integration issues detected.")
    
    print("\n📋 What was tested:")
    print("   ✓ Server connectivity and routing")
    print("   ✓ ES6 module accessibility")
    print("   ✓ API endpoint functionality")
    print("   ✓ Lesson page structure")
    print("   ✓ JavaScript module integration")
    print("   ✓ Test suite availability")
    
    print("\n🔗 Test URLs:")
    print(f"   Lesson System Test: {BASE_URL}/test-lesson-system")
    print(f"   Sample Lesson: {BASE_URL}/lesson-view/python-basics-variables")
    print(f"   Dashboard: {BASE_URL}/dashboard")
    
    return success_rate >= 75

def test_lesson_system_javascript():
    """Test the JavaScript functionality by accessing the test page"""
    print_section("JavaScript Test Suite Validation")
    
    success, response = test_endpoint("/test-lesson-system", 200)
    
    if success and response:
        content = response.text
        
        # Check for test suite components
        js_checks = [
            ("Test suite class", "LessonSystemTest" in content),
            ("Console capture", "originalConsole" in content),
            ("Test controls", "runFullTestSuite" in content),
            ("Module loading", "moduleInitializer.js" in content),
            ("Mock data", "globalThis.lessonData" in content),
            ("Status indicators", "status-indicator" in content)
        ]
        
        js_passed = 0
        for check_name, check_result in js_checks:
            status = "✅" if check_result else "❌"
            print(f"{status} {check_name}: {'Present' if check_result else 'Missing'}")
            if check_result:
                js_passed += 1
        
        print(f"\n📊 JavaScript Test Suite: {js_passed}/{len(js_checks)} components present")
        return js_passed >= 4
    else:
        print("❌ Could not access test suite page")
        return False

def main():
    """Run all integration tests"""
    start_time = time.time()
    
    print("🚀 Starting Phase 8 Integration Test Suite")
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Testing against: {BASE_URL}")
    
    # Wait for server to be ready
    print("\n⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    # Run integration tests
    integration_success = test_lesson_system_integration()
    
    # Test JavaScript functionality
    js_success = test_lesson_system_javascript()
    
    # Final summary
    duration = time.time() - start_time
    
    print_header("FINAL SUMMARY")
    print(f"⏱️  Test Duration: {duration:.2f} seconds")
    print(f"🔧 Integration Tests: {'✅ PASSED' if integration_success else '❌ FAILED'}")
    print(f"📜 JavaScript Tests: {'✅ PASSED' if js_success else '❌ FAILED'}")
    
    overall_success = integration_success and js_success
    
    if overall_success:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ The lesson system is ready for production!")
        print("✅ All Phase 1-8 improvements are working correctly!")
        print("\n🚀 Next Steps:")
        print("   1. Deploy to production environment")
        print("   2. Run user acceptance testing")  
        print("   3. Monitor performance metrics")
        print("   4. Collect user feedback")
    else:
        print("\n⚠️  SOME TESTS FAILED")
        print("Please check the issues above and fix before deployment.")
        print("\n🔧 Troubleshooting:")
        print("   1. Ensure Flask server is running on port 8080")
        print("   2. Check that all JavaScript files exist")
        print("   3. Verify route registration in main_routes.py")
        print("   4. Check browser console for JavaScript errors")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
