# Dashboard UI Guidelines – Shadcn-style Design System

This folder documents how to use, customize, and extend the dashboard UI components. The design system is based on **Shadcn UI** patterns: React components built with **Radix UI** and styled with **Tailwind CSS**, with design tokens for consistency and theme support.

## Design tokens

All components use CSS variables defined in `src/index.css`:

| Token | Purpose |
|-------|---------|
| `--background`, `--foreground` | Page and text |
| `--card`, `--card-foreground` | Cards and card text |
| `--popover`, `--popover-foreground` | Dropdowns, tooltips, sheets |
| `--primary`, `--primary-foreground` | Primary actions and buttons |
| `--secondary`, `--secondary-foreground` | Secondary actions |
| `--muted`, `--muted-foreground` | Muted backgrounds and labels |
| `--accent`, `--accent-foreground` | Hover/selected states |
| `--destructive`, `--destructive-foreground` | Delete/danger actions |
| `--border`, `--input`, `--ring` | Borders, inputs, focus ring |
| `--radius` | Border radius (e.g. 0.5rem) |

Use Tailwind classes that reference these tokens (e.g. `bg-background`, `text-foreground`, `border-border`, `bg-primary text-primary-foreground`) so light/dark mode and future theming work automatically.

## Theme (light/dark)

- **ThemeProvider** (`src/context/ThemeContext.jsx`) stores theme in `localStorage` and toggles the `light` / `dark` class on `document.documentElement`.
- Use `useTheme()` for `theme`, `setTheme`, and `toggleTheme`.
- Prefer token-based classes over hard-coded colors so contrast and states stay correct in both themes.

## Component overview

| Category | Components | Location |
|----------|------------|----------|
| Layout | Card, Separator, Sheet | `src/components/ui/` |
| Navigation | Breadcrumb, BreadcrumbNav | `src/components/ui/breadcrumb.jsx` |
| Forms | Button, Input, Label, Switch | `button.jsx`, `input.jsx`, `label.jsx`, `switch.jsx` |
| Feedback | Alert, Dialog, AlertDialog | `alert.jsx`, `dialog.jsx`, `alert-dialog.jsx` |
| Data | Table, Badge, Skeleton | `table.jsx`, `badge.jsx`, `skeleton.jsx` |
| Overlays | Dropdown (custom), Tabs, Tooltip | `dropdown-menu.jsx`, `tabs.jsx`, `tooltip.jsx` |

## Usage and customization

- **Import only what you use** to keep bundle size small.
- **Customize in place**: components live in `src/components/ui/`; change classes or props as needed for brand and UX.
- **Compose with `cn()`**: use `cn()` from `src/lib/utils.js` to merge Tailwind classes and override defaults.
- **Accessibility**: Radix-based components handle focus, ARIA, and keyboard navigation; keep custom elements labeled and focusable where appropriate.

See the `examples/` folder for concrete snippets (forms, grids, tables, charts).
