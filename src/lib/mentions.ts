/**
 * Extract @username mentions from free text. Matches GitHub-style logins:
 * letters, digits, hyphens. Skips the leading @ from the returned slugs.
 */
const MENTION_RE = /(?:^|[\s\(\[　（])@([A-Za-z0-9][A-Za-z0-9-]{0,38})/g;

export function parseMentions(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(MENTION_RE)) {
    if (m[1]) found.add(m[1]);
  }
  return [...found];
}

/**
 * Wrap @mentions in `<a>` links pointing at the user's GitHub profile.
 * Returns plain markup safe to render via dangerouslySetInnerHTML — escapes
 * other text first.
 */
export function renderMentionsHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return escaped.replace(
    /(^|[\s\(\[　（])@([A-Za-z0-9][A-Za-z0-9-]{0,38})/g,
    (_match, pre, login) =>
      `${pre}<a href="https://github.com/${login}" target="_blank" rel="noreferrer noopener nofollow" class="text-primary hover:underline">@${login}</a>`,
  );
}
