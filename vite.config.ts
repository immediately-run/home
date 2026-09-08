import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import { devFs } from '@immediately-run/dev-fs'

// MDX must run before @vitejs/plugin-react so the JSX it emits is handled by
// React's transform (Fast Refresh included). immediately.run processes .mdx
// natively; this wiring keeps the local `vite dev`/`build` in sync.
//
// devFs() (@immediately-run/dev-fs) makes `import ... from 'fs'` work during
// local `vite dev`, bridging the same async ZenFS surface immediately.run
// provides to your real disk. It is dev-only and absent from production builds.
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devFs(),
    { enforce: 'pre', ...mdx() },
    react(),
  ],
  test: {
    // The SDK dist ships extensionless relative ESM imports, which Vite's
    // resolver accepts but Node's — used for externalized deps in vitest —
    // rejects. Inlining routes it through Vite's resolver in tests only.
    server: { deps: { inline: ['@immediately-run/sdk'] } },
  },
})
