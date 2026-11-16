import esbuild from 'esbuild';

// Bundles the plugin source (src/main.js) into main.js, the file Obsidian loads.
await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  outfile: 'main.js',
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  external: ['obsidian', 'electron'],
  logLevel: 'info',
  sourcemap: false,
  minify: false,
  banner: { js: '/* Automatic Time Tracker – built from src/main.js with esbuild. Source: https://github.com/kluesn/automatic-time-tracker */' },
});
