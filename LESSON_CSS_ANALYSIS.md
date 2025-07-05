# CSS Structure Analysis and Improvement Plan - Lesson Blocks

## Current State Analysis

### CSS Files Structure
1. **`templates/lesson.html`** uses **`static/css/bundles/lessons.css`** (primary)
2. **`static/css/lessons.css`** (older main file, ~4,000 lines)
3. **`static/css/pages/lesson.css`** (page-specific styles)
4. **`static/css/pages/lessons.css`** (lessons overview page)
5. **`static/css/bundles/lessons.css`** (auto-generated bundle, ~4,192 lines)

### Key CSS Classes Used
- **JavaScript renders:** `lesson-block`, `content-block`
- **HTML template uses:** `lesson-container`, `lesson-header`, `lesson-content`, `progress-bar`
- **Block types:** `text-block`, `code-block`, `interactive-block`, `quiz-block`

### Identified Issues
1. **Duplication**: Same `.content-block` styles in multiple files
2. **Inconsistency**: Some renderers use `lesson-block`, others use `content-block`
3. **Fragmentation**: Styles spread across multiple files
4. **Bundle confusion**: Bundle file is generated but unclear what merges into it
5. **Priority conflicts**: Different max-widths and layouts across files

## Consolidation Plan

### Phase 1: Structure Audit
- [x] Identify all lesson-related CSS files
- [x] Map CSS classes to HTML/JS usage
- [x] Find duplicate styles
- [ ] Test which styles are actually applied

### Phase 2: Consolidation
- [ ] Create single source of truth for lesson block styles
- [ ] Standardize class naming (`content-block` vs `lesson-block`)
- [ ] Remove duplicate styles
- [ ] Optimize CSS bundle generation

### Phase 3: Visual Redesign
- [ ] Modern card-based layout
- [ ] Consistent spacing and typography
- [ ] Progressive states (not-started, in-progress, completed)
- [ ] Better accessibility and responsiveness

## Recommended Changes

### 1. Standardize Block Classes
```css
/* Use consistent naming */
.content-block {
    /* Main block container */
}
.content-block.text-block { /* Text content blocks */ }
.content-block.code-block { /* Code examples */ }
.content-block.interactive-block { /* Coding challenges */ }
.content-block.quiz-block { /* Quiz/assessment blocks */ }
```

### 2. Remove Duplicate Styles
- Keep styles in `static/css/bundles/lessons.css` (primary)
- Remove duplicates from `static/css/lessons.css`
- Keep only page-specific styles in `static/css/pages/lesson.css`

### 3. Modern Visual Design
- Card-based layout with proper shadows and spacing
- Better color scheme with CSS custom properties
- Improved typography hierarchy
- Responsive grid system
- Smooth animations and transitions

### 4. State Management
- Clear visual indicators for block states
- Progress indicators with proper color coding
- Hover effects for interactivity
- Focus states for accessibility

## Implementation Steps

1. **Backup current styles** ✓
2. **Create unified CSS structure** 
3. **Update JavaScript renderers** 
4. **Test visual consistency**
5. **Implement modern design**
6. **Performance optimization**

## Files to Modify
- `static/css/bundles/lessons.css` (primary styles)
- `static/css/pages/lesson.css` (page-specific only)
- `static/js/lesson/lessonRenderer.js` (standardize class names)
- `static/js/lesson/enhancedLessonBlockRenderer.js` (standardize class names)
