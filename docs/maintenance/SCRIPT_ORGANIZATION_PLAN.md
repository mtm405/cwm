# 🧹 Script Organization & Cleanup Plan

## 📂 **New Directory Structure**

### **`scripts/` - Reusable Utility Scripts**
Scripts that can be run multiple times for maintenance, setup, or development:

#### **`scripts/maintenance/`**
- `css_cleanup_final.py` ✅ (already exists - reusable CSS conflict resolver)
- `css_audit_comprehensive.py` ✅ (already exists - reusable CSS analyzer)
- `validate_css.py` → Move here (CSS validation)
- `backup_manager.py` → Create (manage backups systematically)

#### **`scripts/development/`**
- `final_ui_verification.py` → Move here (UI testing script)
- `test_runner.py` → Create (run all tests)
- `dev_server.py` → Create (development server with extras)

#### **`scripts/firebase/`**
- Firebase setup and seeding scripts (already organized in `firebase_data/`)

#### **`scripts/deployment/`**
- `deploy_helper.py` (from firebase_data)
- `production_check.py` → Create (pre-deployment checks)

## 🗑️ **Scripts to Delete (One-time Use)**

### **Already Used/Obsolete**
- ❌ Root-level debug scripts (moved to archive)
- ❌ `test_app.py` in root (duplicate of tests/test_app.py)
- ❌ Temporary CSS validation scripts
- ❌ One-time migration scripts

### **Archive Directory Cleanup**
- ❌ `archive/dev_scripts/debug_*.py` (debugging complete)
- ❌ `archive/dev_scripts/extract_*.py` (extraction complete)
- ❌ `archive/dev_scripts/cleanup_*.py` (replaced by reusable versions)

## ✅ **Keep & Organize**

### **Core Application Files (Stay in Root)**
- ✅ `app.py` - Main Flask application
- ✅ `config.py` - Configuration
- ✅ `requirements.txt` - Dependencies

### **Organized Directories (Keep as-is)**
- ✅ `models/` - Data models
- ✅ `routes/` - Route handlers  
- ✅ `services/` - Business logic
- ✅ `utils/` - Application utilities
- ✅ `tests/` - Test suites
- ✅ `firebase_data/` - Firebase scripts (well organized)

## 🚀 **Implementation Steps**

1. **Create scripts directory structure**
2. **Move reusable scripts** to appropriate subdirectories
3. **Delete one-time/obsolete scripts** 
4. **Update documentation** with new script locations
5. **Create helper scripts** for common tasks

## 📋 **Script Categories**

| Category | Purpose | Frequency | Location |
|----------|---------|-----------|----------|
| **Maintenance** | CSS cleanup, validation, backups | Weekly/Monthly | `scripts/maintenance/` |
| **Development** | UI testing, dev tools | Daily | `scripts/development/` |
| **Firebase** | Database setup, seeding | Setup/Updates | `firebase_data/` (existing) |
| **Deployment** | Production checks, deployment | Releases | `scripts/deployment/` |
| **Testing** | Test runners, CI/CD | Daily | `tests/` (existing) |

---

*This plan will keep only useful, reusable scripts and eliminate clutter.*
