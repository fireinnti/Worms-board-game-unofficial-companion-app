import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../App.js", import.meta.url), "utf8");
const components = await readFile(
  new URL("../src/ui/components/index.js", import.meta.url),
  "utf8",
);
const theme = await readFile(
  new URL("../src/ui/theme.js", import.meta.url),
  "utf8",
);

test("the Play Back control renders on the light surface", () => {
  assert.match(
    app,
    /<Button\s+surface="light"\s+disabled=\{step === 0\}[\s\S]*?>\s*Back\s*<\/Button>/,
  );
});

test("light-surface buttons receive ink text and readable disabled styles", () => {
  assert.match(components, /lightSurface\?styles\.buttonTextLight/);
  assert.match(components, /lightSurface\?styles\.buttonTextDisabledLight/);
  assert.match(theme, /buttonTextLight:\{color:colors\.ink/);
  assert.match(theme, /buttonDisabledLight:\{backgroundColor:"#E4DCC5",borderColor:"#8A826F"/);
  assert.match(theme, /buttonTextDisabledLight:\{color:"#51584E"/);
});

test("the Rules back control explicitly uses the light surface", () => {
  assert.match(
    app,
    /<Button surface="light" onPress=\{\(\) => setSelected\(null\)\}>Back to all rules<\/Button>/,
  );
});

test("rule references use readable colors on the dark Rules screen", () => {
  assert.match(app, /surface = "light"/);
  assert.match(app, /styles\.ruleNameDark/);
  assert.match(app, /styles\.ruleBodyDark/);
  assert.match(app, /references=\{filtered\} onRule=\{setSelected\} surface="dark"/);
  assert.match(theme, /ruleNameDark:\{color:colors\.grassGreen\}/);
  assert.match(theme, /ruleBodyDark:\{color:"#E2E8DE"\}/);
  assert.match(theme, /sourceDark:\{color:colors\.muted/);
});
