import { readFileSync } from "fs";
import { join } from "path";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  // Use process.cwd() to get the project root, works in both dev and build
  const adminHtmlPath = join(process.cwd(), "static/admin/index.html");
  const html = readFileSync(adminHtmlPath, "utf-8");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};
