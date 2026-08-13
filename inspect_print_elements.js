const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto('http://127.0.0.1:8080/admin/hr.html', { waitUntil: 'networkidle0' });

    await page.emulateMediaType('print');

    const treeInfo = await page.evaluate(() => {
        let node = document.getElementById('offerTemplate');
        const chain = [];
        while (node) {
            const cs = window.getComputedStyle(node);
            chain.push({
                tag: node.tagName,
                id: node.id,
                class: node.className,
                display: cs.display,
                visibility: cs.visibility,
                height: cs.height,
                maxHeight: cs.maxHeight,
                overflow: cs.overflow,
                position: cs.position
            });
            node = node.parentElement;
        }
        return chain;
    });

    console.log("Ancestor Chain under Print Media:", JSON.stringify(treeInfo, null, 2));

    await browser.close();
})();
