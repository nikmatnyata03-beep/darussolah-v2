const fs = require('fs');
let js = fs.readFileSync('editor.js', 'utf8');

const editLogic = `
        el.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentText = el.innerText || el.textContent;
          const newText = prompt('Edit teks:', currentText.trim());
          if (newText !== null && newText !== currentText) {
            el.textContent = newText;
            
            // Check if it's a tenant specific field
            let key = null;
            if (el.hasAttribute('data-about')) key = 'about';
            if (el.hasAttribute('data-quote')) key = 'quote';
            
            const tenantSlug = document.body.dataset.institution;
            
            if (key && tenantSlug && tenantSlug !== 'REPLACE_TENANT') {
              try {
                const res = await fetch('/api/tenant/save-content', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tenant_slug: tenantSlug, key: key, value: newText })
                });
                if (!res.ok) alert('Gagal menyimpan konten spesifik lembaga.');
              } catch (err) {
                console.error(err);
              }
            }
          }
        });
`;

js = js.replace(/el\.addEventListener\('click', async \(e\) => \{[\s\S]*?\}\);/g, editLogic);
// Also replace the old prompt logic that was not async
js = js.replace(/el\.addEventListener\('click', \(e\) => \{[\s\S]*?\}\);/g, editLogic);

fs.writeFileSync('editor.js', js);
console.log('Fixed editor to save tenant data');
