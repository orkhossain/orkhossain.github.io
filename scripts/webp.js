import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = './public/gallery/raw';   // adjust if needed
const outDir = './public/gallery/webp';   // adjust if needed
const thumbDir = './public/gallery/thumb';
const maxWebpBytes = (Number(process.env.MAX_WEBP_SIZE_KB) || 500) * 1024;
const keepRawImages = process.env.KEEP_RAW_IMAGES === 'true';

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
                    .webp({ quality: 1 })
                    .toFile(outPath)
                    .then(async () => {
                        const outputSize = fs.statSync(outPath).size;
                        if (outputSize > maxWebpBytes) {
                            fs.rmSync(outPath, { force: true });
                            fs.rmSync(thumbPath, { force: true });
                            console.log(`🗑️ Skipped large image: ${file} (${Math.round(outputSize / 1024)}KB > ${Math.round(maxWebpBytes / 1024)}KB)`);
                            return;
                        }

                        console.log(`✅ Converted: ${file} → ${base}.webp`);
                        await sharp(fullPath)
                            .rotate()
                            .resize({ width: 300 }) // thumbnail width
                            .webp({ quality: 70 })
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
    resetDir(outDir);
    resetDir(thumbDir);
    console.log(`ℹ️ Max generated image size: ${Math.round(maxWebpBytes / 1024)}KB`);

    const tasks = await convertAll(inputDir);
    await Promise.all(tasks);

    // Remove raw images after conversion so Vite does not copy huge originals into dist.
    if (!keepRawImages) {
        fs.rmSync(inputDir, { recursive: true, force: true });
        console.log(`🗑️ Removed raw images from ${inputDir}`);
    } else {
        console.log(`ℹ️ Keeping raw images because KEEP_RAW_IMAGES=true`);
    }
}

main();
