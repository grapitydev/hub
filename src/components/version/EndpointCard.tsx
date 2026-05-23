import type { Endpoint } from "../../context/SpecExplorerContext";
import { SchemaPropertyTree } from "./SchemaPropertyTree";
import { CodeBlock } from "./CodeBlock";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  POST: "bg-green-500/10 text-green-400 border-green-500/30",
  PUT: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/30",
  PATCH: "bg-purple-500/10 text-purple-400 border-purple-500/30",
};

function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={`inline-flex rounded border px-2 py-0.5 font-mono text-xs font-semibold ${
        METHOD_COLORS[method] ?? "bg-surface-hover text-text-secondary border-surface-border"
      }`}
    >
      {method}
    </span>
  );
}

function ParamRow({ param }: { param: Endpoint["parameters"][0] }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
      <span className="font-mono text-text-primary">{param.name}</span>
      <span className="text-text-muted">({param.type})</span>
      {param.required && (
        <span className="text-accent-rose">*</span>
      )}
    </span>
  );
}

function buildCurl(endpoint: Endpoint): string {
  const url = `${endpoint.serverUrl}${endpoint.path}`;
  const lines = [`curl -X ${endpoint.method} ${url} \\\n  -H "Content-Type: application/json" \\\n`];

  if (endpoint.exampleRequest) {
    const body = endpoint.exampleRequest.replace(/'/g, "'\\''");
    lines.push(`  -d '${body}'`);
  }

  return lines.join("");
}

export function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  const responsesWithExamples = endpoint.responses.filter((r) => r.exampleBody);

  return (
    <div
      id={endpoint.id}
      className="rounded-md border border-surface-border bg-surface-base p-4 transition-colors hover:border-surface-hover"
    >
      <div className="flex items-center gap-3 mb-2">
        <MethodBadge method={endpoint.method} />
        <code className="font-mono text-sm text-text-primary">{endpoint.path}</code>
      </div>
      {endpoint.summary && (
        <p className="text-sm text-text-secondary mb-2">{endpoint.summary}</p>
      )}
      {endpoint.parameters.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {endpoint.parameters.map((p) => (
            <ParamRow key={p.name} param={p} />
          ))}
        </div>
      )}

      {endpoint.requestBody && (
        <div className="mt-3 border-t border-surface-border pt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Request Body
            {endpoint.requestBody.required && <span className="text-accent-rose ml-1">*</span>}
          </h4>
          <SchemaPropertyTree properties={endpoint.requestBody.properties} />
        </div>
      )}

      {endpoint.responses.length > 0 && (
        <div className="mt-3 border-t border-surface-border pt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Responses
          </h4>
          <div className="space-y-3">
            {endpoint.responses.map((resp) => (
              <div key={resp.status}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${
                      resp.status.startsWith("2")
                        ? "bg-green-500/10 text-green-400"
                        : resp.status.startsWith("4")
                          ? "bg-red-500/10 text-red-400"
                          : "bg-surface-hover text-text-secondary"
                    }`}
                  >
                    {resp.status}
                  </span>
                  <span className="text-sm text-text-secondary">{resp.description}</span>
                </div>
                {resp.properties && resp.properties.length > 0 && (
                  <div className="ml-2">
                    <SchemaPropertyTree properties={resp.properties} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {endpoint.exampleRequest && (
        <div className="mt-3 border-t border-surface-border pt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Example Request
          </h4>
          <div className="relative rounded-md border border-surface-border bg-surface-code">
            <pre className="overflow-auto p-4 text-xs font-mono leading-relaxed text-text-primary">
              <code>{buildCurl(endpoint)}</code>
            </pre>
          </div>
        </div>
      )}

      {responsesWithExamples.length > 0 && (
        <div className="mt-3 border-t border-surface-border pt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Example Response
          </h4>
          <div className="space-y-3">
            {responsesWithExamples.map((resp) => (
              <div key={resp.status}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-xs font-semibold ${
                      resp.status.startsWith("2")
                        ? "bg-green-500/10 text-green-400"
                        : resp.status.startsWith("4")
                          ? "bg-red-500/10 text-red-400"
                          : "bg-surface-hover text-text-secondary"
                    }`}
                  >
                    {resp.status}
                  </span>
                  <span className="text-xs text-text-secondary">{resp.description}</span>
                </div>
                {resp.exampleBody && (
                  <CodeBlock content={resp.exampleBody} language="json" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
