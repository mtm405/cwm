#!/usr/bin/env python3
"""
Quick CSS Import and Class Check
"""

import os
import re
from pathlib import Path

def check_imports_and_classes():
    # Check which files are actually being imported
    try:
        main_css = Path('static/css/main.css').read_text()
        imports = re.findall(r"@import url\(['\"]([^'\"]+)['\"]", main_css)
        print('📋 CURRENTLY IMPORTED FILES:')
        for imp in imports:
            print(f'  ✅ {imp}')

        print('\n🔍 DASHBOARD TEMPLATE CRITICAL CLASSES:')
        critical_classes = [
            'dashboard-container', 'modern-dashboard-header', 'header-content',
            'welcome-section', 'dashboard-subtitle', 'header-actions',
            'btn', 'btn-primary', 'dashboard-nav', 'nav-tabs-container',
            'nav-tab', 'btn-refresh', 'tab-content',
            'stats-grid-modern', 'stat-card-modern'
        ]

        # Check if classes exist in dashboard-fixed.css
        dashboard_css_path = Path('static/css/components/dashboard-fixed.css')
        if dashboard_css_path.exists():
            dashboard_css = dashboard_css_path.read_text()
            
            # Check all imported CSS files for classes
            import_paths = re.findall(r"@import url\(['\"]([^'\"]+)['\"]", Path('static/css/main.css').read_text())
            all_css_content = ""
            
            for import_path in import_paths:
                css_file = Path(f'static/css/{import_path}')
                if css_file.exists():
                    all_css_content += css_file.read_text() + "\n"
            
            for class_name in critical_classes:
                clean_class = class_name.replace('.', '')
                if f'.{clean_class}' in all_css_content:
                    print(f'  ✅ .{class_name}')
                else:
                    print(f'  ❌ .{class_name} - MISSING!')
        else:
            print('  ❌ dashboard-fixed.css NOT FOUND!')

        # Count total imports vs conflicts
        print(f'\n📊 SUMMARY:')
        print(f'  Import Files: {len(imports)}')
        print(f'  Expected Files: 8 (base + components + utils)')
        print(f'  Status: {"✅ Clean" if len(imports) <= 8 else "⚠️ Too many imports"}')

    except Exception as e:
        print(f'Error: {e}')

if __name__ == "__main__":
    check_imports_and_classes()
