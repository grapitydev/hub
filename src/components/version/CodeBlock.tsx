import { CopyButton } from "../ui/CopyButton";

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

function highlightJson(content: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < content.length) {
    const ch = content[i];

    if (ch === "\\n") {
      tokens.push(<span key={key++}>{ch}</span>);
      i++;
      continue;
    }

    if (ch === '\\"') {
      // Find end of string
      let j = i + 1;
      while (j < content.length && content[j] !== '"') {
        if (content[j] === '\\\\' && j + 1 < content.length) {
          j += 2;
        } else {
          j++;
        }
      }
      const str = content.slice(i, j + 1);

      // Check if this is an object key by looking ahead for colon
      let k = j + 1;
      while (k < content.length && /\\s/.test(content[k])) k++;
      const isKey = content[k] === ":";

      tokens.push(
        <span
          key={key++}
          className={isKey ? "text-sky-300" : "text-emerald-300"}
        >
          {str}
        </span>
      );
      i = j + 1;
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === "-" && /[0-9]/.test(content[i + 1]))) {
      let j = i + (ch === "-" ? 1 : 0);
      while (j < content.length && /[0-9.eE+-]/.test(content[j])) j++;
      tokens.push(
        <span key={key++} className="text-amber-300">
          {content.slice(i, j)}
        </span>
      );
      i = j;
      continue;
    }

    if (content.slice(i, i + 4) === "true" || content.slice(i, i + 5) === "false") {
      const word = content.slice(i, i + 5);
      if (word === "false") {
        tokens.push(
          <span key={key++} className="text-purple-300">
            false
          </span>
        );
        i += 5;
      } else {
        tokens.push(
          <span key={key++} className="text-purple-300">
            true
          </span>
        );
        i += 4;
      }
      continue;
    }

    if (content.slice(i, i + 4) === "null") {
      tokens.push(
        <span key={key++} className="text-purple-300">
          null
        </span>
      );
      i += 4;
      continue;
    }

    // Punctuation / whitespace
    tokens.push(
      <span key={key++} className="text-text-muted">
        {ch}
      </span>
    );
    i++;
  }

  return tokens;
}

export function CodeBlock({ content, language, showCopy = true, className = "" }: CodeBlockProps) {
  const formatted = language === "json" ? formatJson(content) : content;

  return (
    <div className={`relative rounded-md border border-surface-border bg-surface-code ${className}`}>
      {showCopy && (
        <div className="absolute right-2 top-2">
          <CopyButton text={formatted} />
        </div>
      )}
      <pre className="overflow-auto p-4 text-sm font-mono leading-relaxed max-h-[60vh]">
        <code>
          {language === "json"
            ? highlightJson(formatted)
            : formatted}
        </code>
      </pre>
    </div>
  );
}
