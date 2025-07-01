#!/usr/bin/env python3
"""
CSS Structure Verification Script
Checks if all CSS files are accessible and properly structured
"""

import os
from pathlib import Path

def verify_css_structure():
    print("🔍 Verifying CSS Structure...")
    
    css_dir = Path("static/css")
    
    # Expected files
    expected_files = [
        "main.css",
        "global.css", 
        "style.css",
        "base/variables.css",
        "base/reset.css", 
        "base/layout.css",
        "components/buttons.css",
        "components/cards.css",
        "components/header.css",
        "components/header-modern.css",
        "components/navigation.css",
        "components/dashboard.css",
        "pages/dashboard-modern.css",
        "utils/helpers.css",
        "utils/animations.css",
        "utils/responsive.css"
    ]
    
    missing_files = []
    empty_files = []
    
    for file_path in expected_files:
        full_path = css_dir / file_path
        if not full_path.exists():
            missing_files.append(file_path)
        elif full_path.stat().st_size == 0:
            empty_files.append(file_path)
    
    # Report results
    if missing_files:
        print("❌ Missing CSS files:")
        for file in missing_files:
            print(f"   - {file}")
    
    if empty_files:
        print("⚠️  Empty CSS files:")
        for file in empty_files:
            print(f"   - {file}")
    
    if not missing_files and not empty_files:
        print("✅ All CSS files present and non-empty!")
    
    # Check main.css imports
    main_css = css_dir / "main.css"
    if main_css.exists():
        content = main_css.read_text()
        import_count = content.count("@import")
        print(f"📦 Main.css has {import_count} import statements")
    
    print("\n🎯 CSS Structure Verification Complete!")

if __name__ == "__main__":
    verify_css_structure()
