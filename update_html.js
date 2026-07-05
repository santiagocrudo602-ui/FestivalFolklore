const fs = require('fs');
const path = require('path');

const files = [
    'index.html',
    'views/noches.html',
    'views/noche_detalle.html',
    'views/butacas.html',
    'views/login.html',
    'views/registro.html'
];

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    
    const depth = file === 'index.html' ? '' : '../';
    
    // CSS paths
    content = content.replace(/href="\/css\//g, `href="${depth}public/css/`);
    
    // Navigation routes
    content = content.replace(/href="\/login"/g, `href="${depth}views/login.html"`);
    content = content.replace(/href="\/registro"/g, `href="${depth}views/registro.html"`);
    content = content.replace(/href="\/noches"/g, `href="${depth}views/noches.html"`);
    content = content.replace(/href="\/butacas"/g, `href="${depth}views/butacas.html"`);
    content = content.replace(/href="\/"/g, `href="${depth === '' ? 'index.html' : '../index.html'}"`);

    // Script injection
    const scriptsToInject = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js"></script>
    <script src="${depth}public/js/db_browser.js"></script>
    <script src="${depth}public/js/main.js"></script>
    `;
    
    content = content.replace(/<script src="\/js\/main\.js"><\/script>/g, scriptsToInject.trim());
    
    fs.writeFileSync(filePath, content);
});
console.log("HTML files updated for static GitHub Pages.");
