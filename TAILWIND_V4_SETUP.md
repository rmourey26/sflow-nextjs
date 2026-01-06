# TailwindCSS v4 CSS-First Configuration

This project uses TailwindCSS v4 with the **CSS-first approach** (not the PostCSS plugin approach).

## How It Works

### 1. CSS Import Method
Instead of using a PostCSS plugin, TailwindCSS v4 is imported directly in the CSS file:

```css
/* app/globals.css */
@import "tailwindcss";
```

### 2. Configuration via @theme
All configuration is done using the `@theme` directive in CSS:

```css
@theme {
  --color-primary: 260 80% 62%;
  --font-sans: Inter, system-ui, sans-serif;
  --radius: 0.5rem;
}
```

### 3. No PostCSS Plugin Required
The `postcss.config.mjs` file is empty (except for autoprefixer which Next.js requires). TailwindCSS v4 handles everything through the CSS import.

## Key Differences from v3

| Feature | TailwindCSS v3 | TailwindCSS v4 |
|---------|---------------|----------------|
| Configuration | `tailwind.config.js` | `@theme {}` in CSS |
| PostCSS Plugin | Required | Optional (CSS-first) |
| Import Method | PostCSS processes | `@import "tailwindcss"` |
| Custom Colors | JS config | CSS variables |
| Plugins | JS config | CSS imports |

## Benefits of CSS-First Approach

1. **No Build Conflicts** - Avoids PostCSS plugin version conflicts
2. **Simpler Setup** - No complex configuration files
3. **Better Performance** - Direct CSS processing
4. **More Flexible** - CSS-native configuration
5. **Type Safety** - CSS variables are naturally scoped

## Package Requirements

```json
{
  "devDependencies": {
    "tailwindcss": "^4.1.3",
    "postcss": "^8.5.1",
    "autoprefixer": "^10.4.20"
  }
}
```

Note: `@tailwindcss/postcss` is NOT needed for CSS-first approach.

## Migration Notes

- All React Native and Expo dependencies have been removed
- The `tw-animate-css` package works with both approaches
- Custom utilities are defined in the CSS file using `@layer`
- Design tokens from both the Vite app (saverflow.com) and Next.js app have been merged

## Troubleshooting

If you see "tailwindcss is not a function" errors:
- Make sure you're using `@import "tailwindcss"` in CSS
- Remove `@tailwindcss/postcss` from package.json
- Clear `.next` and `node_modules` caches
- Keep only `tailwindcss` package (not the PostCSS plugin)

## Resources

- [TailwindCSS v4 Documentation](https://tailwindcss.com/docs/v4-beta)
- [CSS-First Configuration Guide](https://tailwindcss.com/docs/v4-beta#css-first-configuration)
