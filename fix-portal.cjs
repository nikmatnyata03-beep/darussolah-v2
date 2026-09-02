const fs = require('fs');
let code = fs.readFileSync('darussolah-portal.js', 'utf8');

// Replace the Supabase logic in activeSession fetching
code = code.replace(/if \(!activeSession\?.access_token\) throw new Error\('sesi tidak tersedia'\);/g, `
      const firebaseToken = localStorage.getItem('dwj-access-token');
      if (!firebaseToken) throw new Error('sesi tidak tersedia');
      activeSession = { access_token: firebaseToken };
`);

fs.writeFileSync('darussolah-portal.js', code);
