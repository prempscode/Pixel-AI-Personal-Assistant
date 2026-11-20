import { useEffect, useRef, useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import clike from "react-syntax-highlighter/dist/esm/languages/prism/clike";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import { Check, Copy, TerminalSquare } from "lucide-react";
import { copyText } from "../../lib/clipboard";

const languageModules = [
  ["markup", markup],
  ["css", css],
  ["clike", clike],
  ["javascript", javascript],
  ["jsx", jsx],
  ["typescript", typescript],
  ["tsx", tsx],
  ["python", python],
  ["java", java],
  ["c", c],
  ["cpp", cpp],
  ["csharp", csharp],
  ["json", json],
  ["sql", sql],
  ["bash", bash],
  ["yaml", yaml],
  ["markdown", markdown],
  ["go", go],
  ["rust", rust],
];

languageModules.forEach(([name, module]) => {
  SyntaxHighlighter.registerLanguage(name, module);
});

const aliases = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  py: "python",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  html: "markup",
  xml: "markup",
  svg: "markup",
  cxx: "cpp",
  "c++": "cpp",
  cs: "csharp",
  "c#": "csharp",
  yml: "yaml",
  md: "markdown",
  plaintext: "text",
  txt: "text",
};

const displayNames = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  jsx: "JSX",
  tsx: "TSX",
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  markup: "HTML",
  css: "CSS",
  json: "JSON",
  sql: "SQL",
  bash: "Bash",
  yaml: "YAML",
  markdown: "Markdown",
  go: "Go",
  rust: "Rust",
  text: "Plain text",
};

const registeredLanguages = new Set(languageModules.map(([name]) => name));

const codeTheme = {
  'code[class*="language-"]': {
    color: "#ece8dc",
    background: "none",
    fontFamily:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: "12.5px",
    lineHeight: 1.75,
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    tabSize: 2,
    hyphens: "none",
  },
  'pre[class*="language-"]': {
    color: "#ece8dc",
    background: "transparent",
    fontFamily:
      '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
    fontSize: "12.5px",
    lineHeight: 1.75,
    direction: "ltr",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    tabSize: 2,
    hyphens: "none",
    padding: "16px",
    margin: 0,
  },
  comment: { color: "#7f8976", fontStyle: "italic" },
  prolog: { color: "#7f8976" },
  doctype: { color: "#7f8976" },
  cdata: { color: "#7f8976" },
  punctuation: { color: "#aaa99f" },
  namespace: { opacity: 0.78 },
  property: { color: "#c7b7ff" },
  tag: { color: "#ff9a70" },
  boolean: { color: "#d7ff3e" },
  number: { color: "#ffbe98" },
  constant: { color: "#ffbe98" },
  symbol: { color: "#d7ff3e" },
  deleted: { color: "#ff9a70" },
  selector: { color: "#d7ff3e" },
  "attr-name": { color: "#b8d1ff" },
  string: { color: "#d7ff3e" },
  char: { color: "#d7ff3e" },
  builtin: { color: "#b8d1ff" },
  inserted: { color: "#d7ff3e" },
  operator: { color: "#c8c3b6" },
  entity: { color: "#c8c3b6" },
  url: { color: "#b8d1ff" },
  atrule: { color: "#c7b7ff" },
  "attr-value": { color: "#d7ff3e" },
  keyword: { color: "#ff9a70" },
  function: { color: "#b8d1ff" },
  "class-name": { color: "#ffd18b" },
  regex: { color: "#ffd18b" },
  important: { color: "#ff9a70", fontWeight: 600 },
  variable: { color: "#f3f0e7" },
  "maybe-class-name": { color: "#ffd18b" },
  parameter: { color: "#ece8dc" },
  "function-variable": { color: "#b8d1ff" },
};

function normalizeLanguage(language) {
  const value = String(language || "")
    .toLowerCase()
    .trim();
  const normalized = aliases[value] || value;
  return normalized === "text" ? "text" : normalized;
}

export default function MarkdownCodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef(null);
  const normalized = normalizeLanguage(language);
  const displayLanguage =
    displayNames[normalized] ||
    (normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : "Code");
  const highlightLanguage = registeredLanguages.has(normalized)
    ? normalized
    : "text";
  const lineCount = code.split("\n").length;

  useEffect(
    () => () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    },
    [],
  );

  async function copyCode() {
    const wasCopied = await copyText(code);
    setCopied(wasCopied);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    if (wasCopied) {
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="md-code-block">
      <div className="md-code-toolbar">
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="size-1.5 rounded-full bg-[#ff9366]/75" />
            <span className="size-1.5 rounded-full bg-[#d7ff3e]/70" />
            <span className="size-1.5 rounded-full bg-[#b8d1ff]/65" />
          </span>
          <TerminalSquare
            className="ml-1 size-3 shrink-0 text-white/32"
            strokeWidth={1.8}
            aria-hidden="true"
          />
          <span className="truncate font-mono text-[9px] font-semibold tracking-[0.08em] text-white/45 uppercase">
            {displayLanguage}
          </span>
        </span>

        <button
          type="button"
          onClick={copyCode}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[9px] font-semibold text-white/45 transition-colors duration-300 hover:bg-white/[0.07] hover:text-white/85"
          aria-label={copied ? "Code copied" : "Copy code"}
        >
          {copied ? (
            <Check className="size-3 text-[#d7ff3e]" strokeWidth={2.5} />
          ) : (
            <Copy className="size-3" strokeWidth={1.8} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="md-code-scroll">
        <SyntaxHighlighter
          language={highlightLanguage}
          style={codeTheme}
          customStyle={{
            margin: 0,
            padding: "14px 16px",
            background: "transparent",
            overflowX: "auto",
            fontSize: "12.5px",
            lineHeight: 1.75,
          }}
          codeTagProps={{
            style: {
              fontFamily:
                '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
            },
          }}
          showLineNumbers={lineCount > 5}
          lineNumberStyle={{
            minWidth: "1.8em",
            paddingRight: "1em",
            color: "rgba(243, 240, 231, 0.22)",
            textAlign: "right",
            userSelect: "none",
          }}
          wrapLongLines={false}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
