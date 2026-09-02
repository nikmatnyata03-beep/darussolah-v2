
204-    import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
205-    import { getAuth, signInWithPopup, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
206-
207-    const roleButtons = [...document.querySelectorAll('[data-role]')];
208-    const roleInput = document.querySelector('#role');
209-    const helper = document.querySelector('#role-helper');
210-    const message = document.querySelector('#auth-message');
211-    const googleLoginBtn = document.querySelector('#google-login-btn');
212-
213-    const config = window.DARUSSOLAH_CONFIG || {};
214-    const apiBase = String(config.apiBase || '').replace(/\/+$/, '');
215-    const tenantSlug = String(config.tenantSlug || 'yayasan-darussolah-wal-jinan').trim();
216-
217-    const safeStorage = (name) => { try { return window[name]; } catch (error) { return null; } };
218-
219-    const roleContent = {
220-      wali: { helper: 'Wali santri dapat melihat ringkasan semua anak yang terhubung.', button: 'Masuk ke portal' },
221-      guru: { helper: 'Guru dapat mengelola kehadiran, materi, tugas, dan catatan perkembangan.', button: 'Masuk ke ruang guru' },
222-      admin: { helper: 'Admin lembaga mengelola data sesuai unit dan hak aksesnya.', button: 'Masuk ke panel admin' }
223-    };
224-
225-    const selectRole = (role) => {
226-      roleInput.value = role;
227-      roleButtons.forEach((item) => item.setAttribute('aria-pressed', String(item.dataset.role === role)));
228-      helper.textContent = roleContent[role].helper;
229-    };
230-
231-    roleButtons.forEach(btn => {
232-      btn.addEventListener('click', () => selectRole(btn.dataset.role));
233-    });
234-
235-    const roleDestinations = { wali: 'wali.html', guru: 'absensi.html', admin: 'keuangan.html' };
236-    const allowedRedirects = new Set(['wali.html', 'absensi.html', 'materi.html', 'tahfidz.html', 'nilai.html', 'keuangan.html', 'kepegawaian.html', 'notifikasi.html', 'pengaturan.html', 'analitik.html', 'cms.html', 'santri.html']);
237-
238-    const requestedRedirect = new URLSearchParams(window.location.search).get('redirect') || '';
239-    const redirectTarget = (() => { try { const url = new URL(requestedRedirect, window.location.href); const path = url.pathname.split('/').pop(); return url.origin === window.location.origin && allowedRedirects.has(path) ? `${path}${url.search}` : ''; } catch (error) { return ''; } })();
240-
241-    const showAuthMessage = (title, copy, link = '') => {
242-      const safe = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
243-      message.innerHTML = `<strong>${safe(title)}</strong><span>${safe(copy)}</span>${link}`;
244-      message.classList.add('show');
245-    };
246-
247-    let auth, provider;
248-    // Pre-initialize Firebase to prevent popup block
249-    fetch('/firebase-applet-config.json').then(r => r.json()).then(config => {
250-      const app = !getApps().length ? initializeApp(config) : getApp();
251-      auth = getAuth(app);
252-      provider = new GoogleAuthProvider();
253-    }).catch(console.error);
254-
255-    let isSigningIn = false;
256-    googleLoginBtn.addEventListener('click', async () => {
257-      if (isSigningIn) return;
258-      isSigningIn = true;
259-      if (!auth || !provider) {
260-         showAuthMessage('Sistem belum siap', 'Harap tunggu sesaat hingga konfigurasi dimuat.');
261-         isSigningIn = false;
262-         return;
263-      }
264-      try {
265-        const result = await signInWithPopup(auth, provider);
266-        const credential = GoogleAuthProvider.credentialFromResult(result);
267-        const accessToken = await result.user.getIdToken();
268-
269-        if (!accessToken) throw new Error('No access token');
270-
271-        // Fetch roles from our backend
272-        const response = await fetch(`${apiBase}/v1/private/${encodeURIComponent(tenantSlug)}/me`, {
273-          headers: { Authorization: `Bearer ${accessToken}` }
274-        });
275-        
276-        const body = await response.json().catch(() => ({}));
277-        
278-        if (!response.ok) {
279-           showAuthMessage('Login gagal.', body.error || 'Akun tidak dikenali.');
280-           await auth.signOut();
281-           isSigningIn = false;
282-           return;
283-        }
284-
285-        const userRoles = body.user?.roles || ['wali']; // fallback default
286-        const requestedRole = roleInput.value;
287-        
288-        if (!userRoles.includes(requestedRole)) {
289-           showAuthMessage('Akses Ditolak', `Akun Anda tidak memiliki peran ${requestedRole}.`);
290-           await auth.signOut();
291-           isSigningIn = false;
292-           return;
293-        }
294-
295-        safeStorage('sessionStorage')?.setItem('dwj-ui-role', requestedRole);
296-        safeStorage('localStorage')?.setItem('dwj-ui-role', requestedRole);
297-        // Persist token for the frontend app
298-        safeStorage('localStorage')?.setItem('dwj-access-token', accessToken);
299-
300-        const destination = redirectTarget || roleDestinations[requestedRole];
301-        showAuthMessage('Login berhasil.', 'Mengarahkan...', `<a class="portal-link" href="${destination}">Buka portal &rarr;</a>`);
302-        window.location.href = destination;
303-
