const { build } = require('esbuild')
const { copy } = require('esbuild-plugin-copy')

build({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/index.cjs',
  bundle: true,
  platform: 'node',
  target: 'node18',
  sourcemap: true,
  // external: ['@prisma/client'],
  plugins: [
    copy({
      assets: [
        { from: './prisma', to: './dist/prisma' }
      ]
    })
  ]
})
.then(() => console.log('Build Successful'))
.catch(() => process.exit(1))
