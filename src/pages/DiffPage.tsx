import { useState } from "react";
import { useParams } from "react-router-dom";
import { useVersions } from "../hooks/useVersions";
import { useCompatReport } from "../hooks/useCompatReport";
import { Select, SelectItem } from "../components/ui/select";
import { Changelog } from "../components/version/Changelog";
import { Card } from "../components/ui/card";

export function DiffPage() {
  const { name } = useParams<{ name: string }>();
  const { versions, loading: versionsLoading } = useVersions(name!);

  const [versionA, setVersionA] = useState("");
  const [versionB, setVersionB] = useState("");

  const versionAObj = versions.find((v) => v.semver === versionA);
  const versionBObj = versions.find((v) => v.semver === versionB);

  const { report: reportA, loading: loadingA } = useCompatReport(
    name!,
    versionA,
    !!versionAObj?.previousVersion
  );
  const { report: reportB, loading: loadingB } = useCompatReport(
    name!,
    versionB,
    !!versionBObj?.previousVersion
  );

  const versionOptions = versions.map((v) => v.semver);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-text-primary mb-2">
          {name} — Compare Versions
        </h1>
        <p className="text-sm text-text-secondary">
          Select two versions to compare their compatibility reports.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Version A
          </label>
          <Select
            value={versionA}
            onChange={setVersionA}
            placeholder="Select version A"
          >
            {versionOptions.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Version B
          </label>
          <Select
            value={versionB}
            onChange={setVersionB}
            placeholder="Select version B"
          >
            {versionOptions.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {(!versionA || !versionB) && (
        <div className="py-12 text-center">
          <p className="text-text-secondary">
            Select two versions to compare their compatibility reports.
          </p>
        </div>
      )}

      {versionA && versionB && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 border-b border-surface-border pb-3">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                {versionA}
              </h2>
            </div>
            {loadingA ? (
              <div className="h-32 rounded bg-surface-hover animate-pulse" />
            ) : (
              <Changelog report={reportA} />
            )}
          </Card>

          <Card>
            <div className="mb-4 border-b border-surface-border pb-3">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                {versionB}
              </h2>
            </div>
            {loadingB ? (
              <div className="h-32 rounded bg-surface-hover animate-pulse" />
            ) : (
              <Changelog report={reportB} />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
