# CSS Structure and Tab Styling Guide

## Overview
This Flask application uses a modular CSS architecture with theme support and bundled CSS files for optimal performance. The lesson subtopic tabs are styled with a comprehensive system that supports multiple themes.

## CSS Architecture

### 1. Base Layer
- **`static/css/base/variables.css`** - CSS custom properties for theming
- **`static/css/base/reset.css`** - CSS reset and base styles
- **`static/css/base/typography.css`** - Typography definitions

### 2. Bundle System
CSS files are organized into bundles for performance:
- **`static/css/bundles/core.css`** - Essential styles (reset, variables, typography)
- **`static/css/bundles/lessons.css`** - Lesson-specific styles including subtopic tabs
- **`static/css/bundles/utils.css`** - Utility classes and helpers

### 3. Component Structure
- **`static/css/components/`** - Reusable UI components
- **`static/css/pages/`** - Page-specific styles
- **`static/css/layouts/`** - Layout and grid systems

## Theme System

### Available Themes
1. **Default (Dark)** - Primary theme with dark backgrounds
2. **Glass** - Semi-transparent glassmorphism theme
3. **Light** - Light theme with white backgrounds
4. **Cyberpunk** - Neon-colored futuristic theme

### Theme Variables
```css
:root {
    --primary-color: #6C63FF;
    --bg-primary: #1a1a2e;
    --bg-card: #0f3460;
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --border-color: #2a2a4e;
}
```

## Subtopic Tab Styling

### Tab Container Structure
```css
.subtopic-tabs-container {
    /* Main container with card styling */
    background: var(--bg-card);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.subtopic-tabs {
    /* Horizontal scrollable tab list */
    display: flex;
    gap: 0.5rem;
    overflow-x: auto;
}

.subtopic-tab {
    /* Individual tab styling */
    padding: 0.75rem 1rem;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-secondary);
    transition: all 0.3s ease;
}

.subtopic-tab.active {
    /* Active tab with primary color */
    border-color: var(--primary-color);
    background: var(--primary-color);
    color: white;
    box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
}
```

### Tab States
- **Default**: Border and background using theme variables
- **Hover**: Primary color background with lift effect
- **Active**: Primary color with enhanced shadow
- **Completed**: Success color indicator

### Progress Indicators
- **Tab Progress Bar**: Shows overall lesson progress
- **Completion Check**: Visual indicator for completed subtopics
- **Order Numbers**: Numbered badges for tab sequence

## Responsive Design

### Breakpoints
- **Desktop**: Full tab layout with text labels
- **Tablet (768px)**: Compact tabs with reduced padding
- **Mobile (480px)**: Icon-only tabs with vertical stacking

### Mobile Optimizations
- Horizontal scrolling for tab overflow
- Reduced font sizes and padding
- Hidden text labels on very small screens
- Full-width navigation buttons

## Accessibility Features

### Keyboard Navigation
- Tab focus management
- Arrow key navigation between tabs
- Enter/Space key activation

### Visual Accessibility
- High contrast ratios in all themes
- Focus indicators for keyboard users
- Hover states for mouse interaction
- Clear visual hierarchy

### Screen Reader Support
- ARIA labels and roles
- Semantic HTML structure
- Status announcements for tab changes

## Known Issues and Solutions

### Dark Theme Visibility
**Issue**: Tabs may appear as "black on black" in dark themes
**Solution**: Enhanced contrast with CSS custom properties and theme-aware styling

### Glass Theme Transparency
**Issue**: Tabs may be too transparent in glass theme
**Solution**: Increased opacity and backdrop-filter for better visibility

### Mobile Tab Overflow
**Issue**: Too many tabs on small screens
**Solution**: Horizontal scrolling with visual scroll indicators

## Performance Considerations

### CSS Bundles
- Critical styles loaded first (core.css)
- Lesson-specific styles loaded on demand
- Minified production builds

### Animation Performance
- Hardware-accelerated transforms
- Optimized transition timing
- Reduced motion support

### Theme Switching
- CSS custom properties for instant theme changes
- No JavaScript required for theme application
- Cached theme preferences

## Future Improvements

### Planned Enhancements
1. Dynamic tab width adjustment
2. Drag-and-drop tab reordering
3. Tab groups for complex lessons
4. Enhanced mobile gestures
5. Better theme transition animations

### Accessibility Roadmap
1. High contrast mode support
2. Reduced motion preferences
3. Voice navigation support
4. Screen reader improvements

## File Dependencies

### Critical Files
- `static/css/base/variables.css` - Theme variables
- `static/css/bundles/lessons.css` - Tab styles
- `static/js/lesson/subtopicTabManager.js` - Tab functionality

### Supporting Files
- `templates/lesson.html` - Tab markup
- `routes/lesson_routes.py` - Backend routing
- `static/css/bundles/core.css` - Base styles

## Maintenance Notes

### CSS Organization
- Follow BEM naming convention for new classes
- Use CSS custom properties for theme-able values
- Keep component styles self-contained
- Document complex selectors

### Theme Updates
- Test all themes when adding new components
- Ensure contrast ratios meet accessibility standards
- Update CSS custom properties consistently
- Test across different browsers and devices

---

*Last updated: January 2025*
*Code with Morais - Lesson System*
