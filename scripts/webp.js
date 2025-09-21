import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = './public/gallery/images';   // adjust if needed
const outputDir = inputDir;                   // overwrite or save alongside

const validExts = ['.jpg', '.jpeg', '.png'];

function convertAll(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const ext = path.extname(file).toLowerCase();

        if (fs.statSync(fullPath).isDirectory()) {
            convertAll(fullPath); // recurse
        } else if (validExts.includes(ext)) {
            const base = path.basename(file, ext);
            const outPath = path.join(dir, `${base}.webp`);

            sharp(fullPath)
                .webp({ quality: 80 })
                .toFile(outPath)
                .then(() => console.log(`✅ Converted: ${file} → ${base}.webp`))
                .catch(err => console.error(`❌ Error converting ${file}:`, err));
        }
    });
}

convertAll(inputDir);