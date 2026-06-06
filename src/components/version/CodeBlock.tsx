import { useEffect, useState } from "react";
import { CopyButton } from "../ui/CopyButton";
import { getHighlighter } from "../../lib/shiki";

interface CodeBlockProps {
  content: string;
  language: string;
  showCopy?: boolean;
  className?: string;
}

function formatJson(content: string): string {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    return content;
  }
}

export function CodeBlock({ content, language, showCopy = true, className = "" }: CodeBlockProps) {
  const [html, setHtml] = useState<string>("");
  const formatted = language === "json" ? formatJson(content) : content;

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      const highlighter = await getHighlighter();
      if (cancelled) return;

      const lang = language === "json" || language === "bash" ? language : "text";
      const result = highlighter.codeToHtml(formatted, {
        lang,
        theme: "catppuccin-mocha",
      });
      if (!cancelled) setHtml(result);
    }

    highlight();

    return () => {
      cancelled = true;
    };
  }, [formatted, language]);

  return (
    <div className={`relative rounded-md border border-surface-border bg-surface-code ${className}`}>
      {showCopy && (
        <div className="absolute right-2 top-2 z-10">
          <CopyButton text={formatted} />
        </div>
      )}
      <div className="overflow-auto max-h-[60vh]">
        {html ? (
          <div
            className="p-4 text-sm font-mono leading-relaxed shiki-code"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="p-4 text-sm font-mono leading-relaxed text-text-primary">
            <code>{formatted}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
