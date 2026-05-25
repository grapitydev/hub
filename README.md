# @grapity/hub

Grapity Hub - a developer portal for browsing, exploring, and comparing API specs registered with the Grapity Registry.

**Documentation:** [grapity.dev/docs/platform/hub/using-the-hub](https://grapity.dev/docs/platform/hub/using-the-hub) · [Quickstart](https://grapity.dev/docs/getting-started/quickstart)

## Features

- Browse all specs in the registry with live filtering
- View spec metadata, version history, and compatibility reports
- Interactive OpenAPI endpoint explorer with schema trees and example requests/responses
- Side-by-side version comparison
- Dark mode by default with explicit toggle
- Pure client-side SPA, no backend required

## Installation

The Hub is typically installed alongside the CLI and Registry. It starts automatically when you run `grapity serve`.

```bash
npm install -g @grapity/cli @grapity/registry @grapity/hub
```

## Usage

### With the CLI (recommended)

The Hub starts automatically alongside the Registry:

```bash
grapity serve                    # Registry on :3750, Hub on :3000
grapity serve --hub-port 8080    # Custom Hub port
grapity serve --no-hub           # Registry only, skip Hub
```

### Standalone (development)

For local development with hot reload:

```bash
# Terminal 1: start the registry
grapity serve

# Terminal 2: dev server
npm run dev
# => http://localhost:5173
```

### Production server

Serve the built SPA with the built-in Hono server:

```bash
npm run build
node dist/serve.js
# => http://localhost:3000
```

Or programmatically:

```typescript
import { startHubServer } from "@grapity/hub/serve";

await startHubServer({
  port: 3000,
  registryUrl: "http://localhost:3750",
});
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
- Hono (production server)

## License

Apache-2.0
