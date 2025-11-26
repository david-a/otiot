import { readFileSync } from "fs";
import { join } from "path";
import { base } from "$app/paths";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  // Use process.cwd() to get the project root, works in both dev and build
  const adminHtmlPath = join(process.cwd(), "static/admin/index.html");
  let html = readFileSync(adminHtmlPath, "utf-8");

  // Inject base path into config URL if base path is set
  // Replace relative path with absolute path including base
  if (base) {
    html = html.replace(
      'href="./config.yml"',
      `href="${base}/admin/config.yml"`
    );
  }

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};
