import { readFileSync } from "fs";
import { join } from "path";
import type { RequestHandler } from "./$types";

export const prerender = true;

export const GET: RequestHandler = async () => {
  // Use process.cwd() to get the project root, works in both dev and build
  const configPath = join(process.cwd(), "static/admin/config.yml");
  const config = readFileSync(configPath, "utf-8");

  return new Response(config, {
    headers: {
      "Content-Type": "text/yaml",
    },
  });
};
