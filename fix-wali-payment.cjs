const fs = require('fs');
let html = fs.readFileSync('wali.html', 'utf8');

const paymentModal = `
  <div class="modal" id="payModal" hidden aria-hidden="true">
    <div class="modal-backdrop" data-close-modal></div>
    <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="payTitle">
      <button class="dialog-close" type="button" data-close-modal aria-label="Tutup">×</button>
      <span class="eyebrow">Instruksi Pembayaran</span>
      <h2 class="serif" id="payTitle">Pembayaran Tagihan</h2>
      <p>Silakan lakukan transfer ke salah satu rekening resmi lembaga berikut:</p>
      
      <div style="background: var(--sand); border: 1px solid var(--line); border-radius: 8px; padding: 16px; margin-top: 16px;">
        <strong style="display: block; margin-bottom: 4px;">Bank Syariah Indonesia (BSI)</strong>
        <span style="font-family: monospace; font-size: 1.1rem; color: var(--forest-dark); display: block;">700 123 4567</span>
        <span style="font-size: 0.9rem; color: var(--muted);">a.n. Yayasan Darussolah Wal Jinan</span>
      </div>

      <div style="background: var(--sand); border: 1px solid var(--line); border-radius: 8px; padding: 16px; margin-top: 12px; margin-bottom: 24px;">
        <strong style="display: block; margin-bottom: 4px;">Bank Rakyat Indonesia (BRI)</strong>
        <span style="font-family: monospace; font-size: 1.1rem; color: var(--forest-dark); display: block;">1234 01 567890 53 1</span>
        <span style="font-size: 0.9rem; color: var(--muted);">a.n. TPQ Darul Jinan</span>
      </div>

      <p style="font-size: 0.9rem; color: var(--muted);">Setelah melakukan transfer, mohon kirimkan bukti transfer melalui pesan WhatsApp ke <strong>Admin Keuangan (0812-XXXX-XXXX)</strong> beserta nama dan NIS santri.</p>
      
      <button class="btn btn-primary" style="width:100%; margin-top:16px;" type="button" data-close-modal>Tutup</button>
    </div>
  </div>
`;

if (!html.includes('id="payModal"')) {
  // Insert modal
  html = html.replace('  <div class="toast"', paymentModal + '\n  <div class="toast"');
  
  // Update button to open modal
  html = html.replace(
    `document.getElementById('payButton').addEventListener('click',()=>window.location.href='keuangan.html');`,
    `document.getElementById('payButton').addEventListener('click', () => { document.getElementById('payModal').hidden = false; document.getElementById('payModal').setAttribute('aria-hidden', 'false'); });`
  );
  
  fs.writeFileSync('wali.html', html);
  console.log('Payment modal added successfully.');
}
