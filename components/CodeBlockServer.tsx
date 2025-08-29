import { codeToHtml } from "shiki";

export default async function CodeBlockServer({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const html = await codeToHtml(code, {
    lang: language || "plaintext",
    theme: "github-light-default",
  });

  return (
    <div
      className="shiki not-prose"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ borderRadius: "0.375rem" }}
    />
  );
}
