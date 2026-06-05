import "@testing-library/jest-dom";
import "../setup";
import { beforeEach, afterEach, describe, expect, test } from "bun:test";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "../../src/context/ConfigContext";
import { ThemeProvider } from "../../src/context/ThemeContext";
import { SpecExplorerProvider } from "../../src/context/SpecExplorerContext";
import { VersionPage } from "../../src/pages/VersionPage";
import type { PublicSpecVersion, CompatReport, Spec } from "@grapity/core";

const TEST_SPEC: Spec = {
  id: "1", name: "payments-api", type: "openapi" as const,
  description: "Payments service", owner: "platform-team",
  tags: ["payments", "public"], createdAt: new Date(), updatedAt: new Date(),
};

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={[`/specs/payments-api/versions/1.0.0`]}>
      <ConfigProvider>
        <ThemeProvider>
          <SpecExplorerProvider>
            <Routes>
              <Route path="/specs/:name/versions/:semver" element={children} />
            </Routes>
          </SpecExplorerProvider>
        </ThemeProvider>
      </ConfigProvider>
    </MemoryRouter>
  );
}

const OPENAPI_JSON = JSON.stringify({
  openapi: "3.1.0",
  info: { title: "Test API", version: "1.0.0" },
  servers: [{ url: "https://api.example.com" }],
  components: {
    schemas: {
      Payment: {
        type: "object",
        title: "Payment",
        description: "A payment object",
        properties: {
          id: { type: "string" },
          amount: { type: "number" },
          currency: { type: "string" },
          status: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/v1/accounts": {
      get: {
        summary: "List all accounts",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer" }, required: false },
          { name: "offset", in: "query", schema: { type: "integer" }, required: false },
        ],
        responses: {
          "200": {
            description: "List of accounts",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { type: "object", properties: { id: { type: "string" } } },
                    },
                  },
                },
                example: {
                  data: [{ id: "acc_123" }],
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create a new account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email"],
                properties: {
                  name: { type: "string", description: "Account holder name" },
                  email: { type: "string", format: "email", description: "Contact email" },
                  metadata: {
                    type: "object",
                    description: "Custom metadata",
                    properties: {
                      plan: { type: "string" },
                      tier: { type: "string" },
                    },
                  },
                },
              },
              example: {
                name: "Acme Corp",
                email: "admin@acme.com",
                metadata: { plan: "enterprise", tier: "gold" },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Account created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    email: { type: "string" },
                  },
                },
                example: {
                  id: "acc_new456",
                  name: "Acme Corp",
                  email: "admin@acme.com",
                },
              },
            },
          },
          "400": {
            description: "Invalid request",
          },
        },
      },
    },
    "/v1/accounts/{id}": {
      get: {
        summary: "Retrieve an account",
        parameters: [
          { name: "id", in: "path", schema: { type: "string" }, required: true },
        ],
        responses: {
          "200": {
            description: "Account details",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Payment",
                },
                example: {
                  id: "pay_123",
                  amount: 99.99,
                  currency: "USD",
                  status: "completed",
                  createdAt: "2026-01-15T10:30:00Z",
                },
              },
            },
          },
        },
      },
    },
    "/v1/payments": {
      get: {
        summary: "List all payments",
        parameters: [],
        responses: {
          "200": {
            description: "List of payments",
          },
        },
      },
    },
  },
});

beforeEach(() => {
  global.fetch = (async () => new Response("{}", { status: 200 })) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  cleanup();
});

