import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = './public/gallery/raw';   // adjust if needed
const outDir = './public/gallery/webp';   // adjust if needed
const thumbDir = './public/gallery/thumb';

const validExts = ['.jpg', '.jpeg', '.png'];

async function convertAll(dir) {
    const tasks = [];
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const ext = path.extname(file).toLowerCase();

        if (fs.statSync(fullPath).isDirectory()) {
            const subTasks = await convertAll(fullPath);
            tasks.push(...subTasks);
        } else if (validExts.includes(ext)) {
            const base = path.basename(file, ext);
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }
            const outPath = path.join(outDir, `${base}.webp`);
            if (!fs.existsSync(thumbDir)) {
                fs.mkdirSync(thumbDir, { recursive: true });
            }
            const thumbPath = path.join(thumbDir, `${base}.webp`);

            tasks.push(
                sharp(fullPath)
                    .rotate() // ✅ rotate pixels based on EXIF and remove the Orientation tag
                    .webp({ quality: 1 })
                    .toFile(outPath)
                    .then(() => console.log(`✅ Converted: ${file} → ${base}.webp`))
                    .catch(err => console.error(`❌ Error converting ${file}:`, err))
            );
            tasks.push(
                sharp(fullPath)
                    .rotate()
                    .resize({ width: 300 }) // thumbnail width
                    .webp({ quality: 70 })
                    .toFile(thumbPath)
                    .then(() => console.log(`✅ Thumbnail: ${file} → ${base}.webp`))
                    .catch(err => console.error(`❌ Error creating thumbnail for ${file}:`, err))
            );
        }
    }
    return tasks;
}

async function main() {
    const tasks = await convertAll(inputDir);
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