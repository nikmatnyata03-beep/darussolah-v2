const fs = require('fs');
let code = fs.readFileSync('kepegawaian.html', 'utf8');

const regex = /<script>[\s\S]*?<\/script>/;

const newScript = `<script>
    let staffFilter='all'; let toastTimer; const toast=document.getElementById('toast');
    document.querySelectorAll('.help-link[href="#bantuan"]').forEach(link=>link.href='index.html#faq');
    function showToast(title,text){
        document.getElementById('toastTitle').textContent=title;
        document.getElementById('toastText').textContent=text;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer=setTimeout(()=>toast.classList.remove('show'),3200);
    }
    function setModal(id,open){
        const modal=document.getElementById(id);
        modal.hidden=!open;
        modal.setAttribute('aria-hidden',String(!open));
        if(open)modal.querySelector('input,textarea')?.focus();
    }
    function escapeHTML(value){
        return (value||'').toString().replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
    function refreshStaff(){
        const query=document.getElementById('staffSearch').value.toLowerCase().trim();
        document.querySelectorAll('#staffRows tr').forEach((row)=>{
            row.hidden=(staffFilter!=='all'&&row.dataset.staff!==staffFilter)||!row.textContent.toLowerCase().includes(query);
        });
    }

    document.querySelectorAll('[data-staff-filter]').forEach((button)=>button.addEventListener('click',()=>{
        staffFilter=button.dataset.staffFilter;
        document.querySelectorAll('[data-staff-filter]').forEach((item)=>item.classList.toggle('active',item===button));
        refreshStaff();
    }));
    document.getElementById('staffSearch').addEventListener('input',refreshStaff);
    document.querySelectorAll('[data-modal]').forEach((button)=>button.addEventListener('click',()=>setModal(button.dataset.modal,true)));
    document.querySelectorAll('[data-close-modal]').forEach((button)=>button.addEventListener('click',()=>setModal(button.closest('.modal').id,false)));
    
    document.addEventListener('keydown',(event)=>{
        if(event.key==='Escape') document.querySelectorAll('.modal').forEach(m=>setModal(m.id,false));
    });

    document.getElementById('scheduleButton').addEventListener('click',()=>showToast('Jadwal Harian','Modul manajemen jadwal mengajar segera hadir.'));
    document.getElementById('exportStaff').addEventListener('click',()=>showToast('Ekspor disiapkan','Data absen dan JTM siap diunduh.'));
    document.getElementById('detailSchedule').addEventListener('click',()=>{
        setModal('detailModal',false);
        showToast('Memuat jadwal','Tampilan jadwal mengajar individu segera terbuka.');
    });

    // Dynamic Fetch
    window.addEventListener('darussolah:ready', async () => {
        try {
            const res = await window.DarussolahPortal.fetchPrivate(null, 'admin/staff', window.DarussolahPortal.session);
            if(res && res.items) {
                const tbody = document.querySelector('#staffRows');
                tbody.innerHTML = res.items.map(s => {
                    const initials = (s.full_name||'U').substring(0,2).toUpperCase();
                    const filterCat = s.employment_status === 'fixed' || s.employment_status === 'Tetap' ? 'fixed' : 'honor';
                    
                    return \`<tr data-staff="\${filterCat}">
                        <td><div class="teacher-cell"><span class="teacher-avatar">\${initials}</span><span class="teacher-detail">\${escapeHTML(s.full_name)}<small>\${escapeHTML(s.position)} · \${escapeHTML(s.institution_id)}</small></span></div></td>
                        <td><span class="qualification">\${escapeHTML(s.qualifications||'-')}</span></td>
                        <td><span class="employment \${filterCat}">\${filterCat === 'fixed' ? 'Tetap' : 'Honorer'}</span></td>
                        <td class="jtm-number">\${s.jtm||'0'} jam</td>
                        <td class="attendance-good">\${s.attendance_rate||'100'}%</td>
                        <td><button class="row-action" type="button" data-staff-action="\${escapeHTML(s.full_name)}" data-staff-bio="\${escapeHTML(s.bio||'-')}">Detail</button></td>
                    </tr>\`;
                }).join('');

                // Re-bind actions
                document.querySelectorAll('[data-staff-action]').forEach((button)=>button.addEventListener('click',()=>{
                    document.getElementById('detailTitle').textContent=button.dataset.staffAction;
                    const bioText=button.dataset.staffBio;
                    const bioContainer=document.getElementById('bioContainer');
                    const bioParagraph=document.getElementById('detailBio');
                    if(bioText){
                        bioParagraph.textContent=bioText;
                        bioContainer.style.display='block';
                    }else{
                        bioContainer.style.display='none';
                    }
                    setModal('detailModal',true);
                }));

                const total = res.items.length;
                const fixed = res.items.filter(s => s.employment_status === 'fixed' || s.employment_status === 'Tetap').length;
                document.querySelector('#staffTotal').textContent = total;
                document.querySelector('#fixedTotal').textContent = fixed;
                document.querySelector('#staffChip').textContent = \`\${total} guru aktif\`;
            }
        } catch(e) {
            console.error('Failed to load staff', e);
        }
    });

    document.getElementById('staffForm').addEventListener('submit', async event => {
        event.preventDefault();
        const name=document.getElementById('staffName').value.trim();
        const qual=document.getElementById('staffQualification').value.trim();
        const stat=document.getElementById('staffStatus').value;
        const unit=document.getElementById('staffUnit').value;
        const jtm=document.getElementById('staffJtm').value.trim();
        const bio=document.getElementById('staffBio').value.trim();
        
        try {
            await window.DarussolahPortal.requestPrivate(null, 'admin/staff', window.DarussolahPortal.session, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: name,
                    position: 'Guru',
                    institution_id: unit,
                    employment_status: stat,
                    qualifications: qual,
                    jtm: jtm,
                    bio: bio,
                    attendance_rate: '100'
                })
            });
            showToast('Guru tersimpan', \`\${name} (\${jtm} JTM) berhasil ditambahkan.\`);
            setModal('staffModal',false);
            event.target.reset();
            setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
            showToast('Gagal mendaftar', 'Periksa koneksi Anda.');
        }
    });
</script>`;

code = code.replace(regex, newScript);
fs.writeFileSync('kepegawaian.html', code);
console.log('Kepegawaian dynamic complete');