describe("VersionPage — /specs/:name/versions/:semver", () => {
  test("renders spec metadata and tabs", async () => {
    const spec: Spec = {
      id: "1", name: "payments-api", type: "openapi" as const,
      description: "Payments service", owner: "platform-team",
      tags: ["payments", "public"], createdAt: new Date(), updatedAt: new Date(),
    };
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("payments-api")).toBeTruthy();
      expect(screen.getByText("Payments service")).toBeTruthy();
      expect(screen.getByText("platform-team")).toBeTruthy();
    });
  });

  test("renders all tabs including Versions and Compare", async () => {
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Overview/i)).toBeTruthy();
      expect(screen.getByText(/Changelog/i)).toBeTruthy();
      expect(screen.getByText(/Versions/i)).toBeTruthy();
      expect(screen.getByText(/Compare/i)).toBeTruthy();
      expect(screen.getByText(/Raw Spec/i)).toBeTruthy();
    });
  });

  test("renders parsed OpenAPI endpoints in Overview tab", async () => {
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("List all accounts")).toBeTruthy();
      expect(screen.getByText("Create a new account")).toBeTruthy();
    });
  });

  test("renders Versions tab with timeline", async () => {
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Versions/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/Versions/i));

    await waitFor(() => {
      expect(screen.getByText(/Version History/i)).toBeTruthy();
    });
  });

  test("renders request body properties with nesting", async () => {
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Request Body")).toBeTruthy();
      expect(screen.getByText("metadata")).toBeTruthy();
      expect(screen.getByText("plan")).toBeTruthy();
      expect(screen.getByText("tier")).toBeTruthy();
    });
  });

  test("renders response schemas", async () => {
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getAllByText("201").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Account created").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("400")).toBeTruthy();
      expect(screen.getByText("Invalid request")).toBeTruthy();
    });
  });

  test("resolves $ref in response schemas", async () => {
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("amount")).toBeTruthy();
      expect(screen.getByText("currency")).toBeTruthy();
      expect(screen.getByText("status")).toBeTruthy();
      expect(screen.getByText("createdAt")).toBeTruthy();
    });
  });

  test("renders example request curl command", async () => {
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/curl -X POST/i)).toBeTruthy();
      expect(screen.getByText(/https:\/\/api\.example\.com\/v1\/accounts/i)).toBeTruthy();
    });
  });

  test("renders example responses", async () => {
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/acc_123/i)).toBeTruthy();
      expect(screen.getByText(/acc_new456/i)).toBeTruthy();
    });
  });

  test("sidebar shows endpoint groups on VersionPage", async () => {
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Accounts")).toBeTruthy();
      expect(screen.getByText("Payments")).toBeTruthy();
    });
  });

  test("switches to YAML tab without skeleton flash", async () => {
    const version: PublicSpecVersion = {
      id: "v1", specId: "1", semver: "1.0.0", checksum: "abc",
      isPrerelease: false, createdAt: new Date(),
      compatibility: { classification: "initial", previousVersion: "", breakingChanges: [], safeChanges: [] },
    };

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/compat/")) {
        const report: CompatReport = { previousVersion: "", classification: "initial", breakingChanges: [], safeChanges: [] };
        return new Response(JSON.stringify({ data: report }), { status: 200 });
      }
      if (url.includes("/spec.json")) {
        return new Response(OPENAPI_JSON, { status: 200 });
      }
      if (url.includes("/spec.yaml")) {
        return new Response("openapi: 3.1.0\ninfo:\n  title: Test API\n", { status: 200 });
      }
      if (url.includes("/versions") && !url.includes("/versions/")) {
        return new Response(JSON.stringify({ data: [version], pagination: { hasMore: false, limit: 10, offset: 0, total: 1 } }), { status: 200 });
      }
      if (url.includes("/specs/payments-api") && !url.includes("/versions") && !url.includes("/compat") && !url.includes("/spec.")) {
        return new Response(JSON.stringify({ data: { spec: TEST_SPEC, latestVersion: version } }), { status: 200 });
      }
      return new Response(JSON.stringify({ data: version }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<VersionPage />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Raw Spec/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByText(/Raw Spec/i));

    await waitFor(() => {
      expect(screen.getByText(/Test API/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByText("YAML"));

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("openapi: 3.1.0"))).toBeTruthy();
    });
  });
});
