import { CopyButton } from "../ui/CopyButton";

interface CodeBlockProps {
  content: string;
  language: string;
  showCopy?: boolean;
  className?: string;
}

export function CodeBlock({ content, language, showCopy = true, className = "" }: CodeBlockProps) {
  function highlight(content: string, lang: string) {
    if (lang === "json") {
      try {
        return JSON.stringify(JSON.parse(content), null, 2);
      } catch {
        return content;
      }
    }
    return content;
  }

  const formatted = highlight(content, language);

  return (
    <div className={`relative rounded-md border border-surface-border bg-surface-code ${className}`}>
      {showCopy && (
        <div className="absolute right-2 top-2">
          <CopyButton text={formatted} />
        </div>
      )}
      <pre className="overflow-auto p-4 text-sm font-mono leading-relaxed text-text-primary max-h-[60vh]">
        <code>{formatted}</code>
      </pre>
    </div>
  );
}
