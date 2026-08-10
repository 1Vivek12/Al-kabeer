const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
    const srcPath = 'C:\\Users\\nello\\.gemini\\antigravity-ide\\brain\\89ce88dd-34fb-4583-91bc-cc69ec9c1fff\\media__1786363078697.png';
    const destDir = path.join(__dirname, 'images1');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const rawBase64 = fs.readFileSync(srcPath).toString('base64');
    const dataUrl = `data:image/png;base64,${rawBase64}`;

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Process image in canvas to make white background transparent
    const transparentPngBase64 = await page.evaluate(async (imgUrl) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imgData.data;

                // Threshold for near white background removal
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    // If pixel is close to white (R,G,B > 220)
                    if (r > 215 && g > 215 && b > 215) {
                        data[i + 3] = 0; // Make transparent
                    }
                }

                ctx.putImageData(imgData, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = imgUrl;
        });
    }, dataUrl);

    await browser.close();

    const base64Data = transparentPngBase64.replace(/^data:image\/png;base64,/, "");
    
    // Save to images1/stamp.png and images1/stamp.jpg and static/images/stamp.png
    const targetPng = path.join(__dirname, 'images1', 'stamp.png');
    const targetJpg = path.join(__dirname, 'images1', 'stamp.jpg');
    const targetStaticPng = path.join(__dirname, 'static', 'images', 'stamp.png');
    const targetStaticJpg = path.join(__dirname, 'static', 'images', 'stamp.jpg');

    fs.writeFileSync(targetPng, Buffer.from(base64Data, 'base64'));
    fs.writeFileSync(targetJpg, fs.readFileSync(srcPath)); // original JPEG/PNG
    fs.writeFileSync(targetStaticPng, Buffer.from(base64Data, 'base64'));
    fs.writeFileSync(targetStaticJpg, fs.readFileSync(srcPath));

    console.log("Successfully extracted stamp, removed white background, and saved to images1/ and static/images/");
})();
