# 🔍 CSS Architecture Audit Report
**Generated**: 2025-06-30 08:26:17  
**Project**: Code with Marco - Python Learning Platform

## 📊 Executive Summary

| Metric | Value | Status |
|--------|-------|--------|
| **Total CSS Files** | 17 | ✅ |
| **Total Classes** | 754 | ✅ |
| **Total Size** | 166.77 KB | ✅ |
| **Duplicate Classes** | 156 | 🚨 |
| **Architecture Violations** | 4 | ⚠️ |

## 🚨 Duplicate Classes Analysis

Found **156 duplicate classes**:

### `.main-content`
Found in 4 files:
- `global.css`
- `style.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.nav-links`
Found in 5 files:
- `global.css`
- `style.css`
- `components\header.css`
- `components\navigation.css`
- `utils\responsive.css`

### `.sidebar`
Found in 4 files:
- `global.css`
- `style.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.active`
Found in 7 files:
- `style.css`
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `components\header-modern.css`
- `components\header.css`
- `components\navigation.css`
- `pages\dashboard-modern.css`

### `.activity-content`
Found in 3 files:
- `style.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-icon`
Found in 3 files:
- `style.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-item`
Found in 3 files:
- `style.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-message`
Found in 2 files:
- `style.css`
- `components\dashboard.css`

### `.activity-time`
Found in 3 files:
- `style.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.auth-section`
Found in 3 files:
- `style.css`
- `components\header.css`
- `components\navigation.css`

### `.btn`
Found in 3 files:
- `style.css`
- `components\buttons.css`
- `utils\responsive.css`

### `.btn-primary`
Found in 2 files:
- `style.css`
- `components\buttons.css`

### `.btn-secondary`
Found in 2 files:
- `style.css`
- `components\buttons.css`

### `.btn-success`
Found in 2 files:
- `style.css`
- `components\buttons.css`

### `.card`
Found in 3 files:
- `style.css`
- `components\cards.css`
- `utils\responsive.css`

### `.container`
Found in 4 files:
- `style.css`
- `base\layout.css`
- `components\header-modern.css`
- `utils\responsive.css`

### `.dropdown-menu`
Found in 3 files:
- `style.css`
- `components\header.css`
- `components\navigation.css`

### `.leaderboard-item`
Found in 3 files:
- `style.css`
- `components\dashboard.css`
- `components\header-modern.css`

### `.leaderboard-rank`
Found in 3 files:
- `style.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.leaderboard-user`
Found in 2 files:
- `style.css`
- `components\dashboard.css`

### `.leaderboard-xp`
Found in 2 files:
- `style.css`
- `components\dashboard.css`

### `.lesson-container`
Found in 2 files:
- `style.css`
- `components\header-modern.css`

### `.logo`
Found in 3 files:
- `style.css`
- `components\header.css`
- `components\navigation.css`

### `.mobile-menu-toggle`
Found in 4 files:
- `style.css`
- `components\header.css`
- `components\navigation.css`
- `utils\responsive.css`

### `.nav-container`
Found in 3 files:
- `style.css`
- `components\header.css`
- `components\navigation.css`

### `.navbar`
Found in 4 files:
- `style.css`
- `components\dashboard.css`
- `components\header-modern.css`
- `pages\dashboard-modern.css`

### `.quiz-navigation`
Found in 2 files:
- `style.css`
- `components\header.css`

### `.score-circle`
Found in 2 files:
- `style.css`
- `components\dashboard.css`

### `.show`
Found in 2 files:
- `style.css`
- `components\dashboard.css`

### `.stat-card`
Found in 2 files:
- `style.css`
- `components\dashboard.css`

