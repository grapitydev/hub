import type { VersionClassification } from "@grapity/core";

interface VersionBadgeProps {
  semver: string;
  classification: VersionClassification;
  date: string;
  isPrerelease?: boolean;
}

const classificationColors: Record<VersionClassification, string> = {
  initial: "bg-accent-indigo",
  major: "bg-accent-rose",
  minor: "bg-accent-green",
  patch: "bg-accent-cyan",
};

export function VersionBadge({ semver, classification, date, isPrerelease }: VersionBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-2 w-2 rounded-full ${classificationColors[classification]}`}
        aria-hidden="true"
      />
      <span className="font-mono text-sm font-bold text-text-primary">{semver}</span>
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
