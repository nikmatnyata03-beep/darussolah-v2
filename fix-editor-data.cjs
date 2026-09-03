const fs = require('fs');
let js = fs.readFileSync('editor.js', 'utf8');

// When an element is clicked and edited, remove its data attributes so hydration doesn't overwrite it
const editLogic = `
        el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const currentText = el.innerText || el.textContent;
          const newText = prompt('Edit teks:', currentText.trim());
          if (newText !== null) {
            el.textContent = newText;
            el.removeAttribute('data-about');
            el.removeAttribute('data-quote');
            el.removeAttribute('data-name');
            el.removeAttribute('data-type');
            el.classList.remove('skeleton', 'skeleton-block');
          }
        });
`;

js = js.replace(/el\.addEventListener\('click', \(e\) => \{[\s\S]*?\}\);/g, editLogic);

fs.writeFileSync('editor.js', js);
console.log('Fixed editor data removal');
