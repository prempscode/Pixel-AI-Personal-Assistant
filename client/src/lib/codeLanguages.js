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

const supportedLanguages = new Set([
  "bash",
  "c",
  "clike",
  "cpp",
  "csharp",
  "css",
  "go",
  "java",
  "javascript",
  "json",
  "jsx",
  "markdown",
  "markup",
  "python",
  "rust",
  "sql",
  "tsx",
  "typescript",
  "yaml",
]);

export function normalizeCodeLanguage(language) {
  const value = String(language || "")
    .toLowerCase()
    .trim();
  return aliases[value] || value;
}

export function isCodeLanguage(language) {
  return supportedLanguages.has(normalizeCodeLanguage(language));
}
