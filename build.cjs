const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const pkg = require('./package.json');
const distDir = path.join(__dirname, 'dist');
const banner = `/*!
 * input-mask v${pkg.version}
 * ${pkg.homepage}
 * Released under the ${pkg.license} license
 */`;

async function build() {
    fs.rmSync(distDir, { recursive: true, force: true });
    fs.mkdirSync(distDir, { recursive: true });

    const outputs = [
        {
            format: 'esm',
            outfile: 'dist/input-mask.mjs',
            minify: false,
        },
        {
            format: 'cjs',
            outfile: 'dist/input-mask.cjs',
            minify: false,
        },
        {
            format: 'iife',
            outfile: 'dist/input-mask.min.js',
            globalName: 'InputMask',
            minify: true,
        },
    ];

    await Promise.all(
        outputs.map((config) =>
            esbuild.build({
                entryPoints: ['src/index.js'],
                bundle: true,
                sourcemap: false,
                target: ['es2018'],
                banner: { js: banner },
                ...config,
            })
        )
    );

    console.log('Build complete:');
    console.log('- dist/input-mask.mjs');
    console.log('- dist/input-mask.cjs');
    console.log('- dist/input-mask.min.js');
}

build().catch((error) => {
    console.error(error);
    process.exit(1);
});
