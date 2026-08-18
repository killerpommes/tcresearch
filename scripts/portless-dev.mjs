import { spawn } from "node:child_process";
import { delimiter, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const environment = { ...process.env };

if (process.platform === "win32") {
  // Portless launches children through the first cmd.exe on PATH. Bun's
  // shim can shadow Windows cmd.exe and misparse Vite's injected flags.
  const pathKeys = Object.keys(environment).filter(
    (key) => key.toLowerCase() === "path",
  );
  const pathKey = pathKeys[0] ?? "Path";
  const system32 = resolve(environment.SystemRoot ?? "C:\\Windows", "System32");
  const existingPath = environment[pathKey] ?? "";

  for (const key of pathKeys) {
    delete environment[key];
  }

  environment[pathKey] = [
    system32,
    ...existingPath
      .split(delimiter)
      .filter((entry) => entry && entry.toLowerCase() !== system32.toLowerCase()),
  ].join(delimiter);
}

const portlessEntry = fileURLToPath(import.meta.resolve("portless"));
const portlessCli = resolve(dirname(portlessEntry), "cli.js");
const child = spawn(
  process.execPath,
  [portlessCli, "tcresearch", "vite", ...process.argv.slice(2)],
  { env: environment, stdio: "inherit" },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  console.error(`Failed to start Portless: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = signal ? 1 : (code ?? 1);
});
