import { describe, it, expect } from "bun:test";
import { parseOpenAPI } from "../../src/lib/parseOpenAPI";

describe("parseOpenAPI", () => {
  it("parses allOf schemas by merging properties from all sub-schemas", () => {
    const spec = {
      openapi: "3.1.0",
      info: { title: "Test API", version: "1.0.0" },
      servers: [{ url: "https://api.example.com" }],
      paths: {
        "/test": {
          post: {
            operationId: "testPost",
            tags: ["test"],
            summary: "Test endpoint",
            responses: {
              "409": {
                description: "Breaking change detected",
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/BreakingChangeError",
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          ApiError: {
            type: "object",
            required: ["error", "message", "statusCode"],
            properties: {
              error: { type: "string", example: "breaking_change" },
              message: { type: "string", example: "Breaking changes detected" },
              statusCode: { type: "integer", example: 409 },
            },
          },
          CompatReport: {
            type: "object",
            required: ["previousVersion", "classification", "breakingChanges", "safeChanges"],
            properties: {
              previousVersion: { type: "string", example: "1.1.0" },
              classification: { type: "string", example: "major" },
              breakingChanges: { type: "array", items: { type: "object" } },
              safeChanges: { type: "array", items: { type: "object" } },
            },
          },
          BreakingChangeError: {
            allOf: [
              { $ref: "#/components/schemas/ApiError" },
              {
                type: "object",
                required: ["compatReport"],
                properties: {
                  compatReport: { $ref: "#/components/schemas/CompatReport" },
                },
              },
            ],
          },
        },
      },
    };

    const result = parseOpenAPI(JSON.stringify(spec));
    expect(result).toHaveLength(1);
    const endpoint = result[0].endpoints[0];
    expect(endpoint.responses).toHaveLength(1);

    const response409 = endpoint.responses.find((r) => r.status === "409")!;
    expect(response409.properties).toBeDefined();
    expect(response409.properties).toHaveLength(4);

    const names = response409.properties!.map((p) => p.name);
    expect(names).toContain("error");
    expect(names).toContain("message");
    expect(names).toContain("statusCode");
    expect(names).toContain("compatReport");

    const compatReportProp = response409.properties!.find((p) => p.name === "compatReport")!;
    expect(compatReportProp.properties).toBeDefined();
    expect(compatReportProp.properties).toHaveLength(4);
  });

  it("parses allOf with nested object properties directly", () => {
    const spec = {
      openapi: "3.1.0",
      info: { title: "Test API", version: "1.0.0" },
      servers: [{ url: "https://api.example.com" }],
      paths: {
        "/test": {
          get: {
            operationId: "testGet",
            responses: {
              "200": {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      allOf: [
                        {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                          },
                        },
                        {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = parseOpenAPI(JSON.stringify(spec));
    const endpoint = result[0].endpoints[0];
    const response200 = endpoint.responses.find((r) => r.status === "200")!;
    expect(response200.properties).toBeDefined();
    expect(response200.properties).toHaveLength(2);
    expect(response200.properties!.map((p) => p.name)).toEqual(["id", "name"]);
  });

  it("handles deeply nested allOf schemas", () => {
    const spec = {
      openapi: "3.1.0",
      info: { title: "Test API", version: "1.0.0" },
      servers: [{ url: "https://api.example.com" }],
      paths: {
        "/test": {
          get: {
            operationId: "testGet",
            responses: {
              "200": {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      allOf: [
                        {
                          type: "object",
                          properties: {
                            base: { type: "string" },
                          },
                        },
                        {
                          allOf: [
                            {
                              type: "object",
                              properties: {
                                nested1: { type: "string" },
                              },
                            },
                            {
                              type: "object",
                              properties: {
                                nested2: { type: "string" },
                              },
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const result = parseOpenAPI(JSON.stringify(spec));
    const endpoint = result[0].endpoints[0];
    const response200 = endpoint.responses.find((r) => r.status === "200")!;
    expect(response200.properties).toBeDefined();
    expect(response200.properties).toHaveLength(3);
    const names = response200.properties!.map((p) => p.name);
    expect(names).toContain("base");
    expect(names).toContain("nested1");
    expect(names).toContain("nested2");
  });
});
