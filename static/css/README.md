# CSS Architecture Guide
**Code with Morais - Python Learning Platform**

## 📁 Directory Structure

```
static/css/
├── 📄 main.css                    # Master import file
├── 📄 components.css              # Consolidated components
├── 📄 lessons.css                 # Consolidated lessons
├── 📂 base/                       # Foundation styles
│   ├── variables.css              # CSS custom properties
│   ├── reset.css                  # CSS reset/normalize
│   └── layout.css                 # Grid, containers, layout
├── 📂 components/                 # Feature components
│   ├── auth.css                   # Authentication forms
│   ├── dashboard.css              # Dashboard layouts
│   ├── header.css                 # Navigation & user menu
│   ├── notifications.css          # Toasts, alerts
│   ├── gamification.css           # XP, achievements
│   ├── documentation.css          # Component showcase
│   └── quiz.css                   # Quiz integration
├── 📂 pages/                      # Page-specific styles
│   ├── homepage.css               # Landing page
│   ├── lesson.css                 # Individual lesson pages
│   ├── lessons.css                # Lesson listing
│   └── profile.css                # User profile page
├── 📂 utils/                      # Utility classes
│   ├── responsive.css             # Mobile-first responsive
│   ├── animations.css             # Transitions, loading
│   └── helpers.css                # Utility classes
└── 📂 bundles/                    # Generated bundles
    ├── critical.css               # Critical path CSS
    ├── core.css                   # Core components
    ├── auth.css                   # Authentication bundle
    ├── dashboard.css              # Dashboard bundle
    ├── lessons.css                # Lessons bundle
    ├── ui.css                     # UI components bundle
    ├── utils.css                  # Utilities bundle
    └── css-manifest.json          # Bundle manifest
```

## 🎯 File Purposes

### 🏗️ **Core Files (Always Load)**
- **`main.css`** - Master file that imports all critical CSS
- **`components.css`** - Consolidated component styles (buttons, cards, modals, tabs)
- **`lessons.css`** - All lesson-related functionality in one file

### 🧱 **Base Layer**
- **`variables.css`** - CSS custom properties, theme tokens, colors
- **`reset.css`** - CSS reset, normalize, global element styles  
- **`layout.css`** - Grid systems, containers, flexbox utilities

### 🎨 **Component Layer**
- **`auth.css`** - Login, register, password reset forms
- **`dashboard.css`** - Dashboard layouts, widgets, charts
- **`header.css`** - Navigation, user menu, search
- **`notifications.css`** - Toast notifications, alerts, messages
- **`gamification.css`** - XP bars, achievements, badges, animations
- **`documentation.css`** - Component showcase, style guide
- **`quiz.css`** - Quiz integration, question types

### 📱 **Utility Layer**
- **`responsive.css`** - Mobile-first responsive utilities (1200+ lines)
- **`animations.css`** - Loading states, transitions, keyframes
- **`helpers.css`** - Utility classes, spacing, display

### 📄 **Page Layer**
- **`homepage.css`** - Landing page specific styles
- **`lesson.css`** - Individual lesson page layout
- **`lessons.css`** - Lesson listing, filtering, search
- **`profile.css`** - User profile page, settings

## 🚀 Loading Strategy

### Critical Path (Blocking)
```html
<!-- Essential styles - Load immediately -->
<link rel="stylesheet" href="/static/css/main.css">
```

### Feature-Specific (Lazy Loading)
```html
<!-- Page-specific styles - Load when needed -->
<link rel="stylesheet" href="/static/css/pages/dashboard.css" media="print" onload="this.media='all'">
<link rel="stylesheet" href="/static/css/pages/lessons.css" media="print" onload="this.media='all'">
```

### Bundle Loading (Production)
```html
<!-- Optimized bundles -->
<link rel="stylesheet" href="/static/css/bundles/critical.css">
<link rel="stylesheet" href="/static/css/bundles/core.css" media="print" onload="this.media='all'">
```

## 📊 File Sizes & Performance

### Current Bundle Sizes
| File | Size | Purpose | Load Priority |
|------|------|---------|---------------|
| `main.css` | ~15KB | Master imports | Critical |
| `components.css` | ~40KB | UI components | Critical |
| `lessons.css` | ~60KB | Lesson system | High |
| `responsive.css` | ~80KB | Mobile support | High |
| `dashboard.css` | ~35KB | Dashboard | Medium |
| `auth.css` | ~20KB | Authentication | Medium |
| `animations.css` | ~25KB | Transitions | Low |

