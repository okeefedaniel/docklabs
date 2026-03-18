# DockLabs — Shared Libraries

Shared UI, Django utilities, and brand assets for the DockLabs product suite.

## Products

| Product | URL | Stack |
|---------|-----|-------|
| **Harbor** CRM | harbor.docklabs.ai | Django 5.2, Bootstrap 5, htmx |
| **Beacon** Grants | beacon.docklabs.ai | Django 5.2, Bootstrap 5, htmx |
| **SignStreamer** | signstreamer.com | Django 5.2 (Beacon module) |
| **ct.one** | ct.one | Next.js 15, Tailwind CSS v4 |

## Structure

```
docklabs/
├── ui/                      # Shared CSS + JS
│   ├── docklabs-base.css    # Design tokens, button styles, layout
│   ├── docklabs-base.js     # Button loading, alerts, CSRF, utilities
│   └── tailwind-preset.js   # Tailwind preset for ct.one
├── django/                  # Pip-installable Django package
│   └── docklabs/
│       └── (future: SSO, base models, email templates)
├── assets/                  # Logos, favicons, brand files
└── README.md
```

## Usage

### Django projects (Harbor, Beacon)

Include via CDN (jsDelivr from GitHub):

```html
<link href="https://cdn.jsdelivr.net/gh/okeefedaniel/docklabs@main/ui/docklabs-base.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/gh/okeefedaniel/docklabs@main/ui/docklabs-base.js"></script>
```

Or copy into your project's `static/` directory.

### ct.one (Tailwind)

```js
// tailwind.config.js
import dockLabsPreset from './path/to/docklabs/ui/tailwind-preset.js';

export default {
  presets: [dockLabsPreset],
  // ...
};
```

## CT Brand Design System

### Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--ct-blue` | `#1F64E5` | Primary action, links |
| `--ct-dark-blue` | `#00214D` | Navbar, footer, headings |
| `--ct-bold-blue` | `#003D9C` | Button hover |
| `--ct-orange` | `#F27124` | Accent, focus ring |
| `--ct-yellow` | `#FAAA19` | Warning, pending |
| `--ct-green` | `#198754` | Success |
| `--ct-red` | `#E91C1F` | Error, denied |

### Typography

- **Headings**: Poppins (400–700)
- **Body**: System sans-serif stack

### Button Pattern

All buttons across DockLabs sites use:
- `active:scale(0.97)` for tactile press feedback
- Spinner + text change on form submit
- `opacity: 0.6` when disabled/loading
- Orange focus ring (WCAG AA) on keyboard navigation
