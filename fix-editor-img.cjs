const fs = require('fs');
let js = fs.readFileSync('editor.js', 'utf8');

// Inject the button creation logic just before "// Add Section Controls"
const injectionPoint = "// Add Section Controls";
const imgLogic = `
    // Add Image Editing Controls
    document.querySelectorAll('.modal-img-container').forEach(container => {
      if (!container.querySelector('.edit-img-btn')) {
        const btn = document.createElement('button');
        btn.className = 'editor-btn edit-img-btn';
        btn.innerHTML = '✎ Ubah Foto';
        btn.style.position = 'absolute';
        btn.style.bottom = '-10px';
        btn.style.left = '50%';
        btn.style.transform = 'translateX(-50%)';
        btn.style.padding = '4px 8px';
        btn.style.fontSize = '10px';
        btn.style.whiteSpace = 'nowrap';
        btn.style.zIndex = '10';
        
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const img = container.querySelector('img');
          const newUrl = prompt('Masukkan URL gambar baru (Anda dapat menyalin link gambar (Image Address) dari web):', img.src);
          if (newUrl) {
            img.src = newUrl;
            // Sinkronkan juga gambar di kartu luar
            if (img.id && img.id.startsWith('modal-img-')) {
               const bioId = img.id.replace('modal-img-', '');
               const cardImg = document.querySelector(\`[data-open="bio-\${bioId}"] .bio-image\`);
               if (cardImg) cardImg.src = newUrl;
            }
          }
        });
        container.appendChild(btn);
      }
    });

    `;
if (!js.includes('.edit-img-btn')) {
  js = js.replace(injectionPoint, imgLogic + injectionPoint);
  
  // Also clean up before saving
  const savePoint = "clone.querySelectorAll('.section-controls').forEach(el => el.remove());";
  const saveLogic = "clone.querySelectorAll('.edit-img-btn').forEach(el => el.remove());\n            ";
  js = js.replace(savePoint, savePoint + '\n            ' + saveLogic);
  
  fs.writeFileSync('editor.js', js);
}
console.log('Added image edit support to editor.js');
