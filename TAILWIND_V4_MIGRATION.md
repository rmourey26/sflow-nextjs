# TailwindCSS v4.1.3 Migration Guide

## Overview
This project has been upgraded from TailwindCSS v3.4.17 to v4.1.3. TailwindCSS v4 introduces major architectural changes with a CSS-first configuration approach.

## Key Changes

### 1. Configuration System
- **v3**: JavaScript config file (`tailwind.config.ts`)
- **v4**: CSS-based configuration using `@theme` directive in `globals.css`

### 2. CSS Import
```css
/* v3 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4 */
@import "tailwindcss";
```

### 3. PostCSS Plugin
- **v3**: `tailwindcss` plugin
- **v4**: `@tailwindcss/postcss` plugin

### 4. Color Variables
TailwindCSS v4 uses `--color-*` prefix for all color variables:
```css
/* v3 */
--primary: 260 80% 62%;

/* v4 */
--color-primary: 260 80% 62%;
```

### 5. Theme Variables
All design tokens now use the `@theme` directive:
```css
@theme {
  --color-primary: 260 80% 62%;
  --font-sans: Inter, sans-serif;
  --radius: 0.5rem;
}
```

## Merged Features

### From Vite App (saverflow.com)
- Complete color palette with brand colors
- Elevation system (`--elevate-1`, `--elevate-2`)
- Button and badge outline styles
- Glassmorphic header utilities
- Shadow system with 7 levels
- Interactive hover/active elevate classes

### From Next.js App (Previous Version)
- Fluid typography utilities
- Container utilities
- Safe area insets for mobile
- Touch-friendly tap targets
- Accessibility features (high contrast mode, reduced motion)
- Animation utilities

## Usage in Components

### Accessing Colors
```tsx
// All color utilities now use the color- prefix internally
className="bg-primary text-primary-foreground"
className="bg-brand-navy text-brand-lime"
```

### Using Custom Utilities
```tsx
// Elevation
className="hover-elevate active-elevate"

// Glassmorphism
className="glass"

// Gradients
className="gradient-text"

// Animations
className="animate-fade-up"
```

## Breaking Changes

1. **No more `tailwind.config.ts`**: Configuration is now in CSS
2. **Color variable prefix**: All colors use `--color-*` prefix
3. **PostCSS plugin change**: Update to `@tailwindcss/postcss`
4. **Theme directive**: Use `@theme {}` instead of JavaScript config

## Benefits of v4

1. **Faster builds**: Up to 5x faster than v3
2. **Smaller bundle size**: Better tree-shaking
3. **CSS-first**: More intuitive theme customization
4. **Better IDE support**: CSS custom properties work better with IntelliSense
5. **Simplified architecture**: No more complex JavaScript config

## Compatibility Notes

- All existing Tailwind classes work the same way
- Custom utilities from v3 have been preserved
- Dark mode still uses `class` strategy
- All Radix UI components remain compatible
- Animations and transitions unchanged

## Next Steps

1. Test all components in light and dark modes
2. Verify responsive utilities across breakpoints
3. Check accessibility features (high contrast, reduced motion)
4. Validate custom utilities and animations
5. Update any build scripts if needed
