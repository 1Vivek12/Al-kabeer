const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser for PDF generation test...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log("Navigating to HR admin...");
    await page.goto('http://127.0.0.1:8080/admin/hr.html', { waitUntil: 'networkidle0' });
    
    console.log("Filling form...");
    await page.type('#empName', 'AASHIK RAUT');
    await page.type('#empIdNo', 'PA5231328');
    await page.type('#empTitle', 'CIVIL FOREMAN');
    await page.type('#empNat', 'NEPAL');
    
    console.log("Clicking Generate Document button...");
    // Click button to trigger JS print preparation
    await page.evaluate(() => {
        document.getElementById('btnGenerate').click();
    });

    await new Promise(r => setTimeout(r, 500));
    
    console.log("Emulating print media...");
    await page.emulateMediaType('print');
    
    console.log("Generating PDF file...");
    await page.pdf({
        path: 'test_output.pdf',
        format: 'A4',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    console.log("PDF generated successfully: test_output.pdf");
    await browser.close();
})();
