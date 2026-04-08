const esbuild = require('esbuild');

esbuild.build({
    entryPoints: ['src/index.js'],
    bundle: true,
    minify: false,
    sourcemap: true,
    outfile: 'dist/input-mask.js',
    format: 'iife',
    globalName: 'InputMask',
    target: ['es2018'],
}).then(() => {
    console.log('Bundle generated: dist/input-mask.js');
}).catch((error) => {
    console.error(error);
    process.exit(1);
});