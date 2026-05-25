import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export interface HubConfig {
  port?: number;
  registryUrl?: string;
}

const DEFAULT_PORT = 3000;
const DEFAULT_REGISTRY_URL = "http://localhost:3750";

export async function startHubServer(userConfig?: Partial<HubConfig>) {
  const config = {
    port: userConfig?.port ?? DEFAULT_PORT,
    registryUrl: userConfig?.registryUrl ?? DEFAULT_REGISTRY_URL,
  };

  const app = new Hono();

  // Proxy /v1/* requests to the Registry
  app.use("/v1/*", async (c) => {
    const url = new URL(c.req.url);
    const targetUrl = config.registryUrl + url.pathname + url.search;

    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers: c.req.raw.headers,
      body: c.req.raw.body,
    });

    return response;
  });

  // Resolve dist/ relative to this file (works in source and built)
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.resolve(__dirname, "../dist");

  // Serve static assets from dist/
  app.use("/*", serveStatic({ root: distPath }));

  // SPA fallback: any unmatched route returns index.html
  app.get("/*", async (c) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return c.html(fs.readFileSync(indexPath, "utf-8"));
    }
    return c.text(
      "index.html not found. Build the project with 'bun run build' first.",
      404
    );
  });

  serve({
    fetch: app.fetch,
    port: config.port,
  });
}

// Allow: node dist/serve.js (standalone)
if (process.argv[1] === new URL(import.meta.url).pathname) {
  startHubServer();
}
