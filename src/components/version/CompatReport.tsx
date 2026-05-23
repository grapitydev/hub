import { Badge } from "../ui/badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CompatReport as CompatReportType, BreakingChange, SafeChange } from "@grapity/core";

interface CompatReportProps {
  report: CompatReportType | null;
  isInitial?: boolean;
}

function ChangeItem({
  change,
  isBreaking,
}: {
  change: BreakingChange | SafeChange;
  isBreaking: boolean;
}) {
  return (
    <div
      className={`border-l-2 pl-3 py-2 ${
        isBreaking ? "border-accent-rose" : "border-accent-green"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {isBreaking ? (
          <AlertTriangle className="h-3.5 w-3.5 text-accent-rose" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 text-accent-green" />
        )}
        <span className="font-mono text-xs text-text-secondary">{change.rule}</span>
      </div>
      <p className="text-sm text-text-primary">{change.description}</p>
      {change.path && (
        <p className="mt-0.5 font-mono text-xs text-text-muted">{change.path}</p>
      )}
    </div>
  );
}

export function CompatReport({ report, isInitial }: CompatReportProps) {
  if (isInitial || !report) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-text-secondary">This is the initial version.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {report.breakingChanges.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="font-display text-base font-semibold text-text-primary">
              Breaking Changes
            </h3>
            <Badge variant="rose">{report.breakingChanges.length}</Badge>
          </div>
          <div className="space-y-2">
            {report.breakingChanges.map((change) => (
              <ChangeItem key={change.id} change={change} isBreaking />
            ))}
          </div>
        </div>
      )}

      {report.safeChanges.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="font-display text-base font-semibold text-text-primary">
              Safe Changes
            </h3>
            <Badge variant="green">{report.safeChanges.length}</Badge>
          </div>
          <div className="space-y-2">
            {report.safeChanges.map((change) => (
              <ChangeItem key={change.id} change={change} isBreaking={false} />
            ))}
          </div>
        </div>
      )}

      {report.breakingChanges.length === 0 && report.safeChanges.length === 0 && (
        <p className="text-sm text-text-secondary">No changes detected.</p>
      )}
    </div>
  );
}
