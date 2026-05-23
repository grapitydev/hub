import { useState, useEffect } from "react";
import { useApiClient } from "../api/client";
import type { PublicSpecVersion } from "@grapity/core";

export function useVersion(name: string, semver: string) {
  const [version, setVersion] = useState<PublicSpecVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const client = useApiClient();

  useEffect(() => {
    setLoading(true);
    setError(null);
    client
      .getVersion(name, semver)
      .then(setVersion)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [name, semver]);

  return { version, loading, error };
}