### `.stat-label`
Found in 4 files:
- `style.css`
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stat-value`
Found in 2 files:
- `style.css`
- `components\dashboard.css`

### `.stats-grid`
Found in 2 files:
- `style.css`
- `components\dashboard.css`

### `.theme-cyberpunk`
Found in 5 files:
- `style.css`
- `base\variables.css`
- `components\buttons.css`
- `components\cards.css`
- `components\navigation.css`

### `.theme-forest`
Found in 2 files:
- `style.css`
- `components\cards.css`

### `.theme-glass`
Found in 5 files:
- `style.css`
- `base\variables.css`
- `components\buttons.css`
- `components\cards.css`
- `components\navigation.css`

### `.theme-light`
Found in 2 files:
- `style.css`
- `base\variables.css`

### `.theme-minimal`
Found in 2 files:
- `style.css`
- `components\cards.css`

### `.theme-ocean`
Found in 2 files:
- `style.css`
- `components\cards.css`

### `.theme-sunset`
Found in 2 files:
- `style.css`
- `components\cards.css`

### `.user-avatar`
Found in 4 files:
- `style.css`
- `components\header-modern.css`
- `components\header.css`
- `components\navigation.css`

### `.user-dropdown`
Found in 3 files:
- `style.css`
- `components\header.css`
- `components\navigation.css`

### `.user-info`
Found in 4 files:
- `style.css`
- `components\header-modern.css`
- `components\header.css`
- `components\navigation.css`

### `.user-name`
Found in 4 files:
- `style.css`
- `components\header-modern.css`
- `components\header.css`
- `components\navigation.css`

### `.user-profile`
Found in 3 files:
- `style.css`
- `components\header.css`
- `components\navigation.css`

### `.user-stats`
Found in 4 files:
- `style.css`
- `components\header-modern.css`
- `components\header.css`
- `components\navigation.css`

### `.btn-block`
Found in 3 files:
- `components\buttons.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.btn-ghost`
Found in 3 files:
- `components\buttons.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.btn-refresh`
Found in 4 files:
- `components\buttons.css`
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.refreshing`
Found in 4 files:
- `components\buttons.css`
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.card-grid`
Found in 2 files:
- `components\cards.css`
- `utils\responsive.css`

### `.card-header`
Found in 2 files:
- `components\cards.css`
- `components\dashboard.css`

### `.card-content`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.card-header-modern`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.card-status`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.dashboard-card`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.dashboard-container`
Found in 4 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `components\header-modern.css`
- `pages\dashboard-modern.css`

### `.dashboard-grid`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.dashboard-nav`
Found in 4 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `components\header-modern.css`
- `pages\dashboard-modern.css`

### `.dashboard-subtitle`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.featured`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.header-actions`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.header-content`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.info`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.learning-dashboard`
Found in 2 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`

### `.lesson-info`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.lesson-preview`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.lesson-progress-modern`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.lesson-thumbnail`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.loading`
Found in 2 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`

### `.modern-dashboard-header`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.nav-tab`
Found in 4 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `components\header-modern.css`
- `pages\dashboard-modern.css`

### `.nav-tabs-container`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.primary`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-bar`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-bar-mini`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-details`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-fill`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-fill-mini`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-icon`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-item-modern`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-label`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-stats-modern`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-text`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.progress-value`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stat-body`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stat-card-modern`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stat-header`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stat-icon`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stat-improved`
Found in 2 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`

### `.stat-progress`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stat-trend`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stat-value-large`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stats-grid-modern`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stats-section`
Found in 2 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`

### `.success`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.tab-content`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.tab-pane`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.warning`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.welcome-section`
Found in 3 files:
- `components\dashboard-fixed.css`
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-card-modern`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-details`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-feed-compact`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-feed-modern`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-header`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-icon-large`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-item-large`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-rewards`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.activity-section`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.app-container`
Found in 3 files:
- `components\dashboard.css`
- `components\header-modern.css`
- `pages\dashboard-modern.css`

### `.challenge-actions-modern`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.challenge-card-modern`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.challenge-content`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.challenge-description`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.challenge-difficulty`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.challenge-header`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.challenge-rewards-modern`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.challenge-section`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.challenge-timer`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.challenge-title`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.current-user`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.difficulty-easy`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.difficulty-hard`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.difficulty-medium`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.filter-select`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.leaderboard-avatar`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.leaderboard-card-modern`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.leaderboard-header`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.leaderboard-info`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.leaderboard-item-modern`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.leaderboard-modern`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.leaderboard-section`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.leaderboard-stats`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.level`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.modal-body`
Found in 2 files:
- `components\dashboard.css`
- `components\header-modern.css`

### `.modal-close`
Found in 2 files:
- `components\dashboard.css`
- `components\header-modern.css`

### `.modal-content`
Found in 2 files:
- `components\dashboard.css`
- `components\header-modern.css`

### `.modal-header`
Found in 2 files:
- `components\dashboard.css`
- `components\header-modern.css`

