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
import { motion } from "motion/react";
import { copyText } from "../../lib/clipboard";
import { normalizeCodeLanguage } from "../../lib/codeLanguages";

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
    color: "var(--code-text)",
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
    color: "var(--code-text)",
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
  comment: { color: "var(--code-comment)", fontStyle: "italic" },
  prolog: { color: "var(--code-comment)" },
  doctype: { color: "var(--code-comment)" },
  cdata: { color: "var(--code-comment)" },
  punctuation: { color: "var(--code-punctuation)" },
  namespace: { opacity: 0.78 },
  property: { color: "var(--code-property)" },
  tag: { color: "var(--code-keyword)" },
  boolean: { color: "var(--code-boolean)" },
  number: { color: "var(--code-number)" },
  constant: { color: "var(--code-number)" },
  symbol: { color: "var(--code-boolean)" },
  deleted: { color: "var(--code-keyword)" },
  selector: { color: "var(--code-boolean)" },
  "attr-name": { color: "var(--code-function)" },
  string: { color: "var(--code-string)" },
  char: { color: "var(--code-string)" },
  builtin: { color: "var(--code-function)" },
  inserted: { color: "var(--code-string)" },
  operator: { color: "var(--code-operator)" },
  entity: { color: "var(--code-operator)" },
  url: { color: "var(--code-function)" },
  atrule: { color: "var(--code-class)" },
  "attr-value": { color: "var(--code-string)" },
  keyword: { color: "var(--code-keyword)" },
  function: { color: "var(--code-function)" },
  "class-name": { color: "var(--code-class)" },
  regex: { color: "var(--code-class)" },
  important: { color: "var(--code-keyword)", fontWeight: 600 },
  variable: { color: "var(--code-text)" },
  "maybe-class-name": { color: "var(--code-class)" },
  parameter: { color: "var(--code-text)" },
  "function-variable": { color: "var(--code-function)" },
};

function normalizeLanguage(language) {
  const normalized = normalizeCodeLanguage(language);
  return normalized === "text" ? "text" : normalized;
}

export default function MarkdownCodeBlock({ code, language }) {
  const [copyState, setCopyState] = useState("idle");
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
    setCopyState(wasCopied ? "copied" : "failed");
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(
      () => setCopyState("idle"),
      wasCopied ? 1800 : 2400,
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 7 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="md-code-block"
    >
      <div className="md-code-toolbar">
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex items-center gap-1" aria-hidden="true">
            <span className="size-1.5 rounded-full bg-ember/80" />
            <span className="size-1.5 rounded-full bg-ok/75" />
            <span className="size-1.5 rounded-full bg-sky-400/70" />
          </span>
          <svg
            viewBox="0 0 16 16"
            className="ml-1 size-3 shrink-0 text-[var(--code-muted)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="1.5" y="2.5" width="13" height="11" rx="2" />
            <path d="m4.5 6 2 2-2 2M8 10h3" />
          </svg>
          <span className="truncate font-mono text-[9px] font-semibold tracking-[0.08em] text-[var(--code-muted)] uppercase">
            {displayLanguage}
          </span>
        </span>

        <motion.button
          type="button"
          onClick={copyCode}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[9px] font-semibold text-[var(--code-muted)] transition-[background-color,color] duration-200 hover:bg-[color-mix(in_srgb,var(--code-text)_8%,transparent)] hover:text-[var(--code-text)]"
          aria-label={
            copyState === "copied"
              ? "Code copied"
              : copyState === "failed"
                ? "Code copy failed"
                : "Copy code"
          }
        >
          {copyState === "copied" ? (
            <svg viewBox="0 0 16 16" className="size-3 text-ok" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m3.5 8.2 2.8 2.8 6.2-6.2" />
            </svg>
          ) : copyState === "failed" ? (
            <svg viewBox="0 0 16 16" className="size-3 text-danger" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M8 4v4M8 11.5h.01M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" />
              <path d="M10.5 5.5v-2a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2" />
            </svg>
          )}
          {copyState === "copied"
            ? "Copied"
            : copyState === "failed"
              ? "Copy failed"
              : "Copy"}
        </motion.button>
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
            color: "var(--code-line-number)",
            textAlign: "right",
            userSelect: "none",
          }}
          wrapLongLines={false}
          PreTag="div"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
}
