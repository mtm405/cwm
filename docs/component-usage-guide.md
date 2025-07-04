# Component Usage Guide

This document provides guidance on using the standardized component systems implemented as part of the HTML/CSS refactoring project.

## Navigation System

The application now uses a consolidated navigation component that should be included through the base layout.

```html
{% include 'components/navigation/navbar-consolidated.html' %}
```

The navigation automatically handles:
- Active state highlighting based on current route
- Admin menu items (shown only for admin users)
- User authentication state

## Modal System

### Basic Usage

All modals should use the standardized modal system through the `modals.html` macros:

```html
{% from "macros/modals.html" import basic_modal, confirmation_modal, form_modal, info_modal, loading_modal %}

{# Include a basic modal #}
{{ basic_modal(
    id='example-modal',
    title='Modal Title',
    content='<p>Modal content goes here</p>',
    close_action='closeExampleModal',
    size='md'
) }}
```

### Available Modal Types

1. **Basic Modal** - For general purpose modals
2. **Confirmation Modal** - For confirming user actions
3. **Form Modal** - For forms within modals
4. **Info Modal** - For displaying information with tips
5. **Loading Modal** - For displaying loading spinners

## Card System

### Basic Usage

Use the standardized card system through the `cards.html` macros:

```html
{% from "macros/cards.html" import basic_card, stat_card, progress_card, action_card, item_card %}

{# Include a stat card #}
{{ stat_card(
    icon='fas fa-star',
    value='1,234',
    label='Total Points',
    trend='+15%',
    trend_direction='up',
    card_class='primary'
) }}
```

### Available Card Types

1. **Basic Card** - A simple card with title, content, and optional footer
2. **Stat Card** - For displaying metrics and statistics
3. **Progress Card** - For displaying progress with visual indicator
4. **Action Card** - Card with a prominent action button
5. **Item Card** - For displaying a list item with image/icon, title, and description

## Migration Tips

When updating existing templates:

1. Replace direct HTML card structures with macro calls
2. Convert modals to use the standardized system
3. Ensure all pages extend the base layout
4. Remove duplicate navigation code

This standardization improves maintainability, reduces code duplication, and ensures consistent UI patterns across the application.
