const fs = require('fs');
let code = fs.readFileSync('santri.html', 'utf8');

const regex = /<script>[\s\S]*?<\/script>/;

const newScript = `<script>
    const search=document.querySelector('#studentSearch');
    const modal=document.querySelector('#studentModal');
    const toast=document.querySelector('#toast');
    let toastTimer;

    const showToast=(title,text)=>{
        document.querySelector('#toastTitle').textContent=title;
        document.querySelector('#toastText').textContent=text;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer=setTimeout(()=>toast.classList.remove('show'),3200);
    };

    const refresh=()=>{
        const query=search.value.trim().toLowerCase();
        const filter=document.querySelector('.filter-tab.active').dataset.filter;
        document.querySelectorAll('#studentRows tr').forEach(row=>{
            row.hidden=(filter!=='all'&&row.dataset.status!==filter)||!row.textContent.toLowerCase().includes(query);
        });
    };

    document.querySelectorAll('.filter-tab').forEach(button=>button.addEventListener('click',()=>{
        document.querySelectorAll('.filter-tab').forEach(item=>{
            const active=item===button;
            item.classList.toggle('active',active);
            item.setAttribute('aria-pressed',String(active));
        });
        refresh();
    }));
    search.addEventListener('input',refresh);

    const closeModal=()=>{modal.hidden=true;modal.setAttribute('aria-hidden','true')};
    document.querySelectorAll('[data-modal]').forEach(button=>button.addEventListener('click',()=>{
        modal.hidden=false;
        modal.setAttribute('aria-hidden','false');
        document.querySelector('#studentName').focus();
    }));
    document.querySelectorAll('[data-close-modal]').forEach(button=>button.addEventListener('click',closeModal));
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!modal.hidden)closeModal()});

    document.querySelector('#guardianButton').addEventListener('click',()=>showToast('Hubungan wali dibuka','Kelola satu akun wali untuk beberapa santri lintas lembaga.'));
    document.querySelector('#exportButton').addEventListener('click',()=>showToast('Rekap disiapkan','Data santri siap diekspor.'));

    // Fetch and render actual students
    window.addEventListener('darussolah:ready', async () => {
        try {
            const res = await window.DarussolahPortal.fetchPrivate(null, 'admin/students', window.DarussolahPortal.session);
            if (res && res.items) {
                const tbody = document.querySelector('#studentRows');
                tbody.innerHTML = res.items.map(s => {
                    const initials = (s.full_name || 'S').substring(0,2).toUpperCase();
                    const stStatus = (s.status === 'active' || s.status === 'Aktif') ? 'active' : 'pending';
                    const pillClass = stStatus === 'active' ? 'status-pill' : 'status-pill pending';
                    const pillText = stStatus === 'active' ? 'Aktif' : 'Menunggu';
                    const docClass = stStatus === 'active' ? 'status-pill' : 'status-pill pending';
                    const docText = stStatus === 'active' ? 'Lengkap' : 'Kurang 1';
                    
                    return \`<tr data-status="\${stStatus}">
                        <td><div class="student-cell"><span class="payer-avatar">\${initials}</span><span class="student-detail">\${s.full_name}<small>\${s.nis || '-'} · \${s.institution_id || ''}</small></span></div></td>
                        <td>\${s.class_id || '-'}</td>
                        <td>\${s.guardian_name || '-'}</td>
                        <td><span class="\${pillClass}">\${pillText}</span></td>
                        <td><span class="\${docClass}">\${docText}</span></td>
                        <td><button class="row-action" type="button" data-detail="\${s.full_name}">Detail</button></td>
                    </tr>\`;
                }).join('');
                
                // Re-bind buttons
                document.querySelectorAll('[data-detail]').forEach(button=>button.addEventListener('click',()=>showToast(\`Detail \${button.dataset.detail}\`, 'Profil, wali, kelas, dan dokumen siap ditinjau.')));
                
                // Update metrics
                const total = res.items.length;
                const active = res.items.filter(s => s.status === 'active' || s.status === 'Aktif').length;
                document.querySelector('#studentTotal').textContent = total;
                document.querySelector('#activeTotal').textContent = active;
                document.querySelector('#studentChip').textContent = \`\${total} santri\`;
                document.querySelector('#activeFoot').textContent = \`\${total ? (active/total*100).toFixed(1) : 0}% dari total\`;
            }
        } catch (e) {
            console.error('Failed to load students', e);
        }
    });

    // Submitting new student
    document.querySelector('#studentForm').addEventListener('submit', async event => {
        event.preventDefault();
        const name = document.querySelector('#studentName').value.trim();
        const nis = document.querySelector('#studentNis').value.trim();
        const unit = document.querySelector('#studentClass').value;
        const guardian = document.querySelector('#studentGuardian').value.trim();
        
        try {
            await window.DarussolahPortal.requestPrivate(null, 'admin/students', window.DarussolahPortal.session, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: name,
                    nis: nis,
                    class_id: unit,
                    guardian_name: guardian,
                    status: 'pending'
                })
            });
            showToast('Data santri tersimpan', \`\${name} berhasil didaftarkan.\`);
            closeModal();
            event.target.reset();
            // Reload page to see changes (or fetch again, but reloading is simple)
            setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
            showToast('Gagal mendaftar', 'Periksa koneksi Anda.');
        }
    });
</script>`;

code = code.replace(regex, newScript);
fs.writeFileSync('santri.html', code);
console.log('santri.html updated with dynamic fetching');
