const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const broadcastEndpoint = `
app.post('/v1/private/:tenant_slug/admin/broadcasts', requireAuth, async (req, res) => {
  try {
    const { target, mode, channel, title, message } = req.body;
    
    const { posts } = require('./src/db/schema.ts');
    await db.insert(posts).values({
      title: title,
      content: message,
      excerpt: mode + ' via ' + channel + ' to ' + target,
      status: 'published'
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
`;

if (!serverCode.includes('/admin/broadcasts')) {
  serverCode = serverCode.replace('// --- Admin Endpoints ---', broadcastEndpoint + '\n// --- Admin Endpoints ---');
  fs.writeFileSync('server.ts', serverCode);
  console.log("broadcast endpoint added");
}

let html = fs.readFileSync('notifikasi.html', 'utf8');

const submitScript = `
    document.getElementById('confirmBroadcast').addEventListener('click', async () => {
      const target = document.getElementById('broadcastTarget').value;
      const mode = document.getElementById('sendMode').value;
      const title = document.getElementById('broadcastTitle').value;
      const message = document.getElementById('broadcastMessage').value;

      try {
        await window.DarussolahPortal.requestPrivate(null, 'admin/broadcasts', window.DarussolahPortal.session, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            target,
            mode,
            channel,
            title,
            message
          })
        });

        const row = document.createElement('tr');
        row.dataset.delivery = 'sent';
        row.innerHTML = \`<td><div class="message-cell"><span class="message-icon">\${channel==='whatsapp'?'WA':'@'}</span><span class="message-detail">\${title}<small>Broadcast manual</small></span></div></td><td>\${target}</td><td>Baru saja</td><td class="rate">0%</td><td><span class="delivery-status">Terkirim</span></td>\`;
        document.querySelector('#deliveryRows').prepend(row);
        
        setModal('previewModal', false);
        document.getElementById('broadcastForm').reset();
        document.getElementById('charCount').textContent = '0';
        showToast('Pesan terkirim', 'Pesan telah dikirim ke antrean pengiriman backend.');
      } catch (err) {
        showToast('Gagal', 'Terjadi kesalahan jaringan.');
      }
    });
`;

if (!html.includes('confirmBroadcast\').addEventListener(\'click\', async')) {
  html = html.replace('  </script>', submitScript + '\n  </script>');
  fs.writeFileSync('notifikasi.html', html);
  console.log('notifikasi.html fixed');
}

