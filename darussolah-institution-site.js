const TENANT = 'darussolah';
const SITES = {
  tpq: {name:'TPQ Darul Jinan', slug:'tpq', type:'Taman Pendidikan Al-Quran', logo:'/darussolah-assets/TPQ darul jinan.jpeg', quote:'Membaca, menghafal, dan mencintai Al-Quran setiap hari.', about:'TPQ Darul Jinan menjadi ruang belajar Al-Quran yang dekat dengan keluarga, dengan pembiasaan adab dan pendampingan yang bertahap.', features:[['Program','Tahsin dan tahfidz'],['Kegiatan','Setoran dan murojaah'],['Ruang tumbuh','Santri dan keluarga']], posts:[['Kegiatan','Setoran hafalan pekanan','Jadwal setoran dan murojaah tersedia untuk setiap kelompok santri.'],['Pengumuman','Pembagian kelompok belajar','Informasi kelas akan dibagikan melalui portal santri dan wali.'],['Tips wali','Mendampingi murojaah di rumah','Rutinitas singkat yang konsisten membantu hafalan bertumbuh.']]},
  mdt: {name:'MDT Darussolah', slug:'mdt', type:'Madrasah Diniyah Takmiliyah', logo:'/darussolah-assets/majelis darussolah.jpeg', quote:'Membentuk pemahaman agama yang kokoh dan beradab.', about:'MDT Darussolah menyiapkan ruang pendidikan agama yang terstruktur untuk melengkapi pembelajaran santri bersama keluarga dan masyarakat.', features:[['Program','Diniyah takmiliyah'],['Kegiatan','Kajian dan evaluasi'],['Catatan','Logo lembaga menunggu konfirmasi']], posts:[['Kegiatan','Jadwal kajian semester','Jadwal pembelajaran dan evaluasi akan tersusun di microsite ini.'],['Pengumuman','Rapat wali santri','Informasi kegiatan wali dan lembaga dibagikan melalui portal.'],['Kelas','Belajar agama dengan tertib','Materi, tugas, dan pengumuman kelas berada dalam satu ruang.']]},
  ra: {name:'RA Darussolah', slug:'ra', type:'Raudhatul Athfal', logo:'/darussolah-assets/RA darussolah.jpeg', quote:'Tumbuh ceria, belajar dengan adab, dan siap melangkah.', about:'RA Darussolah mendampingi anak usia dini melalui pengalaman belajar yang ceria, aman, dan dekat dengan nilai adab.', features:[['Pendekatan','Belajar melalui bermain'],['Keluarga','Komunikasi wali dan guru'],['Tumbuh','Kemandirian dan adab']], posts:[['Kegiatan','Belajar melalui bermain','Agenda kelas dirancang untuk membuat anak aktif, aman, dan bahagia.'],['Keluarga','Rutinitas baik di rumah','Wali mendapat ide sederhana untuk melanjutkan pembiasaan di rumah.'],['Pengumuman','Agenda kelas pekan ini','Informasi kegiatan dan kebutuhan kelas tersedia bagi wali.']]},
  rtq: {name:'RTQ Darussolah', slug:'rtq', type:'Rumah Tahfidz Al-Quran', logo:'/darussolah-assets/RTQ darussolah.jpeg', quote:'Menjaga hafalan dengan talaqqi, setoran, dan murojaah.', about:'RTQ Darussolah menjadi rumah tahfidz yang membantu santri membangun target hafalan dengan ritme yang terukur dan dukungan guru.', features:[['Program','Tahfidz dan talaqqi'],['Kegiatan','Setoran dan murojaah'],['Pantauan','Progres santri bertahap']], posts:[['Kegiatan','Target hafalan semester','Target hafalan disusun sesuai kemampuan dan kelompok belajar santri.'],['Pengumuman','Rekap setoran','Guru dapat memperbarui progres melalui portal yang terhubung.'],['Tips santri','Menjaga hafalan tetap kuat','Murojaah singkat setiap hari lebih baik daripada menunggu waktu luang.']]}
};
let detectedSubdomain = null;
const hostParts = window.location.hostname.split('.');
if (hostParts.length > 0) {
  const sub = hostParts[0].toLowerCase();
  if (['tpq', 'mdt', 'ra', 'rtq'].includes(sub)) {
    detectedSubdomain = sub;
  }
}
const code = detectedSubdomain || document.body.dataset.institution || document.querySelector('meta[name="darussolah-tenant-slug"]')?.content;
const site = SITES[code] || { name: 'Lembaga', type: 'Pendidikan', slug: code, logo: '', quote: '', about: '', features: [], posts: [] };
const apiBase = String(window.DARUSSOLAH_CONFIG?.apiBase || '').replace(/\/+$/, '');
let institutionId = null;
let apiReady = false;
const $ = selector => document.querySelector(selector);
const toast = message => { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3200); };
const mode = message => { $('#site-mode').textContent = message; };
const text = (selector, value) => { 
  if (value) {
    document.querySelectorAll(selector).forEach(el => { 
      el.classList.remove('skeleton', 'skeleton-block'); 
      const small = el.querySelector('small'); 
      if (small) {
        if (el.childNodes.length > 0 && el.childNodes[0].nodeType === 3) {
          el.childNodes[0].nodeValue = value; 
        } else {
          el.insertBefore(document.createTextNode(value), small);
        }
      } else {
        el.textContent = value; 
      }
    }); 
  }
};

