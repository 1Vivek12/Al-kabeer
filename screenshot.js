const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({
        headless: "new"
    });
    console.log("Opening page...");
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log("Navigating...");
    await page.goto('http://127.0.0.1:8080/admin/hr.html', { waitUntil: 'networkidle2' });
    
    console.log("Waiting a bit...");
    await new Promise(r => setTimeout(r, 2000));
    
    // Fill out the form to generate a letter
    console.log("Filling form...");
    await page.type('#empName', 'JOHN DOE TEST');
    await page.type('#empIdNo', 'QTR123456');
    await page.type('#empTitle', 'TEST ENGINEER');
    await page.type('#empNat', 'INDIA');
    
    console.log("Taking screenshot...");
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    console.log("Done.");
    
    await browser.close();
})();
