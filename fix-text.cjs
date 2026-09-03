const fs = require('fs');
let code = fs.readFileSync('darussolah-institution-site.js', 'utf8');

code = code.replace(
  `const text = (selector, value) => { if (value) document.querySelectorAll(selector).forEach(el => { el.classList.remove('skeleton', 'skeleton-block'); const small = el.querySelector('small'); if (small) el.childNodes[0].nodeValue = value; else el.textContent = value; }); };`,
  `const text = (selector, value) => { 
  if (value) {
    document.querySelectorAll(selector).forEach(el => { 
      el.classList.remove('skeleton', 'skeleton-block'); 
      const small = el.querySelector('small'); 
      if (small) {
        if (el.childNodes.length > 0 && el.childNodes[0].nodeType === 3) {
          el.childNodes[0].nodeValue = value; 
        } else {
          el.insertBefore(document.createTextNode(value), small);
        }
      } else {
        el.textContent = value; 
      }
    }); 
  }
};`
);

fs.writeFileSync('darussolah-institution-site.js', code);
console.log('Fixed text function');
