# @grapity/hub

Grapity Hub - a developer portal for browsing, exploring, and comparing API specs registered with the Grapity Registry.

## Features

- Browse all specs in the registry with live filtering
- View spec metadata, version history, and compatibility reports
- Interactive OpenAPI endpoint explorer with schema trees and example requests/responses
- Side-by-side version comparison
- Dark mode by default with explicit toggle
- Pure client-side SPA, no backend required

## Installation

```bash
npm install -g @grapity/hub
```

## Development

The Hub expects a running Grapity Registry server (default: `http://localhost:3750`).

```bash
# Start the registry first
grapity serve

# In another terminal, run the Hub dev server
npm run dev
# => http://localhost:5173
```

## Build

```bash
npm run build
```

Static assets are emitted to `dist/` and can be served by any static file server.

## Test

```bash
npm run test
```

## Tech Stack

- React 19 + Vite 6
- Tailwind CSS 4
- React Router DOM 7
- shadcn/ui primitives (copied, not consumed as package)

## License

Apache-2.0
