document.addEventListener('DOMContentLoaded', () => {
  // Add toggle to footers if not present
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

  if (new URLSearchParams(window.location.search).get('edit') === 'true') {
    // Enable click-to-prompt on text elements
    const textSelectors = 'p, h1, h2, h3, h4, span.eyebrow, blockquote, .footer-name, [data-about], [data-quote]';
    document.querySelectorAll(textSelectors).forEach(el => {
      // Avoid breaking buttons/links
      if (el.closest('button, a, .editor-toolbar')) return;
      
      el.style.outline = '2px dashed rgba(210, 160, 68, 0.5)';
      el.style.cursor = 'pointer';
      el.title = 'Klik untuk mengedit (Admin)';
      
      // Store original listener if needed, but simple click is fine
      el.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const currentText = el.innerText || el.textContent;
        const newText = prompt('Edit teks:', currentText.trim());
        if (newText !== null) {
          el.textContent = newText;
          // Note: for tenant pages, this is temporary unless they have a save backend,
          // but we can add a generic save button to save the HTML.
          showSaveButton();
        }
      });
    });
    
    function showSaveButton() {
      if (document.getElementById('simpleSaveBtn')) return;
      const btn = document.createElement('button');
      btn.id = 'simpleSaveBtn';
      btn.textContent = 'Simpan Perubahan';
      btn.style = 'position: fixed; bottom: 20px; right: 20px; z-index: 99999; padding: 10px 20px; background: #d2a044; color: #000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;';
      btn.onclick = async () => {
        btn.textContent = 'Menyimpan...';
        // Clean up outlines
        const clone = document.documentElement.cloneNode(true);
        clone.querySelectorAll('[title="Klik untuk mengedit (Admin)"]').forEach(e => {
          e.style.outline = '';
          e.style.cursor = '';
          e.removeAttribute('title');
        });
        const saveBtn = clone.querySelector('#simpleSaveBtn');
        if (saveBtn) saveBtn.remove();
        
        const path = window.location.pathname.includes('tpq') || window.location.pathname.includes('mdt') || window.location.pathname.includes('ra') || window.location.pathname.includes('rtq') ? '/api/page/save-tenant' : '/api/page/save';
        
        try {
          const res = await fetch(path, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ html: '<!DOCTYPE html>\n' + clone.outerHTML })
          });
          if (res.ok) {
            alert('Perubahan disimpan!');
            btn.textContent = 'Simpan Perubahan';
          } else {
            alert('Gagal menyimpan.');
            btn.textContent = 'Coba Lagi';
          }
        } catch (e) {
          alert('Terjadi kesalahan.');
          btn.textContent = 'Simpan Perubahan';
        }
      };
      document.body.appendChild(btn);
    }
  }
});
