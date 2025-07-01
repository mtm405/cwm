#!/usr/bin/env python3
"""
Comprehensive CSS Audit Script
Checks for duplicate classes, validates file responsibilities, and ensures clean architecture
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict
from datetime import datetime

class CSSAuditor:
    def __init__(self):
        self.css_dir = Path("static/css")
        self.results = {
            'duplicate_classes': {},
            'file_analysis': {},
            'architecture_violations': [],
            'recommendations': [],
            'summary': {}
        }
        
    def extract_css_classes(self, file_path):
        """Extract all CSS class selectors from a file"""
        try:
            content = file_path.read_text(encoding='utf-8')
            # Remove comments
            content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
            
            # Find class selectors (including compound selectors)
            class_patterns = [
                r'\.([a-zA-Z][a-zA-Z0-9_-]*)',  # Basic classes
                r'\.([a-zA-Z][a-zA-Z0-9_-]*(?:-[a-zA-Z0-9_-]*)*)',  # Hyphenated classes
            ]
            
            classes = set()
            for pattern in class_patterns:
                matches = re.findall(pattern, content)
                classes.update(matches)
            
            # Also extract selector combinations
            selectors = re.findall(r'([^{}\n]+)\s*{', content)
            class_selectors = []
            for selector in selectors:
                if '.' in selector:
                    class_selectors.append(selector.strip())
            
            return {
                'classes': sorted(list(classes)),
                'selectors': class_selectors,
                'file_size': len(content),
                'line_count': len(content.split('\n'))
            }
        except Exception as e:
            return {
                'classes': [],
                'selectors': [],
                'file_size': 0,
                'line_count': 0,
                'error': str(e)
            }
    
    def analyze_files(self):
        """Analyze all CSS files"""
        print("🔍 Analyzing CSS files...")
        
        css_files = list(self.css_dir.rglob("*.css"))
        all_classes = defaultdict(list)
        
        for css_file in css_files:
            relative_path = str(css_file.relative_to(self.css_dir))
            print(f"  📄 Analyzing {relative_path}")
            
            analysis = self.extract_css_classes(css_file)
            self.results['file_analysis'][relative_path] = analysis
            
            # Track class usage across files
            for class_name in analysis['classes']:
                all_classes[class_name].append(relative_path)
        
        # Find duplicates
        for class_name, files in all_classes.items():
            if len(files) > 1:
                self.results['duplicate_classes'][class_name] = files
        
        return all_classes
    
    def check_architecture_compliance(self):
        """Check if files are following the intended architecture"""
        print("🏗️ Checking architecture compliance...")
        
        # Define expected responsibilities
        file_responsibilities = {
            'base/variables.css': ['root variables', 'theme definitions'],
            'base/reset.css': ['universal selectors', 'element resets'],
            'base/layout.css': ['container', 'grid', 'flex', 'layout utilities'],
            
            'components/header-modern.css': ['navbar', 'nav-', 'search-', 'user-', 'live-clock'],
            'components/dashboard.css': ['dashboard-', 'main-content', 'stats-', 'tab-'],
            'components/navigation.css': ['sidebar', 'nav-menu', 'breadcrumb'],
            'components/cards.css': ['card', 'lesson-card'],
            'components/buttons.css': ['btn', 'button'],
            
            'utils/helpers.css': ['d-', 'text-', 'bg-', 'border-', 'flex-'],
            'utils/animations.css': ['animate-', 'keyframes', 'transition-'],
            'utils/responsive.css': ['media queries', 'responsive utilities'],
            
            'global.css': ['body', 'html', 'global overrides'],
            'main.css': ['import statements only']
        }
        
        violations = []
        
        for file_path, analysis in self.results['file_analysis'].items():
            if file_path in file_responsibilities:
                expected = file_responsibilities[file_path]
                classes = analysis['classes']
                
                # Check for misplaced classes
                for class_name in classes:
                    placed_correctly = False
                    for expected_pattern in expected:
                        if (expected_pattern in class_name or 
                            class_name.startswith(expected_pattern.replace('-', '')) or
                            expected_pattern in ['root variables', 'import statements only']):
                            placed_correctly = True
                            break
                    
                    if not placed_correctly and class_name not in ['d-flex', 'd-none', 'text-center']:  # Common utilities
                        violations.append({
                            'file': file_path,
                            'class': class_name,
                            'expected': expected,
                            'issue': 'Misplaced class'
                        })
        
        self.results['architecture_violations'] = violations
    
    def generate_recommendations(self):
        """Generate recommendations based on analysis"""
        print("💡 Generating recommendations...")
        
        recommendations = []
        
        # Check for duplicate classes
        if self.results['duplicate_classes']:
            recommendations.append({
                'type': 'CRITICAL',
                'title': 'Duplicate Classes Found',
                'description': f"Found {len(self.results['duplicate_classes'])} duplicate classes",
                'action': 'Consolidate duplicate class definitions'
            })
        
        # Check file sizes
        large_files = []
        for file_path, analysis in self.results['file_analysis'].items():
            if analysis['line_count'] > 500:
                large_files.append((file_path, analysis['line_count']))
        
        if large_files:
            recommendations.append({
                'type': 'WARNING',
                'title': 'Large CSS Files',
                'description': f"Found {len(large_files)} files with >500 lines",
                'files': large_files,
                'action': 'Consider splitting large files into smaller components'
            })
        
        # Check for architecture violations
        if self.results['architecture_violations']:
            recommendations.append({
                'type': 'WARNING',
                'title': 'Architecture Violations',
                'description': f"Found {len(self.results['architecture_violations'])} misplaced classes",
                'action': 'Move classes to their appropriate files'
            })
        
        self.results['recommendations'] = recommendations
    
    def generate_summary(self):
        """Generate summary statistics"""
        print("📊 Generating summary...")
        
        total_files = len(self.results['file_analysis'])
        total_classes = sum(len(analysis['classes']) for analysis in self.results['file_analysis'].values())
        total_size = sum(analysis['file_size'] for analysis in self.results['file_analysis'].values())
        duplicate_count = len(self.results['duplicate_classes'])
        
        self.results['summary'] = {
            'total_files': total_files,
            'total_classes': total_classes,
            'total_size_bytes': total_size,
            'total_size_kb': round(total_size / 1024, 2),
            'duplicate_classes': duplicate_count,
            'architecture_violations': len(self.results['architecture_violations']),
            'recommendations': len(self.results['recommendations'])
        }
    
    def generate_report(self):
        """Generate comprehensive markdown report"""
        report = f"""# 🔍 CSS Architecture Audit Report
