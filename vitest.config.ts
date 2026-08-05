import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  // Vite 8 transforma con oxc, no con esbuild. La clave `esbuild.jsx` ya no
  // existe en el tipo ESBuildOptions y rompía `tsc --noEmit`.
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Antes se reportaba cobertura y nunca fallaba nada. Los umbrales están
      // puestos apenas por debajo de lo actual: suben cuando suba la cobertura,
      // y el CI avisa si una tanda de cambios la hace bajar.
      thresholds: {
        lines: 45,
        functions: 55,
        branches: 70,
        statements: 45,
      },
      include: ["lib/**/*.ts", "components/**/*.tsx"],
      exclude: ["lib/content/**", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      // Next aliasea "server-only" internamente; Vitest no. Ver el stub.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
});
