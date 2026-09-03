const fs = require('fs');
let code = fs.readFileSync('tenant-landing.html', 'utf8');

const skeletonPosts = `<article class="post">
  <b class="skeleton">Kegiatan</b>
  <h3 class="skeleton-block" style="height:28px; margin: 10px 0 5px;">Judul Kegiatan</h3>
  <p class="skeleton-block" style="height:60px;">Deskripsi singkat tentang kegiatan.</p>
  <small class="skeleton" style="margin-top:13px; display:inline-block;">12 Jan 2026</small>
</article>`;

code = code.replace(
  /<div class="post-grid" id="posts-list"><\/div>/,
  `<div class="post-grid" id="posts-list">\n${skeletonPosts}\n${skeletonPosts}\n${skeletonPosts}\n</div>`
);

fs.writeFileSync('tenant-landing.html', code);
console.log('Added skeleton posts');
