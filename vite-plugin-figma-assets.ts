import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const PREFIX = 'figma:asset/'

/** 1×1 transparent PNG — used when no file exists under `src/assets/figma/`. */
const PNG_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

export function figmaAssetsPlugin(rootDir: string): Plugin {
  const assetsDir = path.resolve(rootDir, 'src/assets/figma')

  return {
    name: 'figma-assets',
    resolveId(id) {
      if (!id.startsWith(PREFIX)) return
      const fileName = id.slice(PREFIX.length)
      const resolved = path.join(assetsDir, fileName)
      if (fs.existsSync(resolved)) return resolved
      return `\0${id}`
    },
    load(id) {
      if (!id.startsWith(`\0${PREFIX}`)) return
      return `export default ${JSON.stringify(PNG_DATA_URL)}`
    },
  }
}
