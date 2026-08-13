const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto('http://127.0.0.1:8080/admin/hr.html', { waitUntil: 'networkidle0' });

    // Capture screen preview screenshot
    await page.screenshot({ path: 'screen_preview_now.png' });

    // Generate actual PDF to check print layout
    await page.emulateMediaType('print');
    await page.pdf({
        path: 'print_pdf_now.pdf',
        format: 'A4',
        printBackground: true
    });

    // Also capture screen image of emulateMediaType('print')
    await page.screenshot({ path: 'print_emulated_now.png', fullPage: true });

    await browser.close();
    console.log("Captured screen_preview_now.png, print_emulated_now.png, and print_pdf_now.pdf!");
})();
