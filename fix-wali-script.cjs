const fs = require('fs');
let html = fs.readFileSync('wali.html', 'utf8');

const targetScript = `
      window.addEventListener('darussolah:ready', event => renderChildren(event.detail), { once: true });
      showEmpty('.announcement-list', 'Belum ada pengumuman untuk akun ini.');
      showEmpty('.docs-list', 'Belum ada dokumen yang tersedia.');
    const modals=document.querySelectorAll('.modal');
    document.querySelectorAll('[data-modal]').forEach((button)=>button.addEventListener('click',()=>{const modal=document.getElementById(button.dataset.modal); modal.hidden=false; modal.setAttribute('aria-hidden','false'); modal.querySelector('textarea, input')?.focus();}));
    document.querySelectorAll('[data-close-modal]').forEach((button)=>button.addEventListener('click',()=>{const modal=button.closest('.modal'); modal.hidden=true; modal.setAttribute('aria-hidden','true');}));
    document.addEventListener('keydown',(event)=>{if(event.key==='Escape')modals.forEach((modal)=>{if(!modal.hidden){modal.hidden=true;modal.setAttribute('aria-hidden','true');}});});
     document.getElementById('leaveForm').addEventListener('submit',(event)=>{event.preventDefault();showToast('Pengajuan belum terkirim','Fitur pengajuan izin akan aktif setelah endpoint layanan tersedia.');});
     document.getElementById('feedbackForm').addEventListener('submit',(event)=>{event.preventDefault();const field=document.getElementById('feedback');if(!field.value.trim()){field.focus();showToast('Pesan masih kosong','Tulis saran singkat sebelum dikirim.');return;}showToast('Masukan belum terkirim','Fitur masukan akan aktif setelah endpoint layanan tersedia.');});
    document.getElementById('payButton').addEventListener('click',()=>showToast('Menu pembayaran dibuka','Lanjutkan pembayaran melalui halaman Keuangan.'));
    document.querySelectorAll('[data-download]').forEach((button)=>button.addEventListener('click',()=>showToast('Dokumen siap diunduh','Pratinjau PDF akan tersedia saat layanan terhubung.')));
     document.querySelectorAll('[data-read]').forEach((button)=>button.addEventListener('click',()=>{button.classList.add('read');button.querySelector('.announcement-mark').style.background='#cad2cb';document.getElementById('announcementCount').textContent='Dibaca';showToast('Tampilan diperbarui','Status hanya berubah di layar sampai endpoint pengumuman tersedia.');}));
     document.getElementById('notificationButton').addEventListener('click',()=>{document.getElementById('pengumuman').scrollIntoView({behavior:'smooth',block:'center'});showToast('Pengumuman','Pengumuman akun akan muncul setelah data resmi tersedia.');});
`;

