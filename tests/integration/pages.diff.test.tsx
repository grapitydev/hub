import "@testing-library/jest-dom";
import "../setup";
import { beforeEach, afterEach, describe, expect, test } from "bun:test";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "../../src/context/ConfigContext";
import { ThemeProvider } from "../../src/context/ThemeContext";
import { DiffPage } from "../../src/pages/DiffPage";
import type { PublicSpecVersion, CompatReport } from "@grapity/core";

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

beforeEach(() => {
  global.fetch = (async () => new Response("{}", { status: 200 })) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  cleanup();
});

describe("DiffPage — /specs/:name/diff", () => {
  test("renders version dropdowns and empty state", async () => {
    const versions: PublicSpecVersion[] = [
      { id: "v1", specId: "1", semver: "1.0.0", checksum: "abc", isPrerelease: false, createdAt: new Date() },
      { id: "v2", specId: "1", semver: "1.1.0", checksum: "def", isPrerelease: false, createdAt: new Date() },
    ];

    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      if (url.includes("/versions")) {
        return new Response(
          JSON.stringify({ data: versions, pagination: { hasMore: false, limit: 10, offset: 0, total: 2 } }),
          { status: 200 }
        );
      }
      const report: CompatReport = { previousVersion: "1.0.0", classification: "minor", breakingChanges: [], safeChanges: [] };
      return new Response(JSON.stringify({ data: report }), { status: 200 });
    }) as unknown as typeof globalThis.fetch;

    render(<DiffPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Compare Versions/i)).toBeTruthy();
    });
  });
});
