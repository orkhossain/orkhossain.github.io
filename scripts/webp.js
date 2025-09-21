import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = './public/gallery/raw';   // adjust if needed
const outDir = './public/gallery/webp';   // adjust if needed

const validExts = ['.jpg', '.jpeg', '.png'];

async function convertAll(dir) {
    const tasks = [];
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const ext = path.extname(file).toLowerCase();

        if (fs.statSync(fullPath).isDirectory()) {
            tasks.push(...convertAll(fullPath));
        } else if (validExts.includes(ext)) {
            const base = path.basename(file, ext);
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }
            const outPath = path.join(outDir, `${base}.webp`);

            tasks.push(
                sharp(fullPath)
                    .withMetadata({ orientation: 1 }) // prevent auto-rotation by normalizing orientation
                    .webp({ quality: 80 })
                    .toFile(outPath)
                    .then(() => console.log(`✅ Converted: ${file} → ${base}.webp`))
                    .catch(err => console.error(`❌ Error converting ${file}:`, err))
            );
        }
    });
    return tasks;
}

async function main() {
    const tasks = convertAll(inputDir);
    await Promise.all(tasks);

    if (process.env.NODE_ENV === 'production') {
        // Remove raw images after conversion
        try {
            fs.rmSync(inputDir, { recursive: true, force: true });
            console.log(`🗑️ Removed raw images from ${inputDir}`);
        } catch (err) {
            console.error(`⚠️ Could not remove raw images:`, err);
        }
    }
}

main();