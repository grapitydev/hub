import type { SchemaProperty } from "../../context/SpecExplorerContext";

interface SchemaPropertyTreeProps {
  properties: SchemaProperty[];
}

export function SchemaPropertyTree({ properties }: SchemaPropertyTreeProps) {
  return (
    <div className="space-y-1">
      {properties.map((prop) => (
        <div key={prop.name}>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm text-text-primary">
              {prop.name}
              {prop.required && <span className="text-accent-rose">*</span>}
            </span>
            <span className="text-xs text-text-muted">{prop.type}</span>
            {prop.format && (
              <span className="text-xs text-text-muted">({prop.format})</span>
            )}
          </div>
          {prop.description && (
            <p className="text-xs text-text-secondary">{prop.description}</p>
          )}
          {prop.properties && prop.properties.length > 0 && (
            <div className="ml-4 pl-3 mt-1">
              <SchemaPropertyTree properties={prop.properties} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
