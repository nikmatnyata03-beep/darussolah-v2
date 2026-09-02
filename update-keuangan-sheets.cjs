const fs = require('fs');
let code = fs.readFileSync('keuangan.html', 'utf8');

const targetBtn = `<button class="pay-button" type="button" data-action="export">Unduh laporan</button>`;
const newBtn = `<button class="pay-button" type="button" data-action="export">Unduh laporan</button><button class="pay-button" type="button" id="export-sheets-btn" style="margin-left: 8px;">Ekspor ke Sheets</button>`;

code = code.replace(targetBtn, newBtn);

const scriptToAdd = `
  <script type="module">
    import { initGoogleAuth, googleSignIn, logoutGoogle, getAccessToken, createGoogleSheet } from './google-docs.js';
    
    // UI elements for Google Sheets
    const sheetsBtn = document.getElementById('export-sheets-btn');
    
    if (sheetsBtn) {
      sheetsBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        let token = getAccessToken();
        if (!token) {
           try {
             const res = await googleSignIn();
             token = res.accessToken;
           } catch (err) {
             console.error(err);
             alert('Gagal masuk Google.');
             return;
           }
        }
        
        const originalText = sheetsBtn.textContent;
        sheetsBtn.textContent = 'Mengekspor...';
        sheetsBtn.disabled = true;
        
        try {
          // Prepare data from table
          const tableRows = [...document.querySelectorAll('.bill-table tbody tr')];
          const data = [['Deskripsi', 'Waktu', 'Metode', 'Nominal', 'Status']];
          
          tableRows.forEach(tr => {
            const cells = tr.querySelectorAll('td');
            if (cells.length === 5) {
               data.push([
                 cells[0].textContent.trim(),
                 cells[1].textContent.trim(),
                 cells[2].textContent.trim(),
                 cells[3].textContent.trim(),
                 cells[4].textContent.trim()
               ]);
            }
          });
          
          const sheet = await createGoogleSheet(token, 'Laporan Keuangan TPQ Darul Jinan', data);
          alert('Berhasil mengekspor ke Google Sheets: ' + sheet.spreadsheetUrl);
        } catch (err) {
          console.error(err);
          alert('Gagal mengekspor data.');
        } finally {
          sheetsBtn.textContent = originalText;
          sheetsBtn.disabled = false;
        }
      });
      
      initGoogleAuth((user, token) => {
        console.log('Google Auth initialized, user logged in.');
      });
    }
  </script>
`;

code = code.replace('</body>', scriptToAdd + '\n</body>');
fs.writeFileSync('keuangan.html', code);
