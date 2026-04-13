import esbuild from "esbuild";
import { readdir } from "fs/promises";
import { resolve } from "path";

const watch = process.argv.includes("--watch");

// Each subdirectory of src/ is a separate plugin.
// Entry: src/<plugin>/index.ts -> dist/<plugin>.js
const srcDir = "./src";
const entries = await readdir(srcDir, { withFileTypes: true }).then((dirs) =>
  dirs
    .filter((d) => d.isDirectory())
    .map((d) => ({ in: resolve(srcDir, d.name, "index.ts"), out: d.name }))
);

const ctx = await esbuild.context({
  entryPoints: entries,
  outdir: "./dist",
  bundle: true,
  minify: !watch,
  platform: "browser",
  format: "iife",
  logLevel: "info",
});

if (watch) {
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
