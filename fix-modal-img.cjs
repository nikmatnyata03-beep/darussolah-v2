const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const modals = [
  { id: 1, name: 'Ustadzah Nisa', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
  { id: 2, name: 'Ustadz Ahmad Rasyid', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' },
  { id: 3, name: 'Ustadzah Laila Fitria', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
  { id: 4, name: 'Ustadz Fikri Hidayat', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' }
];

modals.forEach(m => {
  const oldEyebrow = `<span class="eyebrow">Profil Pengajar</span>      <h2 id="bio-title-${m.id}">${m.name}</h2>`;
  const replace = `<div class="modal-bio-header" style="display:flex; align-items:center; gap:20px; margin-bottom:20px;">
        <div style="position:relative; display:inline-block;" class="modal-img-container">
          <img src="${m.img}" alt="${m.name}" id="modal-img-${m.id}" class="bio-image" style="width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid var(--pine-light, #3c7d6c);">
        </div>
        <div>
          <span class="eyebrow" style="margin-bottom:4px;">Profil Pengajar</span>
          <h2 id="bio-title-${m.id}" style="margin:0;">${m.name}</h2>
        </div>
      </div>`;
  // Deal with spaces in original HTML string by using regex
  const regex = new RegExp(`<span class="eyebrow">Profil Pengajar<\\/span>\\s*<h2 id="bio-title-${m.id}">${m.name}<\\/h2>`);
  html = html.replace(regex, replace);
});

fs.writeFileSync('index.html', html);
console.log('Added images to modals');
