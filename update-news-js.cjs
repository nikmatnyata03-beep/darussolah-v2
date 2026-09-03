const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const targetFunctionStr = `    const loadPublicData = async () => {
      if (!apiBase) return;
      try {
        const [foundationResponse, institutionsResponse] = await Promise.all([
          fetch(publicUrl('foundation')),
          fetch(publicUrl('institutions'))
        ]);`;

const replaceFunctionStr = `    const loadPublicData = async () => {
      if (!apiBase) return;
      try {
        const [foundationResponse, institutionsResponse, postsResponse] = await Promise.all([
          fetch(publicUrl('foundation')),
          fetch(publicUrl('institutions')),
          fetch(publicUrl('posts'))
        ]);`;

code = code.replace(targetFunctionStr, replaceFunctionStr);

const appendTarget = `if (foundation.description) document.querySelector('.about-copy > p').textContent = foundation.description;`;
const appendCode = `if (foundation.description) document.querySelector('.about-copy > p').textContent = foundation.description;

        const postsData = (await postsResponse.json()).items || [];
        if (postsData.length > 0) {
          const newsGrid = document.querySelector('.news-grid');
          if (newsGrid) {
            // First item is the feature
            const feature = postsData[0];
            const others = postsData.slice(1, 4);
            
            let html = '';
            
            // Feature article
            html += \`<article class="news-feature">
              <div class="news-image"><img src="https://images.unsplash.com/photo-1649030839339-3d117544fcb4?auto=format&fit=crop&w=1000&q=85" alt="\${feature.title}" loading="lazy"></div>
              <div class="news-body">
                <span class="news-meta">\${feature.post_type} &middot; \${feature.institution_name}</span>
                <h3>\${feature.title}</h3>
                <p>\${feature.excerpt || ''}</p>
                <a class="text-link" href="\${feature.institution_slug ? '/' + feature.institution_slug + '/' : '#'}">Selengkapnya <span class="arrow">&#8594;</span></a>
              </div>
            </article>\`;
            
            if (others.length > 0) {
              html += '<div class="news-list">';
              others.forEach((post, i) => {
                const img = [
                  'https://images.unsplash.com/photo-1720604568178-444a03bf4cdf?auto=format&fit=crop&w=500&q=85',
                  'https://images.unsplash.com/photo-1646450820480-9545d263e9e6?auto=format&fit=crop&w=500&q=85',
                  'https://plus.unsplash.com/premium_photo-1661382504923-8085addc989c?auto=format&fit=crop&w=500&q=85'
                ][i % 3];
                
                html += \`
                <article class="news-item">
                  <figure><img src="\${img}" alt="\${post.title}" loading="lazy"></figure>
                  <div>
                    <span class="news-meta">\${post.institution_name}</span>
                    <a href="\${post.institution_slug ? '/' + post.institution_slug + '/' : '#'}" style="text-decoration:none; color:inherit;">
                      <h3>\${post.title}</h3>
                    </a>
                    <p>\${post.excerpt || ''}</p>
                  </div>
                </article>\`;
              });
              html += '</div>';
            }
            
            newsGrid.innerHTML = html;
          }
        }`;

code = code.replace(appendTarget, appendCode);

fs.writeFileSync('index.html', code);
console.log('Updated index.html to fetch and render posts');
