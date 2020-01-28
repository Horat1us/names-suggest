#!/usr/bin/env node --experimental-modules --es-module-specifier-resolution=node
import https from "https";
import fs from "fs";
import util from "util";
import path from "path";
import Horat1us from "@horat1us/bing-translator";

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const dataDir = path.resolve('./data');
const cacheFile = path.resolve('./translate.cache.json');
const separator = '. ';

const cache = fs.existsSync(cacheFile) ? JSON.parse(fs.readFileSync(cacheFile)) : {};

async function saveCache() {
    await writeFile(cacheFile, JSON.stringify(cache));
    console.log(`cache saved: ${Object.keys(cache).length}`);
}

const translator = new Horat1us.BingTranslator;
console.log(`cache size: ${Object.keys(cache).length}`);

async function translate(source) {
    let target = source.map((item, i) => {
        if (item in cache) {
            source[i] = '';
            return cache[item];
        }
        return undefined;
    });
    source = source.filter((item) => !!item);
    if (source.length === 0) {
        return target;
    }

    const result = [];
    while (source.length > 0) {
        const chunk = source.splice(0, 512);
        const request = chunk.map((item) => `Олег ${item[0].toUpperCase()}${item.slice(1)}`).join(separator);
        const text = await translator.evaluate(request);
        console.log(request);
        console.log(text);
        const data = text.split(separator).map((item) => item.toLowerCase());
        if (chunk.length !== data.length) {
            fs.writeFileSync('out.json', JSON.stringify({ chunk, data }));
            console.error(`Invalid Output Length: ${chunk.length} ${data.length}`);
            return undefined;
        }
        chunk.forEach((key, i) => result.push(cache[key] = data[i]));
    }
    return result;
}

const files = fs
    .readdirSync(dataDir)
    .filter((file) => file.match(/last-name\.ru\.value\.json$/))
    .map((file) => path.join(dataDir, file))
    .map((input) => ({ input, output: input.replace(/\.ru(\.value\.json)$/, '.ua$1') }));

(async () => {
    for (let { input, output } of files) {
        console.log(`> ${input}`);
        await readFile(input)
            .then((content) => JSON.parse(content.toString()))
            .then(async ({ data, tags, ...source }) => {
                data = data.slice(0, 128);
                console.log(`translate ${tags.join('/')} ${data.length}`);
                data = await translate(data);
                tags = [...tags.filter((tag) => tag !== 'ru'), 'ua'];
                return ({
                    ...source,
                    tags, data,
                });
            })
            .then((result) => {
                console.log(`done ${input}: ${result.data.length}`);
                return writeFile(output, JSON.stringify(result));
            }, (error) => {
                console.log(`fail ${input}: ${error.toString()}`);
                return Promise.resolve();
            });
        await saveCache();
    }
})().catch((error) => console.error(error));
