#!/usr/bin/env python3
"""
CSS Conflicts Cleanup Script - FINAL VERSION
Resolves duplicate class definitions and consolidates CSS architecture
"""

import os
import re
import shutil
from pathlib import Path
from datetime import datetime

class CSSConflictResolver:
    def __init__(self):
        self.css_dir = Path("static/css")
        self.backup_dir = Path(f"css_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        self.conflicts_found = []
        self.actions_taken = []
        
    def create_backup(self):
        """Create backup of entire CSS directory before cleanup"""
        print("📦 Creating backup of CSS directory...")
        shutil.copytree(self.css_dir, self.backup_dir)
        print(f"✅ Backup created: {self.backup_dir}")
        
    def find_css_conflicts(self):
        """Scan all CSS files for conflicting class definitions"""
        print("🔍 Scanning for CSS conflicts...")
        
        conflicts = {
            '.navbar': [],
            '.search-container': [],
            '.search-bar': [],
            '.user-stats-modern': [],
            '.main-content': [],
            '.sidebar': [],
            '.btn-refresh': [],
            '.nav-tab': [],
            '.dashboard-grid': []
        }
        
        css_files = list(self.css_dir.rglob("*.css"))
        
        for file in css_files:
            if file.name in ['style_backup.css', 'temp_main.css']:
                continue
                
            try:
                content = file.read_text(encoding='utf-8')
                for selector in conflicts.keys():
                    if selector in content:
                        conflicts[selector].append(str(file.relative_to(self.css_dir)))
            except Exception as e:
                print(f"⚠️  Error reading {file}: {e}")
        
        # Report conflicts
        for selector, files in conflicts.items():
            if len(files) > 1:
                self.conflicts_found.append({
                    'selector': selector,
                    'files': files,
                    'count': len(files)
                })
                print(f"🚨 CONFLICT: {selector} found in {len(files)} files: {', '.join(files)}")
        
        return conflicts
    
    def resolve_navbar_conflicts(self):
        """Keep only the authoritative navbar in header-modern.css"""
        print("\n🔧 Resolving .navbar conflicts...")
        
        files_to_clean = [
            'components/header.css',
            'global.css',
            'components/navigation.css'
        ]
        
        for file_path in files_to_clean:
            full_path = self.css_dir / file_path
            if full_path.exists():
                content = full_path.read_text(encoding='utf-8')
                
                # Remove navbar definitions but keep other styles
                # Look for .navbar block and remove it
                pattern = r'\.navbar\s*{[^}]*}'
                updated_content = re.sub(pattern, '', content, flags=re.DOTALL | re.MULTILINE)
                
                # Also remove any .navbar descendant selectors
                pattern = r'\.navbar[^{]*{[^}]*}'
                updated_content = re.sub(pattern, '', updated_content, flags=re.DOTALL | re.MULTILINE)
                
                if content != updated_content:
                    full_path.write_text(updated_content, encoding='utf-8')
                    self.actions_taken.append(f"Removed .navbar from {file_path}")
                    print(f"✅ Cleaned .navbar from {file_path}")
    
    def resolve_search_conflicts(self):
        """Keep search styles only in header-modern.css"""
        print("\n🔧 Resolving search component conflicts...")
        
        # Remove search styles from global.css
        global_css = self.css_dir / 'global.css'
        if global_css.exists():
            content = global_css.read_text(encoding='utf-8')
            
            # Remove search-related selectors
            patterns = [
                r'\.search-container[^{]*{[^}]*}',
                r'\.search-bar[^{]*{[^}]*}',
                r'\.search-toggle[^{]*{[^}]*}',
                r'\.search-input[^{]*{[^}]*}',
                r'\.search-results[^{]*{[^}]*}'
            ]
            
            updated_content = content
            for pattern in patterns:
                updated_content = re.sub(pattern, '', updated_content, flags=re.DOTALL | re.MULTILINE)
            
            if content != updated_content:
                global_css.write_text(updated_content, encoding='utf-8')
                self.actions_taken.append("Removed search styles from global.css")
                print("✅ Removed search styles from global.css")
    
    def resolve_user_stats_conflicts(self):
        """Keep user-stats-modern only in header-modern.css"""
        print("\n🔧 Resolving user stats conflicts...")
        
        # Remove from dashboard-modern.css
        dashboard_modern = self.css_dir / 'pages/dashboard-modern.css'
        if dashboard_modern.exists():
            content = dashboard_modern.read_text(encoding='utf-8')
            
            # Remove .user-stats-modern and related selectors
            patterns = [
                r'\.user-stats-modern[^{]*{[^}]*}',
                r'\.user-stats-modern\s+[^{]*{[^}]*}'
            ]
            
            updated_content = content
            for pattern in patterns:
                updated_content = re.sub(pattern, '', updated_content, flags=re.DOTALL | re.MULTILINE)
            
            if content != updated_content:
                dashboard_modern.write_text(updated_content, encoding='utf-8')
                self.actions_taken.append("Removed .user-stats-modern from dashboard-modern.css")
                print("✅ Removed .user-stats-modern from dashboard-modern.css")
    
    def consolidate_dashboard_styles(self):
        """Merge dashboard.css into dashboard-modern.css and remove duplicates"""
        print("\n🔧 Consolidating dashboard styles...")
        
        old_dashboard = self.css_dir / 'components/dashboard.css'
        modern_dashboard = self.css_dir / 'pages/dashboard-modern.css'
        
        if old_dashboard.exists() and modern_dashboard.exists():
            old_content = old_dashboard.read_text(encoding='utf-8')
            modern_content = modern_dashboard.read_text(encoding='utf-8')
            
            # Add comment section for merged styles
            merged_section = f"""
/* ===== MERGED FROM components/dashboard.css ===== */
/* Merged on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} */

{old_content}

/* ===== END MERGED SECTION ===== */

"""
            
            # Append to modern dashboard
            updated_content = modern_content + merged_section
            modern_dashboard.write_text(updated_content, encoding='utf-8')
            
            # Move old dashboard to backup location within the file structure
            old_dashboard.rename(self.css_dir / 'components/dashboard_old.css')
            
            self.actions_taken.append("Merged components/dashboard.css into pages/dashboard-modern.css")
            print("✅ Merged dashboard styles")
    
    def clean_layout_conflicts(self):
        """Remove layout fixes from component files, keep in base/layout.css"""
        print("\n🔧 Cleaning layout conflicts...")
        
        # Remove main-content and sidebar fixes from header-modern.css
        header_modern = self.css_dir / 'components/header-modern.css'
        if header_modern.exists():
            content = header_modern.read_text(encoding='utf-8')
            
            # Remove layout-related global fixes
            patterns = [
                r'body\s*{[^}]*padding-top[^}]*}',
                r'\.main-content[^{]*{[^}]*}',
                r'\.sidebar[^{]*{[^}]*}'
            ]
            
            updated_content = content
            for pattern in patterns:
                updated_content = re.sub(pattern, '', updated_content, flags=re.DOTALL | re.MULTILINE)
            
            if content != updated_content:
                header_modern.write_text(updated_content, encoding='utf-8')
                self.actions_taken.append("Removed layout fixes from header-modern.css")
                print("✅ Cleaned layout fixes from header-modern.css")
    
    def remove_duplicate_files(self):
        """Remove clearly duplicate or obsolete CSS files"""
        print("\n🔧 Removing duplicate files...")
        
        files_to_remove = [
            'temp_main.css',
            'full_style_backup.css'
        ]
        
        for file_path in files_to_remove:
            full_path = self.css_dir / file_path
            if full_path.exists():
                # Move to backup instead of delete
                backup_path = self.backup_dir / file_path
                backup_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(full_path), str(backup_path))
                self.actions_taken.append(f"Moved {file_path} to backup")
                print(f"✅ Moved {file_path} to backup")
    
    def update_imports(self):
        """Update main.css and style.css imports after cleanup"""
        print("\n🔧 Updating CSS imports...")
        
        # Update main.css imports
        main_css = self.css_dir / 'main.css'
        if main_css.exists():
            updated_imports = """/* Code with Morais - Modern CSS Architecture */

/* Base Foundation */
@import url('base/variables.css');
@import url('base/reset.css');
@import url('base/layout.css');

/* Global Styles */
@import url('global.css');

/* Components */
@import url('components/buttons.css');
@import url('components/cards.css');
@import url('components/header-modern.css');  /* Authoritative header styles */

/* Pages */
@import url('pages/dashboard-modern.css');

/* Utilities */
@import url('utils/helpers.css');
@import url('utils/animations.css');
@import url('utils/responsive.css');

/* Theme Support */
:root {
    --header-height: 80px;
    --sidebar-width: 0px; /* Sidebar removed */
}

body {
    padding-top: var(--header-height);
    margin: 0;
}
"""
            main_css.write_text(updated_imports, encoding='utf-8')
            self.actions_taken.append("Updated main.css imports")
            print("✅ Updated main.css imports")
    
    def generate_report(self):
        """Generate cleanup report"""
        print("\n📊 Generating cleanup report...")
        
        report = f"""# CSS Cleanup Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Conflicts Found
{len(self.conflicts_found)} conflicts detected and resolved:

"""
        
        for conflict in self.conflicts_found:
            report += f"### {conflict['selector']}\n"
            report += f"Found in {conflict['count']} files:\n"
            for file in conflict['files']:
                report += f"- {file}\n"
            report += "\n"
        
        report += f"""## Actions Taken
{len(self.actions_taken)} cleanup actions performed:

"""
        
        for action in self.actions_taken:
            report += f"- {action}\n"
        
        report += f"""

## Backup Location
Complete backup saved to: `{self.backup_dir}`

## Next Steps
1. Test the application thoroughly
2. If issues occur, restore from backup
3. Update documentation with new CSS architecture
"""
        
        report_file = Path('CSS_CLEANUP_REPORT.md')
        report_file.write_text(report, encoding='utf-8')
        print(f"✅ Report saved to {report_file}")
        
        return report
    
    def run_cleanup(self):
        """Execute complete CSS cleanup process"""
        print("🚀 Starting CSS Conflict Resolution...")
        print("=" * 50)
        
        # Step 1: Create backup
        self.create_backup()
        
        # Step 2: Find conflicts
        conflicts = self.find_css_conflicts()
        
        if not self.conflicts_found:
            print("🎉 No conflicts found! CSS architecture is clean.")
            return
        
        print(f"\n📋 Found {len(self.conflicts_found)} conflicts to resolve")
        
        # Step 3: Resolve conflicts
        self.resolve_navbar_conflicts()
        self.resolve_search_conflicts()
        self.resolve_user_stats_conflicts()
        self.consolidate_dashboard_styles()
        self.clean_layout_conflicts()
        self.remove_duplicate_files()
        self.update_imports()
        
        # Step 4: Generate report
        self.generate_report()
        
        print("\n🎉 CSS Cleanup Complete!")
        print(f"📦 Backup saved to: {self.backup_dir}")
        print(f"📊 Report saved to: CSS_CLEANUP_REPORT.md")
        print("⚠️  Please test your application thoroughly!")

if __name__ == "__main__":
    resolver = CSSConflictResolver()
    resolver.run_cleanup()
