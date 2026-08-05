const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Download images from Pexels or Unsplash via loremflickr
    const urls = [
        { url: 'https://loremflickr.com/800/600/construction', file: 'static/images/hero_bg.jpg' },
        { url: 'https://loremflickr.com/800/600/hvac', file: 'static/images/hvac.jpg' },
        { url: 'https://loremflickr.com/800/600/pump', file: 'static/images/pump.jpg' },
        { url: 'https://loremflickr.com/800/600/plumbing', file: 'static/images/plumbing.jpg' },
        { url: 'https://loremflickr.com/800/600/civil', file: 'static/images/civil.jpg' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Mitsubishi_logo.svg', file: 'static/images/mitsubishi_logo.svg' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Panasonic_logo_blue.svg', file: 'static/images/panasonic_logo.svg' },
        { url: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Fujitsu-Logo.svg', file: 'static/images/fujitsu_logo.svg' }
    ];

    for (let item of urls) {
        console.log("Fetching: " + item.url);
        try {
            const viewSource = await page.goto(item.url);
            fs.writeFileSync(item.file, await viewSource.buffer());
            console.log("Saved: " + item.file);
        } catch (e) {
            console.error("Failed: " + item.file, e);
        }
    }

    await browser.close();
})();
