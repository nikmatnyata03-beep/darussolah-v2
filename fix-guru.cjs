const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the teacher section
const oldGuruSectionRegex = /<div class="slider-track" id="guru-track">[\s\S]*?<\/section>/;

const newGuruSection = `<div class="slider-track" id="guru-track">
          <!-- Item 1 -->
          <article class="slider-item bio-item" style="cursor:pointer;" data-open="bio-modal-1">
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
          <article class="slider-item bio-item" style="cursor:pointer;" data-open="bio-modal-2">
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
          <article class="slider-item bio-item" style="cursor:pointer;" data-open="bio-modal-3">
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
          <article class="slider-item bio-item" style="cursor:pointer;" data-open="bio-modal-4">
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
    </section>`;

html = html.replace(oldGuruSectionRegex, newGuruSection);

const modals = `
  <div class="modal" id="bio-modal-1" role="dialog" aria-modal="true" aria-labelledby="bio-title-1" hidden>
    <div class="modal-card"><button class="modal-close" type="button" data-close aria-label="Tutup">&times;</button>
      <span class="eyebrow">Profil Pengajar</span>
      <h2 id="bio-title-1">Ustadzah Nisa</h2>
      <p><strong>Pendidikan:</strong> S1 Pendidikan Agama Islam</p>
      <p><strong>Pengalaman Mengajar:</strong> 4 Tahun mengajar Tahsin dan Tahfidz Anak Usia Dini.</p>
      <p><strong>Biografi Singkat:</strong> Sabar dan telaten dalam mendampingi tahsin santri usia dini, selalu berusaha menciptakan suasana kelas yang riang agar santri betah dan semangat datang ke TPQ.</p>
    </div>
  </div>
  <div class="modal" id="bio-modal-2" role="dialog" aria-modal="true" aria-labelledby="bio-title-2" hidden>
    <div class="modal-card"><button class="modal-close" type="button" data-close aria-label="Tutup">&times;</button>
      <span class="eyebrow">Profil Pengajar</span>
      <h2 id="bio-title-2">Ustadz Ahmad Rasyid</h2>
      <p><strong>Pendidikan:</strong> Ma'had Aly, Konsentrasi Fiqih</p>
      <p><strong>Pengalaman Mengajar:</strong> Lebih dari 6 tahun mengajar Diniyah.</p>
      <p><strong>Biografi Singkat:</strong> Pendekatan diskusinya membuat santri lebih mudah memahami dasar-dasar Fiqih dan Akhlak. Beliau sering mengaitkan materi dengan kejadian sehari-hari.</p>
    </div>
  </div>
  <div class="modal" id="bio-modal-3" role="dialog" aria-modal="true" aria-labelledby="bio-title-3" hidden>
    <div class="modal-card"><button class="modal-close" type="button" data-close aria-label="Tutup">&times;</button>
      <span class="eyebrow">Profil Pengajar</span>
      <h2 id="bio-title-3">Ustadzah Laila Fitria</h2>
      <p><strong>Pendidikan:</strong> S1 PAUD (Tersertifikasi metode pengajaran anak usia dini)</p>
      <p><strong>Pengalaman Mengajar:</strong> 5 Tahun sebagai guru RA.</p>
      <p><strong>Biografi Singkat:</strong> Sangat dekat dengan santri dan mahir memadukan nilai Islam dengan kegiatan bermain edukatif. Kelasnya selalu dipenuhi kreasi tangan anak-anak.</p>
    </div>
  </div>
  <div class="modal" id="bio-modal-4" role="dialog" aria-modal="true" aria-labelledby="bio-title-4" hidden>
    <div class="modal-card"><button class="modal-close" type="button" data-close aria-label="Tutup">&times;</button>
      <span class="eyebrow">Profil Pengajar</span>
      <h2 id="bio-title-4">Ustadz Fikri Hidayat</h2>
      <p><strong>Pendidikan:</strong> Alumni Pesantren Salaf</p>
      <p><strong>Pengalaman Mengajar:</strong> 3 Tahun membimbing halaqah RTQ.</p>
      <p><strong>Biografi Singkat:</strong> Memiliki hafalan mutqin. Ketegasannya diimbangi dengan kehangatan saat memotivasi santri mengulang (murojaah) hafalan, melahirkan banyak hafizh muda.</p>
    </div>
  </div>
`;

html = html.replace('</main>', '</main>\n\n' + modals);

fs.writeFileSync('index.html', html);
console.log('Done modifying index.html');
