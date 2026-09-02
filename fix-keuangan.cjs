const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const invoiceEndpoint = `
app.post('/v1/private/:tenant_slug/admin/invoices', requireAuth, async (req, res) => {
  try {
    const { student_id, type, amount, status, notes } = req.body;
    const { invoices } = require('./src/db/schema.ts');
    
    await db.insert(invoices).values({
      studentId: parseInt(student_id) || 1,
      type: type || 'SPP bulanan',
      amount: 'Rp ' + (amount ? Number(amount).toLocaleString('id-ID') : '0'),
      status: status || 'unpaid',
      notes: notes || ''
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

if (!serverCode.includes('/admin/invoices')) {
  serverCode = serverCode.replace('// --- Admin Endpoints ---', invoiceEndpoint + '\n// --- Admin Endpoints ---');
  fs.writeFileSync('server.ts', serverCode);
  console.log("invoices endpoint added");
}

let html = fs.readFileSync('keuangan.html', 'utf8');

const submitScript = `
    document.getElementById('invoiceForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const amount = document.getElementById('invoiceAmount').value;
      const type = document.getElementById('invoiceType').value;
      const name = document.getElementById('studentName').value;

      try {
        await window.DarussolahPortal.requestPrivate(null, 'admin/invoices', window.DarussolahPortal.session, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: 1, // mock, in real we should search by name or select dropdown
            type: type,
            amount: amount,
            status: 'unpaid',
            notes: 'Ditagihkan kepada ' + name
          })
        });

        const num = Number(amount).toLocaleString('id-ID');
        const row = document.createElement('tr');
        row.dataset.status = 'unpaid';
        row.innerHTML = \`<td><div class="transaction-cell"><span class="payer-avatar">\${name.slice(0,2).toUpperCase()}</span><span class="transaction-detail">\${name}<small>\${type}</small></span></div></td><td>Rp \${num}</td><td>Baru saja</td><td><span class="status-pill warn">Belum lunas</span></td><td><button class="row-action" type="button" data-action="\${name}">Detail</button></td>\`;
        document.querySelector('#financeRows').prepend(row);
        
        closeModal('invoiceModal');
        event.target.reset();
        showToast('Tagihan berhasil dibuat', \`Tagihan \${type} untuk \${name} telah tersimpan di database.\`);
      } catch (err) {
        showToast('Gagal', 'Terjadi kesalahan saat membuat tagihan.');
      }
    });
`;

if (!html.includes('invoiceForm\').addEventListener(\'submit\'')) {
  html = html.replace('  </script>', submitScript + '\n  </script>');
  fs.writeFileSync('keuangan.html', html);
  console.log('keuangan.html fixed');
}

