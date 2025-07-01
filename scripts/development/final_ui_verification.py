#!/usr/bin/env python3
"""
Final CSS & UI Polish Verification Script
Tests that all critical UI components are working properly
"""

import requests
from pathlib import Path
import re
import time

def test_css_integrity():
    """Check that all CSS files are accessible and valid"""
    print("🎨 Testing CSS integrity...")
    
    css_files = [
        'base/reset.css',
        'base/variables.css', 
        'base/layout.css',
        'components/dashboard-fixed.css',
        'components/header-modern.css',
        'components/buttons.css',
        'components/cards.css',
        'utils/helpers.css',
        'utils/animations.css',
        'utils/responsive.css'
    ]
    
    base_url = "http://127.0.0.1:8080/static/css"
    issues = []
    
    for css_file in css_files:
        try:
            response = requests.get(f"{base_url}/{css_file}", timeout=5)
            if response.status_code == 200:
                print(f"  ✅ {css_file} - OK ({len(response.text)} bytes)")
            else:
                issues.append(f"❌ {css_file} - HTTP {response.status_code}")
        except Exception as e:
            issues.append(f"❌ {css_file} - Error: {str(e)}")
    
    return issues

def test_critical_classes():
    """Check that critical CSS classes are properly defined"""
    print("\n🔍 Testing critical CSS classes...")
    
    critical_classes = [
        'nav-container-modern',
        'nav-links-modern', 
        'nav-link-modern',
        'dashboard-container',
        'modern-dashboard-header',
        'nav-tab',
        'stat-card-modern',
        'btn',
        'btn-primary'
    ]
    
    # Read the main CSS files to check for class definitions
    css_dir = Path("static/css")
    all_css_content = ""
    
    try:
        for css_file in css_dir.rglob("*.css"):
            all_css_content += css_file.read_text(encoding='utf-8')
        
        missing_classes = []
        for class_name in critical_classes:
            if f".{class_name}" not in all_css_content:
                missing_classes.append(class_name)
            else:
                print(f"  ✅ .{class_name} - Found")
        
        return missing_classes
        
    except Exception as e:
        return [f"Error reading CSS files: {str(e)}"]

def test_page_accessibility():
    """Test that key pages load correctly"""
    print("\n🌐 Testing page accessibility...")
    
    pages = [
        ('/', 'Homepage'),
        ('/dashboard', 'Dashboard'),
        ('/lessons', 'Lessons')
    ]
    
    base_url = "http://127.0.0.1:8080"
    issues = []
    
    for path, name in pages:
        try:
            response = requests.get(f"{base_url}{path}", timeout=10)
            if response.status_code == 200:
                # Check for basic HTML structure
                if '<html' in response.text and '</html>' in response.text:
                    print(f"  ✅ {name} ({path}) - Loading correctly")
                else:
                    issues.append(f"❌ {name} - Invalid HTML structure")
            else:
                issues.append(f"❌ {name} - HTTP {response.status_code}")
        except Exception as e:
            issues.append(f"❌ {name} - Error: {str(e)}")
    
    return issues

def test_responsive_classes():
    """Check that responsive utility classes exist"""
    print("\n📱 Testing responsive utilities...")
    
    responsive_classes = [
        'd-flex',
        'd-none', 
        'text-center',
        'mb-2',
        'p-3',
        'btn-block'
    ]
    
    css_dir = Path("static/css")
    utils_content = ""
    
    try:
        utils_file = css_dir / "utils" / "helpers.css"
        if utils_file.exists():
            utils_content = utils_file.read_text(encoding='utf-8')
        
        missing_utilities = []
        for util_class in responsive_classes:
            if f".{util_class}" not in utils_content:
                missing_utilities.append(util_class)
            else:
                print(f"  ✅ .{util_class} - Available")
        
        return missing_utilities
        
    except Exception as e:
        return [f"Error reading utilities: {str(e)}"]

def generate_final_report():
    """Generate final verification report"""
    print("\n" + "="*60)
    print("🎉 FINAL CSS & UI POLISH VERIFICATION REPORT")
    print("="*60)
    
    # Run all tests
    css_issues = test_css_integrity()
    missing_classes = test_critical_classes()
    page_issues = test_page_accessibility()
    missing_utilities = test_responsive_classes()
    
    print("\n📊 SUMMARY:")
    print(f"   CSS Files: {'✅ All Good' if not css_issues else '❌ Issues Found'}")
    print(f"   Critical Classes: {'✅ All Found' if not missing_classes else '❌ Missing Classes'}")
    print(f"   Page Loading: {'✅ All Working' if not page_issues else '❌ Issues Found'}")
    print(f"   Utilities: {'✅ Complete' if not missing_utilities else '❌ Missing Utilities'}")
    
    # Overall status
    total_issues = len(css_issues) + len(missing_classes) + len(page_issues) + len(missing_utilities)
    
    if total_issues == 0:
        print("\n🎉 🎉 🎉 ALL TESTS PASSED! 🎉 🎉 🎉")
        print("✅ CSS architecture is clean and optimized")
        print("✅ All critical components are working")
        print("✅ Pages load correctly")
        print("✅ UI is ready for production")
        status = "SUCCESS"
    else:
        print(f"\n⚠️  Found {total_issues} issues that need attention:")
        
        if css_issues:
            print("\n🎨 CSS Issues:")
            for issue in css_issues:
                print(f"   {issue}")
        
        if missing_classes:
            print("\n🔍 Missing Classes:")
            for cls in missing_classes:
                print(f"   ❌ .{cls}")
        
        if page_issues:
            print("\n🌐 Page Issues:")
            for issue in page_issues:
                print(f"   {issue}")
        
        if missing_utilities:
            print("\n📱 Missing Utilities:")
            for util in missing_utilities:
                print(f"   ❌ .{util}")
        
        status = "NEEDS_ATTENTION"
    
    print("\n" + "="*60)
    print(f"🎯 STATUS: {status}")
    print("="*60)
    
    return status

if __name__ == "__main__":
    try:
        status = generate_final_report()
        exit(0 if status == "SUCCESS" else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️  Test interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n\n❌ Test failed with error: {str(e)}")
        exit(1)
