import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import type { Spec } from "@grapity/core";

interface SpecCardProps {
  spec: Spec;
  latestVersion?: string;
}

export function SpecCard({ spec, latestVersion }: SpecCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer hover:-translate-y-0.5 hover:border-accent-indigo/30 transition-all duration-200"
      onClick={() => navigate(`/specs/${spec.name}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <Badge variant="indigo">{spec.type}</Badge>
        {latestVersion && (
          <span className="text-xs text-text-secondary font-mono">{latestVersion}</span>
        )}
      </div>

      <h3 className="font-display font-semibold text-text-primary mb-1">{spec.name}</h3>
      {spec.description && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">{spec.description}</p>
      )}

      <div className="space-y-2">
        {spec.owner && (
          <p className="text-xs text-text-secondary">
            Owner: <span className="text-text-primary">{spec.owner}</span>
          </p>
        )}
        {spec.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {spec.tags.map((tag) => (
              <Badge key={tag} variant="default">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