### Performance Targets
- **Critical Path**: < 100KB (currently ~95KB)
- **Total CSS**: < 400KB (currently ~275KB)
- **HTTP Requests**: < 15 (currently 12)

## 🔧 Development Workflow

### 1. **Adding New Styles**
```bash
# Component styles → components/
# Page styles → pages/
# Utilities → utils/
# Base styles → base/
```

### 2. **Modifying Existing Styles**
- Find the appropriate file using the directory structure
- Follow the existing pattern and naming conventions
- Test responsive behavior on all breakpoints

### 3. **Creating New Components**
- Add to appropriate `/components/` file
- Follow BEM naming convention
- Include responsive variants
- Add to component showcase if needed

## 🎨 CSS Conventions

### Naming Convention (BEM)
```css
/* Block */
.lesson-container { }

/* Element */
.lesson-container__header { }
.lesson-container__content { }

/* Modifier */
.lesson-container--dark { }
.lesson-container__header--large { }
```

### Responsive Design
```css
/* Mobile-first approach */
.component {
    /* Mobile styles */
}

@media (min-width: 768px) {
    .component {
        /* Tablet styles */
    }
}

@media (min-width: 1024px) {
    .component {
        /* Desktop styles */
    }
}
```

### CSS Custom Properties
```css
/* Use design tokens */
.component {
    color: var(--text-primary);
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow);
}
```

## 🧪 Testing Guidelines

### Browser Testing
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Responsive Testing
- Mobile: 320px - 767px
- Tablet: 768px - 1023px  
- Desktop: 1024px+
- Large Desktop: 1400px+

### Performance Testing
```bash
# Generate CSS bundles
node scripts/generate-css-bundles.js

# Analyze bundle sizes
node scripts/analyze-css-bundles.js
```

## 📋 Maintenance Checklist

### Monthly Tasks
- [ ] Run CSS bundle analysis
- [ ] Check for unused CSS selectors
- [ ] Optimize bundle sizes
- [ ] Test responsive breakpoints
- [ ] Update documentation

### Before Major Releases
- [ ] Run full CSS audit
- [ ] Minimize and compress CSS
- [ ] Test all components
- [ ] Update version numbers
- [ ] Generate fresh bundles

## 🛠️ Build System Integration

### Bundle Generation
```javascript
// config/css-bundles.js
const CSS_BUNDLES = {
    critical: {
        files: ['static/css/main.css'],
        priority: 'high',
        loadStrategy: 'blocking'
    },
    lessons: {
        files: ['static/css/lessons.css'],
        priority: 'medium',
        loadStrategy: 'lazy'
    }
};
```

### Template Integration
```html
<!-- templates/base/head.html -->
<link rel="stylesheet" href="{{ url_for('static', filename='css/main.css') }}">

<!-- Page-specific -->
{% block page_css %}{% endblock %}
```

## 📈 Migration History

### Phase 1 (Completed)
- ✅ Consolidated 10 component files → `components.css`
- ✅ Consolidated 5 lesson files → `lessons.css`
- ✅ Cleaned up duplicate imports
- ✅ Organized directory structure

### Phase 2 (In Progress)
- ⏳ Update template references
- ⏳ Implement lazy loading
- ⏳ Optimize bundle generation
- ⏳ Test all functionality

### Phase 3 (Planned)
- 🔜 Add CSS minification
- 🔜 Implement CSS purging
- 🔜 Add performance monitoring
- 🔜 Optimize critical path

## 🐛 Troubleshooting

### Common Issues

1. **Styles Not Loading**
   - Check file paths in templates
   - Verify CSS imports in `main.css`
   - Clear browser cache

2. **Responsive Issues**
   - Check viewport meta tag
   - Verify breakpoint values
   - Test on actual devices

3. **Performance Issues**
   - Analyze bundle sizes
   - Check for unused CSS
   - Optimize image assets

### Debug Commands
```bash
# Check CSS file sizes
Get-ChildItem static/css -Recurse -Name "*.css" | ForEach-Object { Get-Item $_ | Select-Object Name, Length }

# Find duplicate selectors
node scripts/analyze-css-bundles.js --duplicates

# Test responsive breakpoints
node scripts/test-responsive.js
```

---

**Last Updated**: July 4, 2025  
**Version**: 2.0.0  
**Maintainer**: CSS Architecture Team
