const fs = require('fs');

let html = fs.readFileSync('login.html', 'utf8');

// Replace Supabase CDN script
html = html.replace('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.min.js" integrity="sha384-AkNSQdptcXlJ0/NBZc4qGk86cDVXcCevwoWgEKIpHOEfbvlXGLlIkimQtONt8KNf" crossorigin="anonymous"></script>', '');

// Replace the <form> content with a Google sign-in button
const formRegex = /<form class="login-form" id="login-form">[\s\S]*?<\/form>/;
const googleBtnHtml = `
<form class="login-form" id="login-form">
  <input type="hidden" id="role" name="role" value="wali" />
  
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px 0;">
    <button type="button" class="gsi-material-button" id="google-login-btn" style="background-color: #fff; border: 1px solid #dadce0; border-radius: 4px; box-sizing: border-box; color: #3c4043; cursor: pointer; display: inline-block; font-family: Roboto, arial, sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.25px; outline: none; padding: 0 12px; position: relative; transition: background-color .218s, border-color .218s, box-shadow .218s; vertical-align: middle; white-space: nowrap; width: 100%; max-width: 400px; min-width: min-content; height: 40px;">
      <div style="align-items: center; display: flex; flex-direction: row; flex-wrap: nowrap; height: 100%; justify-content: center; position: relative; width: 100%;">
        <div style="height: 20px; margin-right: 12px; min-width: 20px; width: 20px;">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </div>
        <span style="font-family: Roboto, arial, sans-serif; font-weight: 500; overflow: hidden; text-overflow: ellipsis; vertical-align: top;">Sign in with Google</span>
      </div>
    </button>
  </div>
  
  <p class="auth-helper" id="role-helper" style="text-align: center;">Pilih peran Anda dan masuk dengan akun Google.</p>
  <div class="auth-message" id="auth-message" role="status" aria-live="polite"><strong>Antarmuka login siap.</strong></div>
</form>
`;
html = html.replace(formRegex, googleBtnHtml);

// Remove the old script tag completely
const scriptRegex = /<script>[\s\S]*?<\/script>/;
html = html.replace(scriptRegex, '');

// Append the new module script
const newScript = `
  <script type="module">
    import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
    import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

    const roleButtons = [...document.querySelectorAll('[data-role]')];
    const roleInput = document.querySelector('#role');
    const helper = document.querySelector('#role-helper');
    const message = document.querySelector('#auth-message');
    const googleLoginBtn = document.querySelector('#google-login-btn');

    const config = window.DARUSSOLAH_CONFIG || {};
    const apiBase = String(config.apiBase || '').replace(/\\/+$/, '');
    const tenantSlug = String(config.tenantSlug || 'yayasan-darussolah-wal-jinan').trim();

    const safeStorage = (name) => { try { return window[name]; } catch (error) { return null; } };

    const roleContent = {
      wali: { helper: 'Wali santri dapat melihat ringkasan semua anak yang terhubung.', button: 'Masuk ke portal' },
      guru: { helper: 'Guru dapat mengelola kehadiran, materi, tugas, dan catatan perkembangan.', button: 'Masuk ke ruang guru' },
      admin: { helper: 'Admin lembaga mengelola data sesuai unit dan hak aksesnya.', button: 'Masuk ke panel admin' }
    };

    const selectRole = (role) => {
      roleInput.value = role;
      roleButtons.forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.role === role)));
      helper.textContent = roleContent[role].helper;
    };

    roleButtons.forEach(btn => {
      btn.addEventListener('click', () => selectRole(btn.dataset.role));
    });

    const roleDestinations = { wali: 'wali.html', guru: 'absensi.html', admin: 'keuangan.html' };
    const allowedRedirects = new Set(['wali.html', 'absensi.html', 'materi.html', 'tahfidz.html', 'nilai.html', 'keuangan.html', 'kepegawaian.html', 'notifikasi.html', 'pengaturan.html', 'analitik.html', 'cms.html', 'santri.html']);

    const requestedRedirect = new URLSearchParams(window.location.search).get('redirect') || '';
    const redirectTarget = (() => { try { const url = new URL(requestedRedirect, window.location.href); const path = url.pathname.split('/').pop(); return url.origin === window.location.origin && allowedRedirects.has(path) ? \`\${path}\${url.search}\` : ''; } catch (error) { return ''; } })();

    const showAuthMessage = (title, copy, link = '') => {
      const safe = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
      message.innerHTML = \`<strong>\${safe(title)}</strong><span>\${safe(copy)}</span>\${link}\`;
      message.classList.add('show');
    };

    googleLoginBtn.addEventListener('click', async () => {
      try {
        const resConfig = await fetch('/firebase-applet-config.json');
        const firebaseConfig = await resConfig.json();
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();

        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken || (await result.user.getIdToken());

        if (!accessToken) throw new Error('No access token');

        // Fetch roles from our backend
        const response = await fetch(\`\${apiBase}/v1/private/\${encodeURIComponent(tenantSlug)}/me\`, {
          headers: { Authorization: \`Bearer \${accessToken}\` }
        });
        
        const body = await response.json().catch(() => ({}));
        
        if (!response.ok) {
           showAuthMessage('Login gagal.', body.error || 'Akun tidak dikenali.');
           await auth.signOut();
           return;
        }

        const userRoles = body.user?.roles || ['wali']; // fallback default
        const requestedRole = roleInput.value;
        
        if (!userRoles.includes(requestedRole)) {
           showAuthMessage('Akses Ditolak', \`Akun Anda tidak memiliki peran \${requestedRole}.\`);
           await auth.signOut();
           return;
        }

        safeStorage('sessionStorage')?.setItem('dwj-ui-role', requestedRole);
        safeStorage('localStorage')?.setItem('dwj-ui-role', requestedRole);
        // Persist token for the frontend app
        safeStorage('localStorage')?.setItem('dwj-access-token', accessToken);

        const destination = redirectTarget || roleDestinations[requestedRole];
        showAuthMessage('Login berhasil.', 'Mengarahkan...', \`<a class="portal-link" href="\${destination}">Buka portal &rarr;</a>\`);
        window.location.href = destination;

      } catch (err) {
        console.error(err);
        showAuthMessage('Gagal masuk.', err.message);
      }
    });
  </script>
`;
html = html + newScript;

fs.writeFileSync('login.html', html);
console.log('Updated login.html');
