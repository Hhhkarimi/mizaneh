import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
await mkdir("build", { recursive: true });
const args = ["scripts/offline-entry.tsx", "--bundle", "--format=esm", "--jsx=automatic", "--outfile=build/app.js", "--loader:.woff2=dataurl", "--loader:.woff=dataurl", "--minify", '--define:process.env.NODE_ENV="production"'];
if (process.argv.includes("--assemble-only")) {
  // The caller has already built the same entry point with the CLI.
} else if (process.env.MIZANEH_ESBUILD_BINARY) {
  const result = spawnSync(process.env.MIZANEH_ESBUILD_BINARY, args, { stdio: "inherit", windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
} else {
  const { build } = require("esbuild");
  await build({ entryPoints: ["scripts/offline-entry.tsx"], bundle: true, format: "esm", jsx: "automatic", outfile: "build/app.js", loader: { ".woff2": "dataurl", ".woff": "dataurl" }, minify: true, define: { "process.env.NODE_ENV": '"production"' } });
}
const [css, js] = await Promise.all([readFile("build/app.css", "utf8"), readFile("build/app.js", "utf8")]);
const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="میزانه؛ برنامهٔ غذایی کامل و قابل ویرایش برای سه هدف"><title>میزانه | برنامهٔ غذایی کامل</title><link rel="icon" href="data:,"><style>${css}</style></head><body><div id="root"></div><script type="module">${js.replaceAll("</script", "<\\/script")}</script></body></html>`;
await writeFile("build/mizaneh.html", html);
console.log("Created build/mizaneh.html from the original DietPlanner component.");
