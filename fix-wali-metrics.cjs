const fs = require('fs');
let html = fs.readFileSync('wali.html', 'utf8');

const targetScript = `
          // Render Invoice
          if (res.invoices && res.invoices.length > 0) {
            const inv = res.invoices[0];
            document.getElementById('invoiceAmount').textContent = inv.amount;
            document.getElementById('invoiceDue').textContent = inv.status;
          } else {
            document.getElementById('invoiceAmount').textContent = 'Rp 0';
            document.getElementById('invoiceDue').textContent = 'Lunas';
          }
`;

const replacementScript = `
          // Render Metrics & Invoice
          if (res.invoices && res.invoices.length > 0) {
            const inv = res.invoices[0];
            document.getElementById('invoiceAmount').textContent = inv.amount;
            document.getElementById('feeValue').textContent = inv.amount;
            document.getElementById('feeFoot').textContent = inv.status;
            document.getElementById('invoiceDue').textContent = inv.status;
            document.querySelector('.invoice-badge').textContent = 'Ada Tagihan';
          } else {
            document.getElementById('invoiceAmount').textContent = 'Rp 0';
            document.getElementById('feeValue').textContent = 'Rp 0';
            document.getElementById('feeFoot').textContent = 'Tidak ada tagihan';
            document.getElementById('invoiceDue').textContent = 'Lunas';
            document.querySelector('.invoice-badge').textContent = 'Lunas';
          }
          
          const attendanceData = window.DarussolahPortal?.attendance;
          if (attendanceData && attendanceData.items) {
             const items = attendanceData.items.filter(i => i.uid === activeStudent.id.toString());
             const presentCount = items.filter(i => i.status === 'hadir').length;
             document.getElementById('attendanceValue').textContent = presentCount + ' hari';
             document.getElementById('attendanceFoot').textContent = 'Bulan ini';
             document.getElementById('attendanceDetail').textContent = presentCount + ' Kehadiran';
             document.querySelector('.attendance-rate').textContent = (presentCount > 0 ? '100%' : '0%');
          } else {
             document.getElementById('attendanceValue').textContent = '0 hari';
             document.getElementById('attendanceFoot').textContent = 'Belum ada data';
          }
          
          document.getElementById('taskValue').textContent = '0 Tugas';
          document.getElementById('taskFoot').textContent = 'Tidak ada tugas tertunda';
`;

html = html.replace(targetScript, replacementScript);

// Also replace progress updates to update memorizeValue
const progTarget = `
          // Render Progress
          if (res.progress && res.progress.length > 0) {
            const prog = res.progress[0];
            document.getElementById('progressValue').textContent = prog.currentValue || 'Belum ada';
            document.getElementById('progressStart').textContent = 'Mulai';
            document.getElementById('progressEnd').textContent = prog.target || 'Target';
          } else {
            document.getElementById('progressValue').textContent = 'Belum tersedia';
          }
`;

const progReplace = `
          // Render Progress
          if (res.progress && res.progress.length > 0) {
            const prog = res.progress[0];
            document.getElementById('progressValue').textContent = prog.currentValue || 'Belum ada';
            document.getElementById('memorizeValue').textContent = prog.currentValue || 'Belum ada';
            document.getElementById('memorizeFoot').textContent = prog.notes || 'Terakhir disetor';
            document.getElementById('progressStart').textContent = 'Mulai';
            document.getElementById('progressEnd').textContent = prog.target || 'Target';
            document.getElementById('progressBar').style.width = '50%';
          } else {
            document.getElementById('progressValue').textContent = 'Belum ada progres';
            document.getElementById('memorizeValue').textContent = '-';
            document.getElementById('memorizeFoot').textContent = 'Belum ada data';
            document.getElementById('progressBar').style.width = '0%';
          }
`;

html = html.replace(progTarget, progReplace);

fs.writeFileSync('wali.html', html);
console.log('Metrics logic updated');
