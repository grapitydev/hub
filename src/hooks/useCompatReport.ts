import { useState, useEffect } from "react";
import { useApiClient } from "../api/client";
import type { CompatReport } from "@grapity/core";

export function useCompatReport(name: string, semver: string) {
  const [report, setReport] = useState<CompatReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const client = useApiClient();

  useEffect(() => {
    setLoading(true);
    setError(null);
    client
      .getCompatReport(name, semver)
      .then(setReport)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [name, semver]);

  return { report, loading, error };
}
