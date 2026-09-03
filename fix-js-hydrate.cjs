const fs = require('fs');
let code = fs.readFileSync('darussolah-institution-site.js', 'utf8');

// We want to remove the synchronous population and put it into a function,
// then call it appropriately to allow skeleton to show.

const syncBlockRegex = /document\.title = `\$\{site\.name\} \| Darussolah Wal Jinan`;\s*text\('\[data-name\]', site\.name\); text\('\[data-type\]', site\.type\); text\('\[data-quote\]', site\.quote\); text\('\[data-about\]', site\.about\); text\('\[data-year\]', new Date\(\)\.getFullYear\(\)\);\s*document\.querySelectorAll\('\[data-logo\]'\)\.forEach\(image => \{ image\.classList\.remove\('skeleton-img'\); image\.src = site\.logo; image\.alt = `Logo \$\{site\.name\}`; \}\);\s*site\.features\.forEach\(\(feature, index\) => \{ const card = document\.querySelectorAll\('\[data-feature\]'\)\[index\]; if \(card\) \{ card\.querySelector\('strong'\)\.textContent = feature\[0\]; card\.querySelector\('h3'\)\.textContent = feature\[1\]; \} \}\);/;

const replacementSync = `document.title = \`\${site.name} | Darussolah Wal Jinan\`;
text('[data-year]', new Date().getFullYear());

const applyFallbackDetail = () => {
  text('[data-name]', site.name); 
  text('[data-type]', site.type); 
  text('[data-quote]', site.quote); 
  text('[data-about]', site.about);
  document.querySelectorAll('[data-logo]').forEach(image => { 
    image.classList.remove('skeleton-img'); 
    image.src = site.logo; 
    image.alt = \`Logo \${site.name}\`; 
  });
  site.features.forEach((feature, index) => { 
    const card = document.querySelectorAll('[data-feature]')[index]; 
    if (card) { 
      card.querySelector('strong').textContent = feature[0]; 
      card.querySelector('h3').textContent = feature[1]; 
    } 
  });
};

const applyStaticDetail = () => {
  text('[data-quote]', site.quote); 
  text('[data-about]', site.about);
  site.features.forEach((feature, index) => { 
    const card = document.querySelectorAll('[data-feature]')[index]; 
    if (card) { 
      card.querySelector('strong').textContent = feature[0]; 
      card.querySelector('h3').textContent = feature[1]; 
    } 
  });
};`;

code = code.replace(syncBlockRegex, replacementSync);

const hydrateRegex = /const hydrate = async \(\) => \{ renderPosts\(\); if \(!apiBase\) return; mode\('Menghubungkan API\.\.\.'\); try \{ const detail = await fetchJson\(`institutions\/\$\{site\.slug\}`\); applyApiDetail\(detail\); apiReady = true; mode\('API terhubung'\); try \{ const posts = await fetchJson\(`institutions\/\$\{site\.slug\}\/posts`\); if \(posts\.items\?\.length\) renderPosts\(posts\.items\); \} catch \(error\) \{ console\.warn\('Posts API unavailable:', error\.message\); \} \} catch \(error\) \{ mode\('Mode demo · API belum tersedia'\); console\.warn\('Institution API unavailable:', error\.message\); \} \};/;

const replacementHydrate = `const hydrate = async () => { 
  if (!apiBase) {
    applyFallbackDetail();
    renderPosts();
    return;
  }
  applyStaticDetail();
  mode('Menghubungkan API...'); 
  try { 
    const detail = await fetchJson(\`institutions/\${site.slug}\`); 
    applyApiDetail(detail); 
    apiReady = true; 
    mode('API terhubung'); 
    try { 
      const posts = await fetchJson(\`institutions/\${site.slug}/posts\`); 
      if (posts.items?.length) {
        renderPosts(posts.items); 
      } else {
        renderPosts(); // fallback to static posts if empty
      }
    } catch (error) { 
      console.warn('Posts API unavailable:', error.message); 
      renderPosts();
    } 
  } catch (error) { 
    mode('Mode demo · API belum tersedia'); 
    console.warn('Institution API unavailable:', error.message); 
    applyFallbackDetail();
    renderPosts();
  } 
};`;

code = code.replace(hydrateRegex, replacementHydrate);

fs.writeFileSync('darussolah-institution-site.js', code);
console.log('Fixed JS hydration logic for skeletons');
