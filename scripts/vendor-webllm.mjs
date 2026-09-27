// Copies the WebLLM browser library into public/vendor so it is served as a
// static file from this site, loaded only in the browser after the person
// taps Download in Me. Kept out of the server bundle (the free Workers plan
// allows 3 MB) and out of git (it is rebuilt from node_modules).
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "node_modules/@mlc-ai/web-llm");
const { version } = JSON.parse(readFileSync(join(pkg, "package.json"), "utf8"));
mkdirSync(join(root, "public/vendor"), { recursive: true });
copyFileSync(join(pkg, "lib/index.js"), join(root, "public/vendor/web-llm.js"));
console.log(`vendor: web-llm ${version} copied to public/vendor/web-llm.js`);
