const fs = require('fs');
const path = require('path');

const replacementMap = {
    // hero bg -> hero_bg.jpg
    'photo-1541888946425-d0fbb186a5b3': 'static/images/hero_bg.jpg',
    // hvac -> hvac.jpg
    'photo-1581094794329-c8112a89af12': 'static/images/hvac.jpg',
    // civil -> civil.jpg
    'photo-1486406146926-c627a92ad1ab': 'static/images/civil.jpg',
    // plumbing -> plumbing.jpg
    'photo-1581092335397-9583fe92d232': 'static/images/plumbing.jpg',
    // pump -> pump.jpg
    'photo-1581094288338-2314dddb7ece': 'static/images/pump.jpg',
};
const defaultImg = 'static/images/hero_bg.jpg';

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;
            
            // Replace unsplash URLs with local paths
            content = content.replace(/https:\/\/images\.unsplash\.com\/photo-([A-Za-z0-9\-]+)[^\"']*/g, (match, id) => {
                updated = true;
                // Since this might be in a subfolder, we need to calculate relative path
                const depth = fullPath.split(path.sep).length - 1;
                const prefix = depth > 0 ? '../'.repeat(depth) : '';
                const matchedFile = replacementMap['photo-' + id] || defaultImg;
                return prefix + matchedFile;
            });
            
            // Fix partner logos in index.html (the fake logos in Trusted Partners)
            // It might look like: <h5>MITSUBISHI</h5> or dummy logos
            // We will do a generic replacement for the logos later if we need to
            
            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDir('.');
console.log('Image paths updated to local files!');
