# 🎨 CSS Directory

## 📋 **Quick Reference**
- **[CSS_ARCHITECTURE_MAPPING.md](CSS_ARCHITECTURE_MAPPING.md)** ⭐ **Complete CSS Guide** - Read this first!

## 📁 **Directory Structure**
```
static/css/
├── README.md                        # This file
├── CSS_ARCHITECTURE_MAPPING.md     # ⭐ Master CSS documentation
├── main.css                         # Primary entry point
├── global.css                       # Global overrides
├── style.css                        # Legacy styles (being phased out)
├── base/                           # Foundation styles
│   ├── variables.css               # CSS custom properties
│   ├── reset.css                   # Browser normalization
│   └── layout.css                  # Layout utilities
├── components/                     # UI components
│   ├── header-modern.css           # Header/navbar (primary)
│   ├── dashboard-fixed.css         # Dashboard layout (active)
│   ├── buttons.css                 # Button components
│   ├── cards.css                   # Card components
│   └── navigation.css              # Navigation components
└── utils/                          # Utility classes
    ├── helpers.css                 # Utility classes
    ├── animations.css              # Animations & transitions
    └── responsive.css              # Responsive utilities
```

## 🎯 **Before Making Changes**
1. **Read** [`CSS_ARCHITECTURE_MAPPING.md`](CSS_ARCHITECTURE_MAPPING.md) first
2. **Check** which file owns the class you want to modify
3. **Follow** the component ownership matrix
4. **Test** changes thoroughly

## 🚨 **Important Files**
- **DO NOT EDIT**: Backup directories (`css_backup_*`)
- **PRIMARY**: `main.css` - Controls all imports
- **ACTIVE**: `dashboard-fixed.css` - Current dashboard styles
- **LEGACY**: `style.css` - Being phased out

---
*For complete documentation, see [CSS_ARCHITECTURE_MAPPING.md](CSS_ARCHITECTURE_MAPPING.md)*
