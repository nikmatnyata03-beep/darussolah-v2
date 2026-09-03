const fs = require('fs');
let code = fs.readFileSync('darussolah-institution-site.js', 'utf8');

// fix text setter
code = code.replace(
  /const text = \(selector, value\) => \{ if \(value\) document\.querySelectorAll\(selector\)\.forEach\(el => \{ const small = el\.querySelector\('small'\); if \(small\) el\.childNodes\[0\]\.nodeValue = value; else el\.textContent = value; \}\); \};/,
  "const text = (selector, value) => { if (value) document.querySelectorAll(selector).forEach(el => { el.classList.remove('skeleton', 'skeleton-block'); const small = el.querySelector('small'); if (small) el.childNodes[0].nodeValue = value; else el.textContent = value; }); };"
);

// fix image setter
code = code.replace(
  /document\.querySelectorAll\('\[data-logo\]'\)\.forEach\(image => \{ image\.src = site\.logo; image\.alt = `Logo \$\{site\.name\}`; \}\);/,
  "document.querySelectorAll('[data-logo]').forEach(image => { image.classList.remove('skeleton-img'); image.src = site.logo; image.alt = `Logo ${site.name}`; });"
);

// fix image setter in applyApiDetail
code = code.replace(
  /if \(detail\.logo_url\) document\.querySelectorAll\('\[data-logo\]'\)\.forEach\(image => \{ image\.src = detail\.logo_url; \}\);/,
  "if (detail.logo_url) document.querySelectorAll('[data-logo]').forEach(image => { image.classList.remove('skeleton-img'); image.src = detail.logo_url; });"
);

// For posts, let's also remove any initial skeleton posts if we had them.
// We just replaceChildren, so it's fine.

fs.writeFileSync('darussolah-institution-site.js', code);
console.log('Fixed JS for skeletons');
