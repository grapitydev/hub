import { useEffect, useState } from "react";

export function useActiveEndpoint(endpointIds: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const mainEl = document.querySelector("main");
    if (!mainEl || endpointIds.length === 0) {
      setActiveId(null);
      return;
    }

    function onScroll() {
      if (!mainEl) return;
      const mainRect = mainEl.getBoundingClientRect();
      const offset = mainRect.height * 0.45;

      let currentId: string | null = null;

      for (const id of endpointIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const elRect = el.getBoundingClientRect();
        const relativeTop = elRect.top - mainRect.top;

        if (relativeTop <= offset) {
          currentId = id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    }

    mainEl.addEventListener("scroll", onScroll);
    onScroll();

    return () => mainEl.removeEventListener("scroll", onScroll);
  }, [endpointIds]);

  return activeId;
}
