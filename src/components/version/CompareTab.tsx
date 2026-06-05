import { useState } from "react";
import { useCompatReport } from "../../hooks/useCompatReport";
import { Select, SelectItem } from "../ui/select";
import { Changelog } from "./Changelog";
import { Card } from "../ui/card";
import type { PublicSpecVersion } from "@grapity/core";

interface CompareTabProps {
  versions: PublicSpecVersion[];
  specName: string;
  currentSemver: string;
}

export function CompareTab({ versions, specName, currentSemver }: CompareTabProps) {
  const [compareVersion, setCompareVersion] = useState("");

  const currentVersion = versions.find((v) => v.semver === currentSemver);
  const compareVersionObj = versions.find((v) => v.semver === compareVersion);

  const { report: currentReport, loading: currentLoading } = useCompatReport(
    specName,
    currentSemver,
    !!currentVersion?.previousVersion
  );
  const { report: compareReport, loading: compareLoading } = useCompatReport(
    specName,
    compareVersion,
    !!compareVersionObj?.previousVersion
  );

  const otherVersions = versions.filter((v) => v.semver !== currentSemver);

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Compare with
        </label>
        <Select
          value={compareVersion}
          onChange={setCompareVersion}
          placeholder="Select a version to compare"
        >
          {otherVersions.map((v) => (
            <SelectItem key={v.semver} value={v.semver}>
              {v.semver}
            </SelectItem>
          ))}
        </Select>
      </div>

      {!compareVersion && (
        <div className="py-12 text-center">
          <p className="text-text-secondary">
            Select a version to compare compatibility reports.
          </p>
        </div>
      )}

      {compareVersion && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-4 border-b border-surface-border pb-3">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                {currentSemver} (current)
              </h2>
            </div>
            {currentLoading ? (
              <div className="h-32 rounded bg-surface-hover animate-pulse" />
            ) : (
              <Changelog report={currentReport} />
            )}
          </Card>

          <Card>
            <div className="mb-4 border-b border-surface-border pb-3">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                {compareVersion}
              </h2>
            </div>
            {compareLoading ? (
              <div className="h-32 rounded bg-surface-hover animate-pulse" />
            ) : (
              <Changelog report={compareReport} />
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
