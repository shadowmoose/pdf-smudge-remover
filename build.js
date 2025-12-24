import fs from 'fs';
import crypto from 'crypto';
import * as path from "node:path";


let content = fs.readFileSync('index.html', 'utf-8');
const urls = content.match(/(['"`]https:\/\/cdn.jsdelivr.net.+[`'"])/gmi).map(u => u.replace(/['"`]/g, ''));


async function download(url, destinationPath) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    await fs.promises.writeFile(destinationPath, Buffer.from(buffer));
}

fs.mkdirSync('dist', { recursive: true });

await Promise.all(urls.map(async url => {
    const hash = crypto.createHash('sha256').update(url).digest('hex');
    const fileName = `${hash}${path.extname(url)}`;

    await download(url, `dist/${fileName}`);
    content = content.replaceAll(url, `./${fileName}`);
}));

fs.writeFileSync('dist/index.html', content);

fs.copyFileSync('favicon.svg', 'dist/favicon.svg');