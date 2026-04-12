import { runAuthTests } from "./auth.test.js";
import { runDataTests } from "./data.test.js";

const tests = [
  ["auth", runAuthTests],
  ["data", runDataTests],
];

let hasFailures = false;

for (const [name, run] of tests) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    hasFailures = true;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

if (hasFailures) {
  process.exit(1);
}
