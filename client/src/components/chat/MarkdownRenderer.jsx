import {
  Children,
  Suspense,
  isValidElement,
  lazy,
  memo,
  useState,
} from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ImageOff } from "lucide-react";
import "katex/dist/katex.min.css";
import "../../styles/markdown.css";
import LinkCard from "./LinkCard";
import { isSafeUrl } from "../../lib/constants";

const LazyCodeBlock = lazy(() => import("./MarkdownCodeBlock"));

const remarkPlugins = [remarkGfm, remarkBreaks, remarkMath];
const rehypePlugins = [
  [
    rehypeKatex,
    {
      throwOnError: false,
      strict: "ignore",
      trust: false,
    },
  ],
];

function flattenText(node) {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(flattenText).join("");
  }
  if (isValidElement(node)) {
    return flattenText(node.props.children);
  }
  return "";
}

function containsImage(node) {
  if (!isValidElement(node)) return false;
  if (node.type === MarkdownImage) return true;
  return Children.toArray(node.props?.children).some(containsImage);
}

function safeUrlTransform(url) {
  return isSafeUrl(url) ? url : "";
}

function MarkdownImage({ src, alt = "", title = "" }) {
  const [failed, setFailed] = useState(false);
  const extra = title ? { title } : {};

  if (!src || !isSafeUrl(src)) return null;

  if (failed) {
    return (
      <span className="markdown-image-fallback">
        <ImageOff className="size-4 shrink-0 text-ink/35" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate">
          {alt || "Image could not be loaded"}
        </span>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[9px] font-semibold text-ink/45 underline decoration-ink/20 underline-offset-2 transition hover:text-ink/75"
        >
          Open image
        </a>
      </span>
    );
  }

  return (
    <span className="markdown-figure">
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="markdown-image-link"
        aria-label={alt ? `Open image: ${alt}` : "Open image"}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="markdown-image"
          {...extra}
        />
      </a>
      {alt && <span className="markdown-image-caption">{alt}</span>}
    </span>
  );
}

function MarkdownLink({ href, children }) {
  if (!href || !isSafeUrl(href)) {
    return <span className="markdown-link-fallback">{children}</span>;
  }

  if (Children.toArray(children).some(containsImage)) {
    return <>{children}</>;
  }

  return (
    <LinkCard
      href={href}
      text={flattenText(children)}
      className="my-0.5 mr-1.5"
    />
  );
}

function CodeBlockFallback({ code, language }) {
  return (
    <div className="md-code-block">
      <div className="md-code-toolbar">
        <span className="font-mono text-[9px] font-semibold tracking-[0.08em] text-white/40 uppercase">
          {language || "Code"}
        </span>
      </div>
      <pre className="md-code-fallback">{code}</pre>
    </div>
  );
}

function MarkdownPre({ children }) {
  const child = Children.toArray(children)[0];
  const className = isValidElement(child) ? child.props?.className : "";
  const languageMatch = /language-([^\s]+)/.exec(className || "");
  const code = flattenText(
    isValidElement(child) ? child.props?.children : children,
  ).replace(/\n$/, "");

  return (
    <Suspense
      fallback={
        <CodeBlockFallback
          code={code}
          language={languageMatch?.[1] || ""}
        />
      }
    >
      <LazyCodeBlock code={code} language={languageMatch?.[1] || ""} />
    </Suspense>
  );
}

function MarkdownInlineCode({ children, ...props }) {
  const codeProps = { ...props };
  delete codeProps.node;

  return (
    <code {...codeProps} className="md-inline-code">
      {children}
    </code>
  );
}

function MarkdownTable({ children, ...props }) {
  const tableProps = { ...props };
  delete tableProps.node;

  return (
    <div className="markdown-table-wrap">
      <table {...tableProps}>{children}</table>
    </div>
  );
}

const markdownComponents = {
  a: MarkdownLink,
  img: MarkdownImage,
  pre: MarkdownPre,
  code: MarkdownInlineCode,
  table: MarkdownTable,
};

function MarkdownRenderer({ content }) {
  if (!content) return null;

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        urlTransform={safeUrlTransform}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownRenderer);
