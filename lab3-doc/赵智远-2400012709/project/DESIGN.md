# 🎨 ToDo App - Visual Design Guide

## Color Palette

### Primary Colors
```
Gradient Background:
- Start: #667eea (Purple-Blue)
- End:   #764ba2 (Purple)

Main Accent: #667eea (Blue-Purple)
```

### Priority Colors
```
High Priority:
- Background: #fee (Light Red)
- Text: #d32f2f (Red)

Medium Priority:
- Background: #fff4e5 (Light Orange)
- Text: #f57c00 (Orange)

Low Priority:
- Background: #e8f5e9 (Light Green)
- Text: #388e3c (Green)
```

### UI Colors
```
Background: Linear Gradient
Cards: #ffffff (White)
Borders: #e0e0e0 (Light Gray)
Text: #333333 (Dark Gray)
Muted Text: #666666 (Gray)
Disabled: #999999 (Light Gray)
```

## Typography

### Font Family
```css
font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
```

### Font Sizes
```
Title: 3.5rem (56px)
Input: 1rem (16px)
Button: 1rem (16px)
Todo Description: 1.05rem (16.8px)
Badge: 0.75rem (12px)
Meta: 0.85rem (13.6px)
```

## Spacing & Layout

### Container Widths
```
Max Width: 900px
Card Padding: 25px
Item Padding: 18px
Gap Between Elements: 12-30px
```

### Border Radius
```
Cards: 16px
Inputs: 10px
Buttons: 10px
Badges: 6px
Smaller Elements: 8px
```

### Shadows
```css
Card Shadow: 0 8px 30px rgba(0, 0, 0, 0.12)
Button Shadow: 0 4px 15px rgba(102, 126, 234, 0.4)
Hover Shadow: 0 6px 20px rgba(102, 126, 234, 0.5)
```

## Component Breakdown

### 1. Header Section
```
- Position: Top, centered
- Background: Transparent
- Title Color: White
- Text Shadow: Yes
- Animation: Fade in from top
```

### 2. Input Toolbar
```
- Background: White
- Border Radius: 16px
- Shadow: Medium
- Layout: Flexbox (wraps on mobile)
- Gap: 12px
- Padding: 25px
```

### 3. Todo Container
```
- Background: White
- Border Radius: 16px
- Shadow: Medium
- Overflow: Hidden
- Min Height: 300px
```

### 4. Tab Buttons
```
- Layout: Flex (50/50 split)
- Background: #f5f5f5 (inactive)
- Background: White (active)
- Bottom Border: 2px gradient (active)
- Padding: 18px
- Hover Effect: Light highlight
```

### 5. Todo Item
```
- Background: #f9f9f9
- Border: 2px solid #e0e0e0
- Border Radius: 12px
- Padding: 18px
- Hover: Purple border + shadow
- Completed: 60% opacity
```

### 6. Buttons
```
Primary (Add):
- Background: Purple gradient
- Color: White
- Shadow: Yes

Edit:
- Background: Light blue
- Color: Blue
- Hover: Invert colors

Delete:
- Background: Light red
- Color: Red
- Hover: Invert colors
```

## Animations

### Page Load
```css
Header: fadeInDown (0.6s)
Input Section: fadeInUp (0.6s, delay 0.2s)
Todo Section: fadeInUp (0.6s, delay 0.4s)
```

### Todo Operations
```css
Add: slideIn from left (0.3s)
Delete: slideOut to right (0.3s)
Edit: Border color change (0.2s)
Hover: Transform translateY(-2px)
```

### Transitions
```css
All interactive elements: 0.3s ease
Buttons: 0.2s ease
Borders/Colors: 0.3s ease
```

## Responsive Breakpoints

### Desktop (> 768px)
```
- Full width inputs in toolbar
- Side-by-side todo actions
- Large title (3.5rem)
```

### Tablet (< 768px)
```
- Stacked inputs (100% width)
- Smaller title (2.5rem)
- Full-width buttons
```

### Mobile (< 480px)
```
- Smallest title (2rem)
- Reduced padding
- Compact spacing
- Stacked todo items
```

## Icons & Emojis

### Used Throughout
```
📋 - Pending Tasks
✓ - Completed Tasks
📝 - Empty Pending State
🎉 - Empty Completed State
📅 - Due Date
+ - Add Button
```

## States & Interactions

### Input States
```
Default: Gray border
Focus: Purple border + shadow ring
Hover: Slight border darkening
```

### Button States
```
Default: Base colors
Hover: Lift up + stronger shadow
Active: Press down (translateY(0))
```

### Todo States
```
Default: Light background
Hover: Purple border + shadow
Editing: Purple background + border
Completed: Strikethrough + opacity
Deleting: Slide out animation
```

## Accessibility

### Features
```
- High contrast text
- Clear focus indicators
- Semantic HTML
- Proper labels
- Keyboard navigation
- Large click targets (44px+)
```

## Performance

### Optimizations
```
- CSS transitions (GPU accelerated)
- Minimal repaints
- Efficient animations
- No layout thrashing
- Debounced events
```

## Best Practices Applied

✅ Mobile-first responsive design
✅ Consistent spacing system
✅ Unified color palette
✅ Smooth transitions
✅ Clear visual hierarchy
✅ Accessible color contrast
✅ Touch-friendly targets
✅ Progressive enhancement
✅ Semantic markup
✅ Modern CSS features

---

This design system ensures a consistent, beautiful, and functional user interface across all devices and screen sizes.
