import "@testing-library/jest-dom";
import "../setup";
import { beforeEach, afterEach, describe, expect, test } from "bun:test";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider } from "../../src/context/ConfigContext";
import { ThemeProvider } from "../../src/context/ThemeContext";
import { SpecListPage } from "../../src/pages/SpecListPage";
import type { Spec } from "@grapity/core";

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <ConfigProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

function mockFetchJson(body: unknown) {
  global.fetch = (async () =>
    new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof globalThis.fetch;
}

function mockFetchError(status: number, errorBody: unknown) {
  global.fetch = (async () =>
    new Response(JSON.stringify(errorBody), {
      status,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof globalThis.fetch;
}

beforeEach(() => {
  global.fetch = (async () => new Response("{}", { status: 200 })) as unknown as typeof globalThis.fetch;
});

afterEach(() => {
  cleanup();
});

describe("SpecListPage — / (Browse All Specs)", () => {
  test("mounts and shows skeleton while loading", async () => {
    mockFetchJson({ data: [] });
    render(<SpecListPage />, { wrapper });

    expect(screen.getByText(/Browse All Specs/i)).toBeTruthy();
  });

  test("renders empty state when no specs exist", async () => {
    mockFetchJson({ data: [] });
    render(<SpecListPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Push your first spec with/i)).toBeTruthy();
    });
  });

  test("renders spec cards after successful fetch", async () => {
    const specs: Spec[] = [
      { id: "1", name: "payments-api", type: "openapi" as const, tags: ["payments", "public"], createdAt: new Date(), updatedAt: new Date() },
      { id: "2", name: "users-api", type: "openapi" as const, tags: ["internal"], createdAt: new Date(), updatedAt: new Date() },
    ];
    mockFetchJson({ data: specs });
    render(<SpecListPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("payments-api")).toBeTruthy();
      expect(screen.getByText("users-api")).toBeTruthy();
    });
  });

  test("shows error state on fetch failure", async () => {
    mockFetchError(500, { error: "internal_error", message: "Server failed" });
    render(<SpecListPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load specs/i)).toBeTruthy();
    });
  });

  test("filters by type trigger refetch with query param", async () => {
    let capturedUrl = "";
    global.fetch = (async (input: string | URL | Request) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      capturedUrl = url;
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as unknown as typeof globalThis.fetch;

    render(<SpecListPage filters={{ type: "openapi" }} />, { wrapper });

    await waitFor(() => expect(capturedUrl).toContain("type=openapi"));
  });

  test("filters specs client-side while typing in search input", async () => {
    const specs: Spec[] = [
      { id: "1", name: "payments-api", type: "openapi" as const, tags: ["payments", "public"], createdAt: new Date(), updatedAt: new Date() },
      { id: "2", name: "users-api", type: "openapi" as const, tags: ["internal"], createdAt: new Date(), updatedAt: new Date() },
    ];
    mockFetchJson({ data: specs });
    render(<SpecListPage />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText("payments-api")).toBeTruthy();
      expect(screen.getByText("users-api")).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText("Search specs...") as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: "payments" } });

    await waitFor(() => {
      expect(screen.getByText("payments-api")).toBeTruthy();
      expect(screen.queryByText("users-api")).toBeNull();
    });
  });
});
