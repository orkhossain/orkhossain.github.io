import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = './public/gallery/raw';   // adjust if needed
const outDir = './public/gallery/webp';   // adjust if needed
const thumbDir = './public/gallery/thumb';
const maxWebpBytes = (Number(process.env.MAX_WEBP_SIZE_KB) || 500) * 1024;
const keepRawImages = process.env.KEEP_RAW_IMAGES !== 'false';
const thumbnailWidth = Number(process.env.THUMB_WIDTH) || 900;

const validExts = ['.jpg', '.jpeg', '.png'];

function resetDir(dir) {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
}

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
            const outPath = path.join(outDir, `${base}.webp`);
            const thumbPath = path.join(thumbDir, `${base}.webp`);

            tasks.push(
                sharp(fullPath)
                    .rotate() // ✅ rotate pixels based on EXIF and remove the Orientation tag
                    .webp({ quality: 70 })
                    .toFile(outPath)
                    .then(async () => {
                        const outputSize = fs.statSync(outPath).size;
                        if (outputSize > maxWebpBytes) {
                            console.log(`⚠️ Large image kept: ${file} (${Math.round(outputSize / 1024)}KB > ${Math.round(maxWebpBytes / 1024)}KB)`);
                        }

                        console.log(`✅ Converted: ${file} → ${base}.webp`);
                        await sharp(fullPath)
                            .rotate()
                            .resize({ width: thumbnailWidth, withoutEnlargement: true })
                            .sharpen()
                            .webp({ quality: 84 })
                            .toFile(thumbPath);
                        console.log(`✅ Thumbnail: ${file} → ${base}.webp`);
                    })
                    .catch(err => console.error(`❌ Error converting ${file}:`, err))
            );
        }
    }
    return tasks;
}

async function main() {
    if (!fs.existsSync(inputDir)) {
        console.log(`ℹ️ Skipping conversion because ${inputDir} does not exist; keeping existing optimized assets`);
        return;
    }

    resetDir(outDir);
    resetDir(thumbDir);
    console.log(`ℹ️ Max generated image size: ${Math.round(maxWebpBytes / 1024)}KB`);

    const tasks = await convertAll(inputDir);
    await Promise.all(tasks);

    if (!keepRawImages) {
        fs.rmSync(inputDir, { recursive: true, force: true });
        console.log(`🗑️ Removed raw images from ${inputDir}`);
    } else {
        console.log(`ℹ️ Keeping raw images after conversion`);
    }
}

main();
