import fs from 'node:fs';
import path from 'node:path';
import * as url from 'url';
import config from '../build.config.js';
import { minify } from 'minify';
import { rollup } from 'rollup';
import terser from '@rollup/plugin-terser';
import ejs from 'ejs';

const rootPath = path.join(url.fileURLToPath(new URL('.', import.meta.url)), '../');

for(const outputConfig of config.output) {
    // Build CSS
    const css = config.input.css.map(file => {
        const css = path.join(rootPath, file);

        return {
            file,
            contents: fs.readFileSync(css, { encoding: 'utf8' }),
        };
    });

    // Build JS
    const js = await Promise.all(config.input.js.map(async file => {
        const js = path.join(rootPath, file);
        const plugins = outputConfig.minify ? [ terser() ] : [];
        const bundle = await rollup({ input: js, plugins });
        const { output } = await bundle.generate({ format: 'iife' });

        return {
            file,
            contents: output[0].code,
        };
    }));

    // Build PHP
    const processedPhpContents = php => {
        const processed = fs.readFileSync(php, { encoding: 'utf8' })
            .trim()
            .replace(/^<\?php|\?>$/g, '')
            .replace(/use\s+([a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*)\s*;/g, '')
            .trim();

        if(!outputConfig.minify) return processed;

        return processed.replace(/\s*(\r\n|\r|\n)\s*/g, '').trim();
    }

    const getPhpDependencies = (php, level = 0, ignore = []) => {
        const contents = fs.readFileSync(php, { encoding: 'utf8' });
        const usedClasses = [...contents.matchAll(/use\s+([a-zA-Z_\x80-\xff][a-zA-Z0-9_\x80-\xff]*)\s*;/g)].map(match => match[1]);
        let dependencies = Object.fromEntries(new Map(usedClasses.map(className => [ className, level ])));

        for(const className of usedClasses) {
            if(ignore.includes(className)) continue;

            const file = path.join(path.dirname(php), `${className}.php`);

            if(!fs.existsSync(file)) continue;

            dependencies = {
                ...dependencies,
                ...getPhpDependencies(file, level+1, [...new Set([...ignore, ...usedClasses])]),
            };
        }

        return dependencies;
    };

    const php = config.input.php.map(file => {
        const php = path.join(rootPath, file);
        const dependencies = getPhpDependencies(php);

        let files = Object.keys(dependencies).map(className => {
            const filePath = path.join(path.dirname(php), `${className}.php`);

            return {
                file: path.relative(rootPath, filePath),
                contents: processedPhpContents(filePath),
            };
        });

        return [
            ...files,
            {
                file,
                contents: processedPhpContents(php),
            },
        ];
    }).flat();

    // Render output
    for(const file of config.input.html) {
        const distPath = path.join(rootPath, path.dirname(outputConfig.path));

        fs.mkdirSync(distPath, { recursive: true });

        const html = path.join(rootPath, file);
        const rendered = await ejs.renderFile(html, {
            css: css,
            js: js,
            php: php,
        });

        if(outputConfig.minify) {
            fs.writeFileSync(path.join(rootPath, outputConfig.path), await minify.html(rendered));
        } else {
            fs.writeFileSync(path.join(rootPath, outputConfig.path), rendered);
        }
    }
}

