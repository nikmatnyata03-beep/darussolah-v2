const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const injection = `
    <!-- Slider Biografi Guru -->
    <section class="section slider-section container-bleed" id="guru" aria-label="Biografi Guru">
      <div class="container">
        <div class="slider-header">
          <div>
            <span class="eyebrow">Asatidz dan Asatidzah</span>
            <h2>Belajar dari guru yang peduli.</h2>
          </div>
          <div class="slider-nav">
            <button class="slider-btn" type="button" aria-label="Geser ke kiri" onclick="document.getElementById('guru-track').scrollBy({left: -350, behavior: 'smooth'})">&larr;</button>
            <button class="slider-btn" type="button" aria-label="Geser ke kanan" onclick="document.getElementById('guru-track').scrollBy({left: 350, behavior: 'smooth'})">&rarr;</button>
          </div>
        </div>
        <div class="slider-track" id="guru-track">
          <!-- Item 1 -->
          <article class="slider-item bio-item">
            <div class="bio-header">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" alt="Ustadzah Nisa" class="bio-image" loading="lazy">
              <div class="bio-info">
                <strong class="bio-name">Ustadzah Nisa</strong>
                <span class="bio-unit">TPQ Darul Jinan</span>
              </div>
            </div>
            <p class="bio-text">Lulusan S1 Pendidikan Agama Islam. Sabar dan telaten dalam mendampingi tahsin santri usia dini, menciptakan suasana kelas yang menyenangkan.</p>
          </article>
          <!-- Item 2 -->
          <article class="slider-item bio-item">
            <div class="bio-header">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" alt="Ustadz Ahmad Rasyid" class="bio-image" loading="lazy">
              <div class="bio-info">
                <strong class="bio-name">Ustadz Ahmad Rasyid</strong>
                <span class="bio-unit">MDT Darussolah</span>
              </div>
            </div>
            <p class="bio-text">Berpengalaman lebih dari 6 tahun mengajar Diniyah. Pendekatan diskusinya membuat santri lebih mudah memahami dasar-dasar Fiqih dan Akhlak.</p>
          </article>
          <!-- Item 3 -->
          <article class="slider-item bio-item">
            <div class="bio-header">
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80" alt="Ustadzah Laila Fitria" class="bio-image" loading="lazy">
              <div class="bio-info">
                <strong class="bio-name">Ustadzah Laila Fitria</strong>
                <span class="bio-unit">RA Darussolah</span>
              </div>
            </div>
            <p class="bio-text">Tersertifikasi metode pengajaran anak usia dini. Sangat dekat dengan santri dan mahir memadukan nilai Islam dengan kegiatan bermain edukatif.</p>
          </article>
          <!-- Item 4 -->
          <article class="slider-item bio-item">
            <div class="bio-header">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" alt="Ustadz Fikri Hidayat" class="bio-image" loading="lazy">
              <div class="bio-info">
                <strong class="bio-name">Ustadz Fikri Hidayat</strong>
                <span class="bio-unit">RTQ Darussolah</span>
              </div>
            </div>
            <p class="bio-text">Alumni pesantren salaf dengan hafalan mutqin. Ketegasannya diimbangi dengan kehangatan saat memotivasi santri mengulang (murojaah) hafalan.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Slider Testimoni -->
    <section class="section slider-section container-bleed" id="testimoni" aria-label="Testimoni" style="background: var(--paper); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); border-radius: 0;">
      <div class="container">
        <div class="slider-header">
          <div>
            <span class="eyebrow">Kisah sukses & cerita</span>
            <h2>Apa kata keluarga santri?</h2>
          </div>
          <div class="slider-nav">
            <button class="slider-btn" type="button" aria-label="Geser ke kiri" onclick="document.getElementById('testi-track').scrollBy({left: -350, behavior: 'smooth'})">&larr;</button>
            <button class="slider-btn" type="button" aria-label="Geser ke kanan" onclick="document.getElementById('testi-track').scrollBy({left: 350, behavior: 'smooth'})">&rarr;</button>
          </div>
        </div>
        <div class="slider-track" id="testi-track">
          <!-- Item 1 -->
          <article class="slider-item">
            <p class="testi-quote">Sejak mengaji di TPQ, anak saya jadi lebih mandiri dan berani tampil. Ustadzahnya sangat telaten.</p>
            <div class="testi-author">
              <div class="testi-avatar">B</div>
              <div class="testi-author-info">
                <strong class="testi-name">Bunda Aisyah</strong>
                <span class="testi-role">Wali Santri TPQ</span>
              </div>
            </div>
          </article>
          <!-- Item 2 -->
          <article class="slider-item">
            <p class="testi-quote">Saya sangat terbantu dengan adanya portal keluarga. Bisa memantau perkembangan tahfidz tanpa harus ke pondok tiap hari.</p>
            <div class="testi-author">
              <div class="testi-avatar">A</div>
              <div class="testi-author-info">
                <strong class="testi-name">Ayah Fatih</strong>
                <span class="testi-role">Wali Santri RTQ</span>
              </div>
            </div>
          </article>
          <!-- Item 3 -->
          <article class="slider-item">
            <p class="testi-quote">Belajar di RA membuat putri kami lebih mudah bergaul dan rajin merapikan mainannya sendiri.</p>
            <div class="testi-author">
              <div class="testi-avatar">M</div>
              <div class="testi-author-info">
                <strong class="testi-name">Mama Kikan</strong>
                <span class="testi-role">Wali Santri RA</span>
              </div>
            </div>
          </article>
          <!-- Item 4 -->
          <article class="slider-item">
            <p class="testi-quote">Diniyah di sini tidak membosankan. Anak-anak diajak diskusi dan lebih paham adab harian.</p>
            <div class="testi-author">
              <div class="testi-avatar">P</div>
              <div class="testi-author-info">
                <strong class="testi-name">Pak Ridwan</strong>
                <span class="testi-role">Wali Santri MDT</span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
`;

if (!html.includes('id="guru"')) {
  // Insert before `<section class="section" id="pengalaman">`
  html = html.replace('<section class="section" id="pengalaman">', injection + '\n    <section class="section" id="pengalaman">');
  fs.writeFileSync('index.html', html);
}