### `.no-challenge-icon`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.no-challenge-modern`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.rank-1`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.rank-2`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.rank-3`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.rank-number`
Found in 3 files:
- `components\dashboard.css`
- `components\header-modern.css`
- `pages\dashboard-modern.css`

### `.refresh-dashboard`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.reward-badge`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.reward-card`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.reward-label`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.reward-value`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.special`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.stat-item`
Found in 2 files:
- `components\dashboard.css`
- `components\header-modern.css`

### `.username`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.xp-value`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.you-badge`
Found in 2 files:
- `components\dashboard.css`
- `pages\dashboard-modern.css`

### `.g_id_signin`
Found in 2 files:
- `components\header.css`
- `components\navigation.css`

### `.theme-switcher`
Found in 2 files:
- `components\header.css`
- `components\navigation.css`

## 📁 File Analysis

| File | Classes | Size (KB) | Lines | Status |
|------|---------|-----------|-------|---------|
| `base\layout.css` | 21 | 1.27 | 75 | ✅ |
| `base\reset.css` | 0 | 0.69 | 51 | ✅ |
| `base\variables.css` | 3 | 1.49 | 59 | ✅ |
| `components\buttons.css` | 17 | 2.9 | 186 | ✅ |
| `components\cards.css` | 24 | 2.97 | 161 | ✅ |
| `components\dashboard-fixed.css` | 52 | 11.24 | 607 | ⚠️ |
| `components\dashboard.css` | 176 | 58.28 | 3166 | 🚨 |
| `components\header-modern.css` | 62 | 16.01 | 860 | ⚠️ |
| `components\header.css` | 22 | 6.55 | 383 | ✅ |
| `components\navigation.css` | 21 | 11.09 | 563 | ✅ |
| `global.css` | 4 | 0.44 | 54 | ✅ |
| `main.css` | 1 | 0.77 | 35 | ✅ |
| `pages\dashboard-modern.css` | 107 | 21.56 | 1158 | 🚨 |
| `style.css` | 82 | 17.66 | 959 | ⚠️ |
| `utils\animations.css` | 23 | 5.86 | 345 | ✅ |
| `utils\helpers.css` | 99 | 4.89 | 134 | ⚠️ |
| `utils\responsive.css` | 40 | 3.1 | 152 | ✅ |

## 🏗️ Architecture Compliance

Found **4 architecture violations**:

- **`main-content`** in `global.css` - Misplaced class
- **`mobile-open`** in `global.css` - Misplaced class
- **`nav-links`** in `global.css` - Misplaced class
- **`sidebar`** in `global.css` - Misplaced class

## 💡 Recommendations

### 🚨 Duplicate Classes Found
Found 156 duplicate classes

**Action**: Consolidate duplicate class definitions

### ⚠️ Large CSS Files
Found 6 files with >500 lines

**Action**: Consider splitting large files into smaller components

### ⚠️ Architecture Violations
Found 4 misplaced classes

**Action**: Move classes to their appropriate files


## 📋 Detailed File Breakdown

### `base\layout.css`
- **Classes**: 21
- **Size**: 1.27 KB
- **Lines**: 75
- **Key Classes**: `.container`, `.flex`, `.flex-between`, `.flex-center`, `.flex-column`, `.grid`, `.grid-2`, `.grid-3`, `.grid-4`, `.m-0` (+11 more)

### `base\reset.css`
- **Classes**: 0
- **Size**: 0.69 KB
- **Lines**: 51

### `base\variables.css`
- **Classes**: 3
- **Size**: 1.49 KB
- **Lines**: 59
- **Key Classes**: `.theme-cyberpunk`, `.theme-glass`, `.theme-light`

### `components\buttons.css`
- **Classes**: 17
- **Size**: 2.9 KB
- **Lines**: 186
- **Key Classes**: `.btn`, `.btn-block`, `.btn-danger`, `.btn-ghost`, `.btn-group`, `.btn-lg`, `.btn-outline`, `.btn-primary`, `.btn-refresh`, `.btn-secondary` (+7 more)

### `components\cards.css`
- **Classes**: 24
- **Size**: 2.97 KB
- **Lines**: 161
- **Key Classes**: `.card`, `.card-body`, `.card-compact`, `.card-danger`, `.card-footer`, `.card-grid`, `.card-header`, `.card-primary`, `.card-subtitle`, `.card-success` (+14 more)

