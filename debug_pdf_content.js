const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('http://127.0.0.1:8080/admin/hr.html', { waitUntil: 'networkidle0' });

    await page.emulateMediaType('print');

    const checkResult = await page.evaluate(() => {
        const textNodes = [];
        const allDivs = document.querySelectorAll('#offerTemplate *');
        
        allDivs.forEach(el => {
            const cs = window.getComputedStyle(el);
            if (el.children.length === 0 && el.textContent.trim().length > 0) {
                textNodes.push({
                    tag: el.tagName,
                    class: el.className,
                    text: el.textContent.trim().substring(0, 30),
                    display: cs.display,
                    visibility: cs.visibility,
                    color: cs.color,
                    opacity: cs.opacity
                });
            }
        });
        return textNodes.slice(0, 10);
    });

    console.log("Sample Text Nodes under Print:", JSON.stringify(checkResult, null, 2));

    await browser.close();
})();
