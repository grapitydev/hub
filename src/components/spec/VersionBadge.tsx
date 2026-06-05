import type { VersionClassification } from "@grapity/core";

interface VersionBadgeProps {
  semver: string;
  classification: VersionClassification;
  date: string;
  isPrerelease?: boolean;
}

const pillStyles: Record<VersionClassification, string> = {
  initial: "bg-accent-indigo/15 text-accent-indigo",
  major: "bg-accent-indigo/15 text-accent-indigo",
  minor: "bg-accent-blue/15 text-accent-blue",
  patch: "bg-accent-cyan/15 text-accent-cyan",
};

export function VersionBadge({ semver, classification, date, isPrerelease }: VersionBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-bold ${pillStyles[classification]}`}
      >
        {semver}
      </span>
      <span className="text-xs text-text-secondary">{classification}</span>
      {isPrerelease && (
        <span className="rounded-sm bg-accent-amber/10 px-1.5 py-0.5 text-xs text-accent-amber">
          prerelease
        </span>
      )}
      <span className="text-xs text-text-muted ml-auto">{date}</span>
    </div>
  );
}
