const fs = require('fs');
let code = fs.readFileSync('keuangan.html', 'utf8');

const regex = /<script>[\s\S]*?<\/script>/;

const newScript = `<script>
    let toastTimer;
    let activeFilter = 'all';
    const toast = document.getElementById('toast');
    document.querySelectorAll('.help-link[href="#bantuan"]').forEach(link=>link.href='index.html#faq');
    document.getElementById('transaksi')?.setAttribute('id','laporan');

    function showToast(title, text) {
        document.getElementById('toastTitle').textContent = title;
        document.getElementById('toastText').textContent = text;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
    }

    function setModal(id, open) {
        const modal = document.getElementById(id);
        modal.hidden = !open;
        modal.setAttribute('aria-hidden', String(!open));
        if (open) modal.querySelector('input,select')?.focus();
    }

    function filterRows() {
        const query = document.getElementById('billSearch').value.toLowerCase().trim();
        document.querySelectorAll('#invoiceRows tr').forEach(row => {
            row.hidden = (activeFilter !== 'all' && row.dataset.status !== activeFilter) || !row.textContent.toLowerCase().includes(query);
        });
    }

    document.querySelectorAll('[data-bill-filter]').forEach(button => button.addEventListener('click', () => {
        activeFilter = button.dataset.billFilter;
        document.querySelectorAll('[data-bill-filter]').forEach(item => item.classList.toggle('active', item === button));
        filterRows();
    }));

    document.getElementById('billSearch').addEventListener('input', filterRows);
    document.querySelectorAll('[data-modal]').forEach(button => button.addEventListener('click', () => setModal(button.dataset.modal, true)));
    document.querySelectorAll('[data-close-modal]').forEach(button => button.addEventListener('click', () => setModal(button.closest('.modal').id, false)));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') document.querySelectorAll('.modal').forEach(m => setModal(m.id, false)); });

    // Dynamic Fetch
    window.addEventListener('darussolah:ready', async () => {
        try {
            // Setup students dropdown
            const stdRes = await window.DarussolahPortal.fetchPrivate(null, 'admin/students', window.DarussolahPortal.session);
            if(stdRes && stdRes.items) {
               const stSel = document.getElementById('studentName');
               if (stSel) {
                 stSel.outerHTML = \\\`<select id="studentName" required>
                     \${stdRes.items.map(s => \\\`<option value="\${s.id}">\${s.full_name}</option>\\\`).join('')}
                 </select>\\\`;
               }
            }

            const res = await window.DarussolahPortal.fetchPrivate(null, 'admin/invoices', window.DarussolahPortal.session);
            if(res && res.items) {
                const tbody = document.querySelector('#invoiceRows');
                tbody.innerHTML = res.items.map(inv => {
                    const initials = (inv.student_name||'S').substring(0,2).toUpperCase();
                    const sName = inv.student_name;
                    const st = inv.status || 'unpaid';
                    const isPaid = st === 'paid' || st === 'lunas';
                    const pClass = isPaid ? 'status-pill' : 'status-pill pending';
                    const pText = isPaid ? 'Lunas' : 'Menunggu';
                    const btnClass = 'pay-button';
                    const btnText = isPaid ? 'Kwitansi' : 'Ingatkan';
                    
                    return \\\`<tr data-status="\${isPaid ? 'paid' : 'pending'}">
                        <td><div class="payer-cell"><span class="payer-avatar">\${initials}</span><span class="payer-detail">\${sName}<small>\${inv.type||'Tagihan'}</small></span></div></td>
                        <td>\${inv.due_date||'-'}</td>
                        <td class="amount">\${inv.amount||'Rp 0'}</td>
                        <td><span class="\${pClass}">\${pText}</span></td>
                        <td><button class="\${btnClass}" type="button" onclick="alert('\${btnText} santri \${sName}')">\${btnText}</button></td>
                    </tr>\\\`;
                }).join('');

                const total = res.items.length;
                const paid = res.items.filter(i => i.status==='paid' || i.status==='lunas').length;
                document.querySelector('#totalBills').textContent = total;
                document.querySelector('#paidBills').textContent = paid;
                document.querySelector('#billChip').textContent = \`\${total} tagihan\`;
            }
        } catch(e) {
            console.error('Failed to load invoices', e);
        }
    });

    document.getElementById('invoiceForm').addEventListener('submit', async event => {
        event.preventDefault();
        const stdId = document.getElementById('studentName').value;
        const amount = document.getElementById('invoiceAmount').value;
        const due = document.getElementById('invoiceDue').value;
        const type = document.getElementById('invoiceType').value;
        
        try {
            await window.DarussolahPortal.requestPrivate(null, 'admin/invoices', window.DarussolahPortal.session, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: stdId,
                    type: type,
                    amount: amount,
                    due_date: due,
                    status: 'unpaid'
                })
            });
            showToast('Invoice dibuat', 'Tagihan berhasil ditambahkan.');
            setModal('invoiceModal', false);
            event.target.reset();
            setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
            showToast('Gagal', 'Periksa koneksi Anda.');
        }
    });

    document.getElementById('donationForm').addEventListener('submit', event => {
        event.preventDefault();
        showToast('Donasi tersimpan', 'Penerimaan dana berhasil dicatat (mode demo).');
        setModal('donationModal', false);
        event.target.reset();
    });

    document.querySelectorAll('[data-action="export"]').forEach(btn => btn.addEventListener('click', () => showToast('Ekspor dimulai', 'Laporan PDF sedang disiapkan.')));
    document.getElementById('export-sheets-btn')?.addEventListener('click', () => showToast('Sinkronisasi Sheets', 'Menyalin data ke Google Sheets...'));
</script>`;

code = code.replace(regex, newScript);
fs.writeFileSync('keuangan.html', code);
console.log('Keuangan dynamic complete');
