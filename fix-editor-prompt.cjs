const fs = require('fs');
let js = fs.readFileSync('editor.js', 'utf8');

// Replace contenteditable with prompt
js = js.replace(/el\.setAttribute\('contenteditable', 'true'\);/g, `
        // Use prompt for text editing
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentText = el.innerText || el.textContent;
          const newText = prompt('Edit teks:', currentText.trim());
          if (newText !== null) {
            el.textContent = newText;
          }
        });
`);
js = js.replace(/el\.removeAttribute\('contenteditable'\);/g, '');

fs.writeFileSync('editor.js', js);
console.log('Updated editor.js to use prompt');
