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
    const textSelectors = 'h1, h2, h3, p, .eyebrow, .unit-tag, .unit-seal, .slider-btn, .testi-quote, .testi-name, .testi-role, .bio-name, .bio-unit, .bio-text, .btn, .text-link';
    document.querySelectorAll(textSelectors).forEach(el => {
      // Don't make buttons that have complex interactions editable if it breaks them, 
      // but for simple text it's fine.
      if (!el.closest('.editor-toolbar') && !el.closest('.section-controls')) {
        el.setAttribute('contenteditable', 'true');
        el.classList.add('editable-hover');
        // Prevent default click actions on editable links/buttons
        if(el.tagName === 'A' || el.tagName === 'BUTTON') {
          el.addEventListener('click', (e) => e.preventDefault());
        }
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
      
      clone.querySelectorAll('[contenteditable]').forEach(el => {
        el.removeAttribute('contenteditable');
        el.classList.remove('editable-hover');
        if(el.classList.length === 0) el.removeAttribute('class');
      });
      
      const finalHtml = '<!DOCTYPE html>\\n' + clone.outerHTML;
      
      try {
        const res = await fetch('/api/page/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: finalHtml })
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
