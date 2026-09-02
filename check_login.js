    import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
    import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

    const roleButtons = [...document.querySelectorAll('[data-role]')];
    const roleInput = document.querySelector('#role');
    const helper = document.querySelector('#role-helper');
    const message = document.querySelector('#auth-message');
    const googleLoginBtn = document.querySelector('#google-login-btn');

    const config = window.DARUSSOLAH_CONFIG || {};
    const apiBase = String(config.apiBase || '').replace(/\/+$/, '');
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
    const redirectTarget = (() => { try { const url = new URL(requestedRedirect, window.location.href); const path = url.pathname.split('/').pop(); return url.origin === window.location.origin && allowedRedirects.has(path) ? `${path}${url.search}` : ''; } catch (error) { return ''; } })();

    const showAuthMessage = (title, copy, link = '') => {
      const safe = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
      message.innerHTML = `<strong>${safe(title)}</strong><span>${safe(copy)}</span>${link}`;
      message.classList.add('show');
    };

    let auth, provider;
    // Pre-initialize Firebase to prevent popup block
    fetch('/firebase-applet-config.json').then(r => r.json()).then(config => {
      const app = !getApps().length ? initializeApp(config) : getApp();
      auth = getAuth(app);
      provider = new GoogleAuthProvider();
    }).catch(console.error);

    let isSigningIn = false;
    googleLoginBtn.addEventListener('click', async () => {
      if (isSigningIn) return;
      isSigningIn = true;
      if (!auth || !provider) {
         showAuthMessage('Sistem belum siap', 'Harap tunggu sesaat hingga konfigurasi dimuat.');
         isSigningIn = false;
         return;
      }
      try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = await result.user.getIdToken();

        if (!accessToken) throw new Error('No access token');

        // Fetch roles from our backend
        const response = await fetch(`${apiBase}/v1/private/${encodeURIComponent(tenantSlug)}/me`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const body = await response.json().catch(() => ({}));
        
        if (!response.ok) {
           showAuthMessage('Login gagal.', body.error || 'Akun tidak dikenali.');
           await auth.signOut();
           isSigningIn = false;
           return;
        }

        const userRoles = body.user?.roles || ['wali']; // fallback default
        const requestedRole = roleInput.value;
        
        if (!userRoles.includes(requestedRole)) {
           showAuthMessage('Akses Ditolak', `Akun Anda tidak memiliki peran ${requestedRole}.`);
           await auth.signOut();
           isSigningIn = false;
           return;
        }

        safeStorage('sessionStorage')?.setItem('dwj-ui-role', requestedRole);
        safeStorage('localStorage')?.setItem('dwj-ui-role', requestedRole);
        // Persist token for the frontend app
        safeStorage('localStorage')?.setItem('dwj-access-token', accessToken);

        const destination = redirectTarget || roleDestinations[requestedRole];
        showAuthMessage('Login berhasil.', 'Mengarahkan...', `<a class="portal-link" href="${destination}">Buka portal &rarr;</a>`);
        window.location.href = destination;

      } catch (err) {
        console.error(err);
        showAuthMessage('Gagal masuk.', err.message);
      }
    });