### `components\dashboard-fixed.css`
- **Classes**: 52
- **Size**: 11.24 KB
- **Lines**: 607
- **Key Classes**: `.active`, `.btn-refresh`, `.card-content`, `.card-header-modern`, `.card-status`, `.dashboard-card`, `.dashboard-container`, `.dashboard-grid`, `.dashboard-nav`, `.dashboard-subtitle` (+42 more)

### `components\dashboard.css`
- **Classes**: 176
- **Size**: 58.28 KB
- **Lines**: 3166
- **Key Classes**: `.active`, `.activity-card-modern`, `.activity-content`, `.activity-details`, `.activity-feed`, `.activity-feed-compact`, `.activity-feed-modern`, `.activity-header`, `.activity-icon`, `.activity-icon-large` (+166 more)

### `components\header-modern.css`
- **Classes**: 62
- **Size**: 16.01 KB
- **Lines**: 860
- **Key Classes**: `.active`, `.app-container`, `.bronze`, `.container`, `.dashboard-container`, `.dashboard-nav`, `.dropdown-arrow`, `.dropdown-divider`, `.dropdown-menu-modern`, `.fa-medal` (+52 more)

### `components\header.css`
- **Classes**: 22
- **Size**: 6.55 KB
- **Lines**: 383
- **Key Classes**: `.active`, `.auth-section`, `.dropdown-menu`, `.g_id_signin`, `.logo`, `.mobile-menu-toggle`, `.mobile-nav-close`, `.mobile-nav-header`, `.mobile-nav-links`, `.mobile-nav-menu` (+12 more)

### `components\navigation.css`
- **Classes**: 21
- **Size**: 11.09 KB
- **Lines**: 563
- **Key Classes**: `.active`, `.auth-section`, `.dropdown-menu`, `.g_id_signin`, `.logo`, `.mobile-active`, `.mobile-menu-open`, `.mobile-menu-toggle`, `.nav-container`, `.nav-links` (+11 more)

### `global.css`
- **Classes**: 4
- **Size**: 0.44 KB
- **Lines**: 54
- **Key Classes**: `.main-content`, `.mobile-open`, `.nav-links`, `.sidebar`

### `main.css`
- **Classes**: 1
- **Size**: 0.77 KB
- **Lines**: 35
- **Key Classes**: `.css`

### `pages\dashboard-modern.css`
- **Classes**: 107
- **Size**: 21.56 KB
- **Lines**: 1158
- **Key Classes**: `.active`, `.activity-card-modern`, `.activity-content`, `.activity-details`, `.activity-feed-compact`, `.activity-feed-modern`, `.activity-header`, `.activity-icon`, `.activity-icon-large`, `.activity-item` (+97 more)

### `style.css`
- **Classes**: 82
- **Size**: 17.66 KB
- **Lines**: 959
- **Key Classes**: `.active`, `.activity-content`, `.activity-icon`, `.activity-item`, `.activity-message`, `.activity-time`, `.auth-section`, `.btn`, `.btn-primary`, `.btn-secondary` (+72 more)

### `utils\animations.css`
- **Classes**: 23
- **Size**: 5.86 KB
- **Lines**: 345
- **Key Classes**: `.animate-bounce`, `.animate-fade-in`, `.animate-fade-in-down`, `.animate-fade-in-up`, `.animate-in`, `.animate-out`, `.animate-pulse`, `.animate-slide-in-left`, `.animate-slide-in-right`, `.animate-spin` (+13 more)

### `utils\helpers.css`
- **Classes**: 99
- **Size**: 4.89 KB
- **Lines**: 134
- **Key Classes**: `.align-items-baseline`, `.align-items-center`, `.align-items-end`, `.align-items-start`, `.align-items-stretch`, `.bg-danger`, `.bg-primary`, `.bg-secondary`, `.bg-success`, `.bg-transparent` (+89 more)

### `utils\responsive.css`
- **Classes**: 40
- **Size**: 3.1 KB
- **Lines**: 152
- **Key Classes**: `.btn`, `.card`, `.card-grid`, `.container`, `.d-lg-block`, `.d-lg-flex`, `.d-lg-grid`, `.d-lg-inline`, `.d-lg-inline-block`, `.d-lg-none` (+30 more)


---

*Report generated by CSS Auditor on 2025-06-30 08:26:17*
