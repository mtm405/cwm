#!/usr/bin/env python3
"""
Phase 8: Quick Test Runner
Simple test to verify the lesson system is working
"""

import subprocess
import sys
import os
import time

def run_command(command, description):
    """Run a command and return success status"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"❌ {description} failed")
            if result.stderr:
                print(f"Error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"⏰ {description} timed out")
        return False
    except Exception as e:
        print(f"❌ {description} error: {str(e)}")
        return False

def check_files():
    """Check if required files exist"""
    print("\n📁 Checking required files...")
    
    required_files = [
        "static/js/core/LessonSystemTest.js",
        "static/js/core/initializationQueue.js", 
        "static/js/core/moduleInitializer.js",
        "templates/test-lesson-system.html",
        "routes/main_routes.py"
    ]
    
    missing_files = []
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} - MISSING")
            missing_files.append(file_path)
    
    if missing_files:
        print(f"\n🚨 {len(missing_files)} required files are missing!")
        return False
    else:
        print(f"\n✅ All {len(required_files)} required files are present")
        return True

def main():
    """Run quick tests"""
    print("🚀 Phase 8: Quick Test Runner")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("app.py"):
        print("❌ Please run this script from the CwM project root directory")
        return False
    
    # Check required files
    if not check_files():
        print("\n❌ File check failed - some required files are missing")
        return False
    
    # Test Python syntax
    python_tests = [
        ("python -m py_compile app.py", "Python syntax check for app.py"),
        ("python -m py_compile routes/main_routes.py", "Python syntax check for routes"),
        ("python -m py_compile test_phase8_integration.py", "Python syntax check for test script")
    ]
    
    python_passed = 0
    for command, description in python_tests:
        if run_command(command, description):
            python_passed += 1
    
    print(f"\n📊 Python Tests: {python_passed}/{len(python_tests)} passed")
    
    # Try to run the integration test
    print("\n🧪 Running integration test...")
    integration_success = run_command(
        "python test_phase8_integration.py", 
        "Integration test suite"
    )
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 QUICK TEST SUMMARY")
    print("=" * 50)
    
    files_ok = check_files()
    syntax_ok = python_passed == len(python_tests)
    
    print(f"📁 File Check: {'✅ PASSED' if files_ok else '❌ FAILED'}")
    print(f"🐍 Python Syntax: {'✅ PASSED' if syntax_ok else '❌ FAILED'}")
    print(f"🔗 Integration Test: {'✅ PASSED' if integration_success else '❌ FAILED'}")
    
    overall_success = files_ok and syntax_ok
    
    if overall_success:
        print("\n🎉 QUICK TESTS PASSED!")
        print("✅ Basic system integrity verified")
        print("\n🚀 To run full tests:")
        print("   1. Start the Flask server: python app.py")
        print("   2. Run integration tests: python test_phase8_integration.py")
        print("   3. Open browser: http://localhost:8080/test-lesson-system")
    else:
        print("\n⚠️  SOME TESTS FAILED")
        print("Please fix the issues above before proceeding.")
    
    print("\n📝 Files created in Phase 8:")
    print("   • static/js/core/LessonSystemTest.js - Comprehensive test suite")
    print("   • templates/test-lesson-system.html - Interactive test page")
    print("   • test_phase8_integration.py - Integration test script")
    print("   • test_phase8_quick.py - This quick test script")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