**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
**Project**: Code with Marco - Python Learning Platform

## 📊 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Total CSS Files** | {self.results['summary']['total_files']} | ✅ |
| **Total Classes** | {self.results['summary']['total_classes']} | ✅ |
| **Total Size** | {self.results['summary']['total_size_kb']} KB | ✅ |
| **Duplicate Classes** | {self.results['summary']['duplicate_classes']} | {'🚨' if self.results['summary']['duplicate_classes'] > 0 else '✅'} |
| **Architecture Violations** | {self.results['summary']['architecture_violations']} | {'⚠️' if self.results['summary']['architecture_violations'] > 0 else '✅'} |

## 🚨 Duplicate Classes Analysis

"""
        
        if self.results['duplicate_classes']:
            report += f"Found **{len(self.results['duplicate_classes'])} duplicate classes**:\n\n"
            for class_name, files in self.results['duplicate_classes'].items():
                report += f"### `.{class_name}`\n"
                report += f"Found in {len(files)} files:\n"
                for file in files:
                    report += f"- `{file}`\n"
                report += "\n"
        else:
            report += "✅ **No duplicate classes found!** Architecture is clean.\n\n"
        
        report += """## 📁 File Analysis

| File | Classes | Size (KB) | Lines | Status |
|------|---------|-----------|-------|---------|
"""
        
        for file_path, analysis in sorted(self.results['file_analysis'].items()):
            size_kb = round(analysis['file_size'] / 1024, 2)
            class_count = len(analysis['classes'])
            status = '✅' if class_count < 50 and size_kb < 20 else '⚠️' if class_count < 100 else '🚨'
            
            report += f"| `{file_path}` | {class_count} | {size_kb} | {analysis['line_count']} | {status} |\n"
        
        report += "\n## 🏗️ Architecture Compliance\n\n"
        
        if self.results['architecture_violations']:
            report += f"Found **{len(self.results['architecture_violations'])} architecture violations**:\n\n"
            for violation in self.results['architecture_violations']:
                report += f"- **`{violation['class']}`** in `{violation['file']}` - {violation['issue']}\n"
        else:
            report += "✅ **All files follow the intended architecture!**\n"
        
        report += "\n## 💡 Recommendations\n\n"
        
        if self.results['recommendations']:
            for i, rec in enumerate(self.results['recommendations'], 1):
                icon = '🚨' if rec['type'] == 'CRITICAL' else '⚠️' if rec['type'] == 'WARNING' else 'ℹ️'
                report += f"### {icon} {rec['title']}\n"
                report += f"{rec['description']}\n\n"
                report += f"**Action**: {rec['action']}\n\n"
        else:
            report += "✅ **No recommendations needed!** CSS architecture is optimal.\n"
        
        report += """
## 📋 Detailed File Breakdown

"""
        
        for file_path, analysis in sorted(self.results['file_analysis'].items()):
            report += f"### `{file_path}`\n"
            report += f"- **Classes**: {len(analysis['classes'])}\n"
            report += f"- **Size**: {round(analysis['file_size'] / 1024, 2)} KB\n"
            report += f"- **Lines**: {analysis['line_count']}\n"
            
            if analysis['classes']:
                report += f"- **Key Classes**: {', '.join(f'`.{c}`' for c in analysis['classes'][:10])}"
                if len(analysis['classes']) > 10:
                    report += f" (+{len(analysis['classes']) - 10} more)"
                report += "\n"
            
            report += "\n"
        
        report += f"""
---

*Report generated by CSS Auditor on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""
        
        return report
    
    def run_audit(self):
        """Run complete audit"""
        print("🚀 Starting comprehensive CSS audit...")
        
        # Run analysis
        self.analyze_files()
        self.check_architecture_compliance()
        self.generate_recommendations()
        self.generate_summary()
        
        # Generate report
        report = self.generate_report()
        
        # Save report
        report_file = Path("CSS_AUDIT_COMPREHENSIVE_REPORT.md")
        report_file.write_text(report, encoding='utf-8')
        
        print(f"✅ Audit complete! Report saved to {report_file}")
        
        # Print summary
        print("\n📊 AUDIT SUMMARY:")
        print(f"   Files analyzed: {self.results['summary']['total_files']}")
        print(f"   Total classes: {self.results['summary']['total_classes']}")
        print(f"   Duplicate classes: {self.results['summary']['duplicate_classes']}")
        print(f"   Architecture violations: {self.results['summary']['architecture_violations']}")
        print(f"   Recommendations: {self.results['summary']['recommendations']}")
        
        return self.results

if __name__ == "__main__":
    auditor = CSSAuditor()
    results = auditor.run_audit()
