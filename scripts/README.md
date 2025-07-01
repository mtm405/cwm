# 🛠️ Scripts Directory

Organized utility scripts for Code with Marco development and maintenance.

## 📂 **Directory Structure**

### **`maintenance/`** - System Maintenance Scripts
Scripts for ongoing maintenance and health checks.

| Script | Purpose | Frequency |
|--------|---------|-----------|
| `css_audit_comprehensive.py` | Analyze CSS for conflicts and issues | Before CSS changes |
| `css_cleanup_final.py` | Clean up CSS conflicts automatically | After major changes |

### **`development/`** - Development Tools
Scripts for development workflow and testing.

| Script | Purpose | Frequency |
|--------|---------|-----------|
| `final_ui_verification.py` | Verify UI components and styling | After UI changes |

### **`deployment/`** - Deployment & Production
Scripts for deployment and production management.

| Script | Purpose | Frequency |
|--------|---------|-----------|
| `deploy_helper.py` | Assist with deployment process | During deployments |

## 🚀 **Usage Examples**

### **Run CSS Audit**
```powershell
cd scripts/maintenance
python css_audit_comprehensive.py
```

### **Clean CSS Conflicts** 
```powershell
cd scripts/maintenance  
python css_cleanup_final.py
```

### **Verify UI Components**
```powershell
cd scripts/development
python final_ui_verification.py
```

## 📋 **Script Guidelines**

### **Adding New Scripts**
1. **Reusable scripts only** - One-time scripts should be deleted after use
2. **Proper directory** - Choose maintenance, development, or deployment
3. **Documentation** - Update this README when adding scripts
4. **Error handling** - Include proper error handling and logging

### **Script Standards**
- Include shebang: `#!/usr/bin/env python3`
- Add docstring explaining purpose
- Include `if __name__ == "__main__":` for executable scripts
- Use meaningful variable names and comments

## 🗂️ **Related Directories**

- **`tests/`** - Unit and integration tests
- **`firebase_data/`** - Firebase setup and seeding scripts  
- **`utils/`** - Application utility modules
- **`archive/`** - Deprecated/historical files

---

*Keep only scripts that will be used multiple times. Delete one-time scripts after use.*
