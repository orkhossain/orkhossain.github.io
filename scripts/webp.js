import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const inputDir = './public/gallery/raw';   // adjust if needed
const outDir = './public/gallery/webp';   // adjust if needed

const validExts = ['.jpg', '.jpeg', '.png'];

function convertAll(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const ext = path.extname(file).toLowerCase();

        if (fs.statSync(fullPath).isDirectory()) {
            convertAll(fullPath); // recurse
        } else if (validExts.includes(ext)) {
            const base = path.basename(file, ext);
            if (!fs.existsSync(outDir)) {
                fs.mkdirSync(outDir, { recursive: true });
            }
            const outPath = path.join(outDir, `${base}.webp`);

            sharp(fullPath)
                .withMetadata({ orientation: 1 }) // prevent auto-rotation by normalizing orientation
                .webp({ quality: 80 })
                .toFile(outPath)
                .then(() => console.log(`✅ Converted: ${file} → ${base}.webp`))
                .catch(err => console.error(`❌ Error converting ${file}:`, err));
        }
    });
}

convertAll(inputDir);

if (process.env.NODE_ENV === 'production') {
    // Remove raw images after conversion
    try {
        fs.rmSync(inputDir, { recursive: true, force: true });
        console.log(`🗑️ Removed raw images from ${inputDir}`);
    } catch (err) {
        console.error(`⚠️ Could not remove raw images:`, err);
    }
}