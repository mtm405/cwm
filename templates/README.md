# 📁 Templates Directory Organization

## 🎯 **Current Structure**

```
templates/
├── base.html                   # ✅ Main layout template
├── index.html                  # ✅ Landing page  
├── dashboard.html              # ✅ Dashboard
├── lesson.html                 # ✅ MAIN LESSON TEMPLATE - Primary lesson page
├── lessons.html                # ✅ Lessons overview
├── components/                 # ✅ Reusable components
│   ├── navigation/
│   ├── common/
│   └── lesson/
├── macros/                     # ✅ Jinja macros
├── pages/                      # ✅ Additional pages
└── archive/                    # 📁 Legacy files
    └── lesson_backups/         # 📁 Archived lesson templates
```

## 🔧 **Main Templates**

| Template | Purpose | Status | Route |
|----------|---------|--------|-------|
| `lesson.html` | **Primary lesson template** | ✅ ACTIVE | `/lesson/<lesson_id>` |
| `lessons.html` | Lessons overview/list | ✅ Active | `/lessons` |
| `dashboard.html` | User dashboard | ✅ Active | `/dashboard` |
| `base.html` | Main layout | ✅ Active | Extended by all |

## 🗂️ **Archived Templates**

All legacy lesson templates have been moved to `archive/lesson_backups/`:

- `lesson_backup_broken.html` - Identical copy of main lesson.html
- `lesson_debug.html` - Minimal debug template (no longer used)
- `lesson_old.html` - Previous version
- `lesson_simple.html` - Simplified version
- `lesson_test_simple.html` - Test template
- `lesson_working.html` - Working copy

## ⚠️ **Important Notes**

1. **`lesson.html` is the ONLY lesson template in use**
2. **All routes point to `lesson.html`** including debug routes
3. **DO NOT delete `lesson.html`** - it's the main lesson template
4. **Archived files are safe to delete** if storage space is needed

## 🔄 **Recent Changes**

- ✅ Consolidated all lesson templates to single `lesson.html`
- ✅ Moved 6 legacy templates to archive
- ✅ Updated debug route to use main template
- ✅ Verified all routes use correct template

## 📋 **Route Mapping**

```python
# All lesson routes use lesson.html:
/lesson/<lesson_id>         → lesson.html
/lesson-debug/<lesson_id>   → lesson.html  
/lesson-minimal/<lesson_id> → lesson.html (if exists)
```

---

**Last Updated:** June 30, 2025  
**Template Count:** 1 active lesson template, 6 archived
