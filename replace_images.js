const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const imagesDir = path.join(rootDir, 'images1');

// Get all images
const images = fs.readdirSync(imagesDir).filter(f => f.endsWith('.jpg'));

function getFiles(dir, files = []) {
    const fileList = fs.readdirSync(dir);
    for (const file of fileList) {
        const name = dir + '/' + file;
        if (fs.statSync(name).isDirectory()) {
            if (!name.includes('node_modules') && !name.includes('.git') && !name.includes('images1') && !name.includes('static')) {
                getFiles(name, files);
            }
        } else {
            if (name.endsWith('.html')) {
                files.push(name);
            }
        }
    }
    return files;
}

const htmlFiles = getFiles(rootDir);

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Determine relative path to images1
    const relativeDepth = file.replace(rootDir, '').split('/').length - 2;
    const prefix = relativeDepth > 0 ? '../'.repeat(relativeDepth) : '';
    const images1Prefix = prefix + 'images1/';

    // Replace all img src that end with .jpg
    // Regex matches src="...jpg" or src='...jpg'
    content = content.replace(/src=["']([^"']*\.jpg)["']/g, (match, p1) => {
        const randomImage = images[Math.floor(Math.random() * images.length)];
        return `src="${images1Prefix}${randomImage}"`;
    });

    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
});
