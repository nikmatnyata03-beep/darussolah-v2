
// Inject Admin Dashboard toggle in footer
document.addEventListener('DOMContentLoaded', () => {
  const footers = document.querySelectorAll('.footer-bottom, .footer-note');
  footers.forEach(footer => {
    if (!footer.querySelector('.admin-edit-toggle')) {
      const link = document.createElement('a');
      link.className = 'admin-edit-toggle';
      link.href = '#';
      link.style = 'color: inherit; text-decoration: underline; margin-left: 10px; font-size: 0.9em;';
      link.textContent = 'Admin Dashboard (Edit Mode)';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const u = new URL(window.location.href);
        if (u.searchParams.get('edit') === 'true') {
          u.searchParams.delete('edit');
        } else {
          u.searchParams.set('edit', 'true');
        }
        window.location.href = u.toString();
      });
      footer.appendChild(link);
    }
  });
});

// Visual Builder Logic
if (new URLSearchParams(window.location.search).get('edit') === 'true') {
  document.addEventListener('DOMContentLoaded', () => {
    
    // Inject Editor Styles
    const style = document.createElement('style');
    style.innerHTML = `
      .editor-toolbar {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--pine-deep, #1a3c34);
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        display: flex;
        gap: 16px;
        z-index: 99999;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        font-family: system-ui, sans-serif;
        align-items: center;
      }
      .editor-btn {
        background: rgba(255,255,255,0.1);
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-weight: 600;
        transition: 0.2s;
      }
      .editor-btn:hover { background: rgba(255,255,255,0.2); }
      .editor-btn.primary { background: var(--gold, #d2a044); color: #000; }
      .editor-btn.primary:hover { background: #e3b155; }
      
      .editable-hover {
        outline: 2px dashed rgba(210, 160, 68, 0.5);
        cursor: text;
        transition: outline 0.2s;
      }
      .editable-hover:focus {
        outline: 2px solid var(--gold, #d2a044);
        background: rgba(210, 160, 68, 0.05);
      }
      
      .section-controls {
        position: absolute;
        top: 0;
        right: 0;
        background: var(--pine-deep, #1a3c34);
        padding: 4px 8px;
        display: none;
        gap: 8px;
        z-index: 100;
        border-bottom-left-radius: 8px;
      }
      section { position: relative; }
      section:hover .section-controls { display: flex; }
      .sec-btn {
        background: transparent;
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
      }
      .sec-btn:hover { background: rgba(255,255,255,0.1); }
      .sec-btn.danger { color: #ff6b6b; border-color: #ff6b6b; }
      .sec-btn.danger:hover { background: rgba(255,107,107,0.1); }
      
      .add-section-marker {
        text-align: center;
        padding: 20px;
        margin: 10px 0;
        border: 2px dashed #ccc;
        border-radius: 8px;
        cursor: pointer;
        color: #666;
        transition: 0.2s;
      }
      .add-section-marker:hover {
        border-color: var(--pine, #2b5c50);
        color: var(--pine, #2b5c50);
        background: rgba(43,92,80,0.05);
      }
    `;
    document.head.appendChild(style);

    // Create Toolbar
    const toolbar = document.createElement('div');
    toolbar.className = 'editor-toolbar';
    toolbar.innerHTML = `
      <strong>Mode Visual Builder</strong>
      <button class="editor-btn" id="addSectionBtn">+ Tambah Tata Letak (Block)</button>
      <button class="editor-btn primary" id="savePageBtn">Simpan Perubahan</button>
    `;
    document.body.appendChild(toolbar);

    // Make text editable
    const textSelectors = 'blockquote, [data-about], [data-quote], h1, h2, h3, p, .eyebrow, .unit-tag, .unit-seal, .slider-btn, .testi-quote, .testi-name, .testi-role, .bio-name, .bio-unit, .bio-text, .btn, .text-link';
    document.querySelectorAll(textSelectors).forEach(el => {
      // Don't make buttons that have complex interactions editable if it breaks them, 
      // but for simple text it's fine.
      if (!el.closest('.editor-toolbar') && !el.closest('.section-controls')) {
        
        // Use prompt for text editing
        
        
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



        el.classList.add('editable-hover');
        // Prevent default click actions on editable links/buttons
        if(el.tagName === 'A' || el.tagName === 'BUTTON') {
          el.addEventListener('click', (e) => e.preventDefault());
        }
      }
    });

    
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
               const cardImg = document.querySelector(`[data-open="bio-${bioId}"] .bio-image`);
               if (cardImg) cardImg.src = newUrl;
            }
          }
        });
        container.appendChild(btn);
      }
    });

    // Add Section Controls
    document.querySelectorAll('section').forEach(sec => {
      if (sec.id !== 'editor-tools') {
        const controls = document.createElement('div');
        controls.className = 'section-controls';
        controls.innerHTML = `
          <button class="sec-btn" onclick="moveSection(this, -1)">↑ Naik</button>
          <button class="sec-btn" onclick="moveSection(this, 1)">↓ Turun</button>
          <button class="sec-btn danger" onclick="deleteSection(this)">✕ Hapus</button>
        `;
        sec.appendChild(controls);
      }
    });

    // Global Functions for controls
    window.moveSection = (btn, dir) => {
      const sec = btn.closest('section');
      if (dir === -1 && sec.previousElementSibling && sec.previousElementSibling.tagName === 'SECTION') {
        sec.parentNode.insertBefore(sec, sec.previousElementSibling);
      } else if (dir === 1 && sec.nextElementSibling && sec.nextElementSibling.tagName === 'SECTION') {
        sec.parentNode.insertBefore(sec.nextElementSibling, sec);
      }
    };
    
    window.deleteSection = (btn) => {
      if(confirm('Yakin ingin menghapus bagian ini?')) {
        btn.closest('section').remove();
      }
    };

    // Add Section Logic
    document.getElementById('addSectionBtn').addEventListener('click', () => {
      const type = prompt("Pilih jenis tata letak (ketik angkanya):\n1. Teks Biasa\n2. Hero / Header\n3. Grid Fitur\n4. Kosong (Custom)");
      if(!type) return;
      
      const newSec = document.createElement('section');
      newSec.className = 'section';
      
      if (type === '1') {
        newSec.innerHTML = '<div class="container"><div class="section-head"><div><span class="eyebrow" contenteditable="true" class="editable-hover">Label Baru</span><h2 contenteditable="true" class="editable-hover">Judul Bagian Baru</h2></div><p contenteditable="true" class="editable-hover">Deskripsi pendek untuk bagian ini. Anda dapat mengedit teks ini secara langsung.</p></div></div>';
      } else if (type === '2') {
        newSec.className = 'hero';
        newSec.innerHTML = '<div class="container hero-grid"><div class="hero-content"><h1 class="display" contenteditable="true" class="editable-hover">Judul Utama Baru</h1><p contenteditable="true" class="editable-hover">Teks sub-judul baru.</p></div></div>';
      } else if (type === '3') {
        newSec.innerHTML = '<div class="container"><div class="experience-grid"><div class="experience-main"><article class="experience-card"><h3 contenteditable="true" class="editable-hover">Fitur 1</h3><p contenteditable="true" class="editable-hover">Deskripsi</p></article><article class="experience-card"><h3 contenteditable="true" class="editable-hover">Fitur 2</h3><p contenteditable="true" class="editable-hover">Deskripsi</p></article></div></div></div>';
      } else {
        newSec.innerHTML = '<div class="container"><h2 contenteditable="true" class="editable-hover">Bagian Baru</h2></div>';
      }
      
      const controls = document.createElement('div');
      controls.className = 'section-controls';
      controls.innerHTML = `
        <button class="sec-btn" onclick="moveSection(this, -1)">↑ Naik</button>
        <button class="sec-btn" onclick="moveSection(this, 1)">↓ Turun</button>
        <button class="sec-btn danger" onclick="deleteSection(this)">✕ Hapus</button>
      `;
      newSec.appendChild(controls);
      
      document.querySelector('main').appendChild(newSec);
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Save Logic
    document.getElementById('savePageBtn').addEventListener('click', async () => {
      const btn = document.getElementById('savePageBtn');
      btn.textContent = 'Menyimpan...';
      
      // Clone document to clean it
      const clone = document.documentElement.cloneNode(true);
      
      // Clean up injected elements
      const injectedStyle = clone.querySelector('style:last-of-type'); // Assuming ours is last
      if (injectedStyle && injectedStyle.innerHTML.includes('.editor-toolbar')) {
        injectedStyle.remove();
      }
      
      const toolbarNode = clone.querySelector('.editor-toolbar');
      if (toolbarNode) toolbarNode.remove();
      
      clone.querySelectorAll('.section-controls').forEach(el => el.remove());
            clone.querySelectorAll('.edit-img-btn').forEach(el => el.remove());
            
      
      clone.querySelectorAll('[contenteditable]').forEach(el => {
        
        el.classList.remove('editable-hover');
        if(el.classList.length === 0) el.removeAttribute('class');
      });
      
      clone.querySelectorAll('.modal').forEach(m => { m.hidden = true; });
            const finalHtml = '<!DOCTYPE html>\\n' + clone.outerHTML;
      
      try {
        const res = await fetch('/api/page/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: finalHtml, pathname: window.location.pathname })
        });
        
        if (res.ok) {
          alert('Berhasil disimpan dan dibackup otomatis!');
          btn.textContent = 'Simpan Perubahan';
        } else {
          alert('Gagal menyimpan.');
          btn.textContent = 'Simpan Perubahan';
        }
      } catch (e) {
        console.error(e);
        alert('Terjadi kesalahan jaringan.');
        btn.textContent = 'Simpan Perubahan';
      }
    });

  });
}