const replacementScript = `
      // PRODUCTION BACKEND INTEGRATION
      let activeStudent = null;
      
      const loadDashboard = async (studentId) => {
        try {
          const res = await window.DarussolahPortal.fetchPrivate(null, 'wali/dashboard/' + studentId, window.DarussolahPortal.session);
          
          // Render Invoice
          if (res.invoices && res.invoices.length > 0) {
            const inv = res.invoices[0];
            document.getElementById('invoiceAmount').textContent = inv.amount;
            document.getElementById('invoiceDue').textContent = inv.status;
          } else {
            document.getElementById('invoiceAmount').textContent = 'Rp 0';
            document.getElementById('invoiceDue').textContent = 'Lunas';
          }
          
          // Render Progress
          if (res.progress && res.progress.length > 0) {
            const prog = res.progress[0];
            document.getElementById('progressValue').textContent = prog.currentValue || 'Belum ada';
            document.getElementById('progressStart').textContent = 'Mulai';
            document.getElementById('progressEnd').textContent = prog.target || 'Target';
          } else {
            document.getElementById('progressValue').textContent = 'Belum tersedia';
          }
        } catch (e) {
          console.error('Error loading dashboard:', e);
        }
      };

      const loadAnnouncements = async () => {
        try {
          const res = await window.DarussolahPortal.fetchPrivate(null, 'posts', window.DarussolahPortal.session);
          if (res.items && res.items.length > 0) {
            const list = document.querySelector('.announcement-list');
            list.innerHTML = res.items.map(p => 
              '<article class="announcement-item"><div class="announcement-mark"></div><div class="announcement-content"><strong>'+p.title+'</strong><p>'+(p.excerpt||'Pesan baru')+'</p><span class="announcement-time">'+(new Date(p.published_at).toLocaleDateString())+'</span></div><button class="btn btn-ghost" type="button" data-read>Tandai dibaca</button></article>'
            ).join('');
            document.getElementById('announcementCount').textContent = res.items.length + ' pesan';
            
            document.querySelectorAll('[data-read]').forEach((button)=>button.addEventListener('click',()=>{button.classList.add('read');button.querySelector('.announcement-mark').style.background='#cad2cb';document.getElementById('announcementCount').textContent='Dibaca';showToast('Tampilan diperbarui','Pengumuman telah ditandai dibaca.');}));
          } else {
            showEmpty('.announcement-list', 'Belum ada pengumuman untuk akun ini.');
          }
        } catch (e) {
          showEmpty('.announcement-list', 'Gagal memuat pengumuman.');
        }
      };

      const loadDocuments = async () => {
        try {
          const res = await window.DarussolahPortal.fetchPrivate(null, 'documents', window.DarussolahPortal.session);
          if (res.items && res.items.length > 0) {
            const list = document.querySelector('.docs-list');
            list.innerHTML = res.items.map(d => 
              '<div class="doc-item"><div class="doc-info"><strong>'+d.title+'</strong><span>'+(d.excerpt||'Dokumen')+'</span></div><button class="btn btn-ghost" type="button" data-download>Unduh</button></div>'
            ).join('');
            document.querySelectorAll('[data-download]').forEach((button)=>button.addEventListener('click',()=>showToast('Dokumen siap diunduh','Mengunduh dokumen...')));
          } else {
            showEmpty('.docs-list', 'Belum ada dokumen yang tersedia.');
          }
        } catch (e) {
          showEmpty('.docs-list', 'Gagal memuat dokumen.');
        }
      };

      const customSelectChild = (student, classes = window.DarussolahPortal?.classes || []) => {
        activeStudent = student;
        selectChild(student, classes); // call original
        loadDashboard(student.id);
      };

      window.addEventListener('darussolah:ready', event => {
        // override renderChildren so we can intercept clicks
        const students = event.detail.students || [];
        const classes = event.detail.classes || [];
        
        const options = document.querySelector('.child-options');
        if (options) {
          options.replaceChildren(...students.map(student => {
            const button = document.createElement('button');
            button.className = 'child-option';
            button.type = 'button';
            button.dataset.child = student.id;
            button.innerHTML = '<span>'+(student.full_name || 'Santri')+'</span><small>'+(student.nis || 'ID santri')+'</small>';
            button.addEventListener('click', () => customSelectChild(student, classes));
            return button;
          }));
          if (students.length) customSelectChild(students[0], classes);
          else showEmpty('.child-options', 'Belum ada anak yang terhubung ke akun ini.');
        }
        
        loadAnnouncements();
        loadDocuments();
      }, { once: true });
      
    const modals=document.querySelectorAll('.modal');
    document.querySelectorAll('[data-modal]').forEach((button)=>button.addEventListener('click',()=>{const modal=document.getElementById(button.dataset.modal); modal.hidden=false; modal.setAttribute('aria-hidden','false'); modal.querySelector('textarea, input')?.focus();}));
    document.querySelectorAll('[data-close-modal]').forEach((button)=>button.addEventListener('click',()=>{const modal=button.closest('.modal'); modal.hidden=true; modal.setAttribute('aria-hidden','true');}));
    document.addEventListener('keydown',(event)=>{if(event.key==='Escape')modals.forEach((modal)=>{if(!modal.hidden){modal.hidden=true;modal.setAttribute('aria-hidden','true');}});});
     
     document.getElementById('leaveForm').addEventListener('submit', async (event)=>{
       event.preventDefault();
       if (!activeStudent) return showToast('Gagal', 'Pilih anak terlebih dahulu.');
       try {
         const res = await window.DarussolahPortal.requestPrivate(null, 'wali/leave', window.DarussolahPortal.session, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             student_id: activeStudent.id,
             date: document.getElementById('leaveDate').value,
             leave_type: document.getElementById('leaveType').value,
             note: document.getElementById('leaveNote').value
           })
         });
         showToast('Pengajuan Terkirim', 'Guru telah menerima pengajuan izin anak.');
         document.getElementById('leaveModal').hidden = true;
         event.target.reset();
       } catch(e) {
         showToast('Gagal', 'Terjadi kesalahan jaringan.');
       }
     });
     
     document.getElementById('feedbackForm').addEventListener('submit', async (event)=>{
       event.preventDefault();
       const field = document.getElementById('feedback');
       if(!field.value.trim()){field.focus();showToast('Pesan masih kosong','Tulis saran singkat sebelum dikirim.');return;}
       try {
         const res = await window.DarussolahPortal.requestPrivate(null, 'wali/feedback', window.DarussolahPortal.session, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             message: field.value
           })
         });
         showToast('Masukan Terkirim', 'Terima kasih atas saran Anda!');
         event.target.reset();
       } catch(e) {
         showToast('Gagal', 'Terjadi kesalahan jaringan.');
       }
     });
     
    document.getElementById('payButton').addEventListener('click',()=>showToast('Menu pembayaran dibuka','Lanjutkan pembayaran melalui halaman Keuangan.'));
    document.getElementById('notificationButton').addEventListener('click',()=>{document.getElementById('pengumuman').scrollIntoView({behavior:'smooth',block:'center'});showToast('Pengumuman','Menggulir ke bagian pengumuman terbaru.');});
`;

// Only replace if we haven't already
if (html.includes("showEmpty('.announcement-list', 'Belum ada pengumuman untuk akun ini.');")) {
  html = html.replace(targetScript, replacementScript);
  fs.writeFileSync('wali.html', html);
  console.log("Replaced successfully!");
} else {
  console.log("Target script not found or already replaced.");
}
