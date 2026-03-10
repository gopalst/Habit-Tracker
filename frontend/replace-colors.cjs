const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            if (dirPath.endsWith('.jsx') || dirPath.endsWith('.js') || dirPath.endsWith('.css')) {
                callback(path.join(dir, f));
            }
        }
    });
}

walkDir('src', function (f) {
    let content = fs.readFileSync(f, 'utf8');
    let newContent = content
        .replace(/#00ccff/g, 'var(--primary-color)')
        .replace(/0,\s*204,\s*255/g, 'var(--primary-rgb)')
        .replace(/linear-gradient\(135deg,\s*#00d2ff\s*0%,\s*#3a7bd5\s*100%\)/g, 'var(--primary-gradient)')
        .replace(/linear-gradient\(90deg,\s*#00d2ff,\s*#3a7bd5\)/g, 'var(--primary-gradient)')
        .replace(/#00d2ff/g, 'var(--primary-color)') // Catch any remaining #00d2ff
        .replace(/#3a7bd5/g, 'var(--primary-second-color)'); // Catch any remaining

    if (newContent !== content) {
        fs.writeFileSync(f, newContent, 'utf8');
        console.log(`Replaced colors in ${f}`);
    }
});
