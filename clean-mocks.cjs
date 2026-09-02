const fs = require('fs');

const filesToClean = {
  'cms.html': [
    /document\.getElementById\('articleForm'\)\.addEventListener\('submit',.*?\}\);/s,
    /document\.getElementById\('mediaForm'\)\.addEventListener\('submit',.*?\}\);/s,
    /document\.getElementById\('pageForm'\)\.addEventListener\('submit',.*?\}\);/s,
    /document\.getElementById\('bannerForm'\)\.addEventListener\('submit',.*?\}\);/s,
    /articleForm\.addEventListener\('submit',.*?\}\);/s
  ],
  'notifikasi.html': [
    /document\.getElementById\('confirmBroadcast'\)\.addEventListener\('click',.*?\}\);/s,
    /document\.getElementById\('exportButton'\)\.addEventListener\('click',.*?\}\);/s,
    /document\.getElementById\('calendarForm'\)\.addEventListener\('submit',.*?\}\);/s
  ],
  'kepegawaian.html': [
    /document\.getElementById\('exportStaff'\)\.addEventListener\('click',.*?\}\);/s,
    /document\.getElementById\('staffForm'\)\.addEventListener\('submit',.*?\}\);/s
  ],
  'pengaturan.html': [
    /document\.getElementById\('installButton'\)\.addEventListener\('click',.*?\}\);/s,
    /document\.getElementById\('backupButton'\)\.addEventListener\('click',.*?\}\);/s,
    /document\.getElementById\('restoreButton'\)\.addEventListener\('click',.*?\}\);/s,
    /document\.getElementById\('alumniForm'\)\.addEventListener\('submit',.*?true\);/s
  ],
  'nilai.html': [
    // This one actually has inline handler for 'approval-button' ?
    /document\.getElementById\('approval-button'\)\.addEventListener\('click',.*?\}\);/s
  ]
};

for (const [filename, regexes] of Object.entries(filesToClean)) {
  if (fs.existsSync(filename)) {
    let code = fs.readFileSync(filename, 'utf8');
    for (const regex of regexes) {
      code = code.replace(regex, '');
    }
    fs.writeFileSync(filename, code);
  }
}
