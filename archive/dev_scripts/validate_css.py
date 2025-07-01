#!/usr/bin/env python3
"""
CSS Architecture Validation Script
Checks for common issues in the refactored CSS structure
"""

import os
import re
from pathlib import Path

def check_css_architecture():
    """Validate the CSS architecture structure and content"""
    
    css_dir = Path("static/css")
    issues = []
    
    # Check if main.css exists and has proper imports
    main_css = css_dir / "main.css"
    if not main_css.exists():
        issues.append("❌ main.css is missing")
    else:
        content = main_css.read_text()
        required_imports = [
            "base/variables.css",
            "base/reset.css", 
            "base/layout.css",
            "global.css",
            "components/buttons.css",
            "utils/helpers.css"
        ]
        for imp in required_imports:
            if imp not in content:
                issues.append(f"❌ Missing import: {imp}")
    
    # Check if variables.css has required custom properties
    variables_css = css_dir / "base" / "variables.css"
    if not variables_css.exists():
        issues.append("❌ base/variables.css is missing")
    else:
        content = variables_css.read_text()
        required_vars = [
            "--primary-color",
            "--bg-primary",
            "--text-primary",
            "--font-primary",
            "--spacing-md",
            "--radius-md",
            "--transition-base"
        ]
        for var in required_vars:
            if var not in content:
                issues.append(f"❌ Missing CSS variable: {var}")
    
    # Check for duplicate variable definitions
    css_files = list(css_dir.rglob("*.css"))
    variable_definitions = {}
    
    for file in css_files:
        if file.name == "style_backup.css":  # Skip backup
            continue
            
        try:
            content = file.read_text(encoding='utf-8')
            # Find CSS variable definitions
            var_pattern = r'--[\w-]+\s*:'
            vars_in_file = re.findall(var_pattern, content)
            
            for var in vars_in_file:
                var_name = var.replace(':', '').strip()
                if var_name in variable_definitions:
                    issues.append(f"⚠️  Duplicate variable {var_name} in {file} and {variable_definitions[var_name]}")
                else:
                    variable_definitions[var_name] = file
        except Exception as e:
            issues.append(f"❌ Error reading {file}: {e}")
    
    # Check for proper file organization
    expected_structure = {
        "base": ["variables.css", "reset.css", "layout.css"],
        "components": ["buttons.css", "cards.css", "forms.css", "header.css"],
        "utils": ["helpers.css", "animations.css", "responsive.css"],
        "pages": []  # Optional
    }
    
    for folder, files in expected_structure.items():
        folder_path = css_dir / folder
        if not folder_path.exists():
            issues.append(f"❌ Missing folder: {folder}")
        else:
            for file in files:
                file_path = folder_path / file
                if not file_path.exists():
                    issues.append(f"❌ Missing file: {folder}/{file}")
    
    # Check if global.css exists
    if not (css_dir / "global.css").exists():
        issues.append("❌ global.css is missing")
    
    # Report results
    if not issues:
        print("✅ CSS architecture validation passed!")
        print("🎉 All files are properly organized and no issues found.")
    else:
        print("❌ CSS architecture validation found issues:")
        for issue in issues:
            print(f"   {issue}")
        print(f"\n📊 Total issues found: {len(issues)}")
    
    return len(issues) == 0

if __name__ == "__main__":
    check_css_architecture()