if (!code) console.warn('No institution code provided');
document.querySelectorAll('section#posts').forEach(section => { section.id = 'kegiatan'; });
const primaryPosts = $('#posts-list'); if (primaryPosts) { document.querySelectorAll('#posts').forEach(list => list.remove()); primaryPosts.id = 'posts'; }
document.title = `${site.name} | Darussolah Wal Jinan`;
text('[data-year]', new Date().getFullYear());

const applyFallbackDetail = () => {
  text('[data-name]', site.name); 
  text('[data-type]', site.type); 
  text('[data-quote]', site.quote); 
  text('[data-about]', site.about);
  document.querySelectorAll('[data-logo]').forEach(image => { 
    image.classList.remove('skeleton-img'); 
    image.src = site.logo; 
    image.alt = `Logo ${site.name}`; 
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
};

const renderPosts = posts => { const list = $('#posts'); list.replaceChildren(); const rows = posts?.length ? posts : site.posts.map(post => ({post_type:post[0], title:post[1], excerpt:post[2]})); rows.slice(0, 6).forEach(post => { const article = document.createElement('article'); article.className = 'post'; const kind = document.createElement('b'); kind.textContent = post.post_type || 'Kegiatan'; const title = document.createElement('h3'); title.textContent = post.title || 'Kabar lembaga'; const excerpt = document.createElement('p'); excerpt.textContent = post.excerpt || post.body || 'Informasi lembaga Darussolah.'; const date = document.createElement('small'); date.textContent = post.published_at ? new Date(post.published_at).toLocaleDateString('id-ID') : 'Informasi contoh'; article.append(kind, title, excerpt, date); list.append(article); }); };
const fetchJson = async path => { 
  const url = `${apiBase}/v1/public/${TENANT}/${path}`;
  console.log("Fetching API:", url);
  const response = await fetch(url); 
  if (!response.ok) throw new Error(`HTTP ${response.status}`); 
  const data = await response.json();
  console.log("API Response [" + path + "]:", data);
  return data;
};
const applyApiDetail = detail => { institutionId = detail.id; text('[data-name]', detail.name); text('[data-type]', detail.description); if (detail.logo_url) document.querySelectorAll('[data-logo]').forEach(image => { image.classList.remove('skeleton-img'); image.src = detail.logo_url; }); };
const hydrate = async () => { 
  console.log("Hydrating API with base:", apiBase || "relative");
  applyStaticDetail();
  mode('Menghubungkan API...'); 
  try { 
    const detail = await fetchJson(`institutions/${site.slug}`); 
    applyApiDetail(detail); 
    apiReady = true; 
    mode('API terhubung'); 
    try { 
      const posts = await fetchJson(`institutions/${site.slug}/posts`); 
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
};

document.querySelectorAll('[data-scroll]').forEach(button => button.addEventListener('click', () => $(`#${button.dataset.scroll}`).scrollIntoView({behavior:'smooth'})));
const regForm = $('#registration');
if (regForm) regForm.addEventListener('submit', async event => { event.preventDefault(); const form = event.target; const type = form.querySelector('[name="registration_type"]').value; const name = form.querySelector('[name="student_full_name"]').value; const phone = form.querySelector('[name="father_phone"]').value; if (apiReady) { const payload = {institution_id:institutionId, registration_type:type, academic_year:`${new Date().getFullYear()}/${new Date().getFullYear()+1}`, student_full_name:name, father_phone:phone}; try { const response = await fetch(`${apiBase}/v1/public/${TENANT}/registrations`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)}); if (!response.ok) throw new Error(`HTTP ${response.status}`); const result = await response.json(); toast(`Pendaftaran terkirim. Nomor: ${result.application_no}`); form.reset(); } catch (error) { toast('Pendaftaran belum terkirim. Periksa koneksi API.'); console.warn('Registration API unavailable:', error.message); } return; } toast('Pendaftaran belum terkirim. Layanan pendaftaran belum aktif. Silakan hubungi admin.'); });
const logForm = $('#login');
if (logForm) logForm.addEventListener('submit', event => { event.preventDefault(); toast('Login masih demo. Supabase Auth dihubungkan saat deployment.'); });
hydrate();
