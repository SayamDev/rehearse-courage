// Copies the WebLLM browser library into public/vendor so it is served as a
// static file from this site, loaded only in the browser after the person
// taps Download in Me. Kept out of the server bundle (the free Workers plan
// allows 3 MB) and out of git (it is rebuilt from node_modules).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "node_modules/@mlc-ai/web-llm");
const { version } = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"));
mkdirSync(join(root, "public/vendor"), { recursive: true });
// The source map is not shipped, so drop the comment that points to it.
const code = readFileSync(join(pkg, "lib/index.js"), "utf8").replace(/\n\/\/# sourceMappingURL=\S+\s*$/, "\n");
writeFileSync(join(root, "public/vendor/web-llm.js"), code);
console.log(`vendor: web-llm ${version} copied to public/vendor/web-llm.js`);
