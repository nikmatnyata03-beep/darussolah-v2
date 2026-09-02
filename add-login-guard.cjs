const fs = require('fs');
let code = fs.readFileSync('login.html', 'utf8');

const target = `    googleLoginBtn.addEventListener('click', async () => {`;
const replacement = `    let isSigningIn = false;
    googleLoginBtn.addEventListener('click', async () => {
      if (isSigningIn) return;
      isSigningIn = true;`;

code = code.replace(target, replacement);

const targetCatch = `           showAuthMessage('Login gagal.', body.error || 'Akun tidak dikenali.');
           await auth.signOut();
           return;
        }

        const userRoles = body.user?.roles || ['wali']; // fallback default`;

// We also need to unset isSigningIn at the end of the try catch
code = code.replace(
  `        safeStorage('localStorage')?.setItem('dwj-ui-role', requestedRole);
        // Persist token for the frontend app
        document.cookie = \`dwj_session=\${accessToken}; path=/; max-age=3600; SameSite=Lax\`;
        
        const destination = roleDestinations[requestedRole] || 'wali.html';
        window.location.replace(redirectTarget || destination);
      } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          showAuthMessage('Kesalahan', 'Gagal memproses otentikasi dengan Google.');
        }
      }
    });`,
  `        safeStorage('localStorage')?.setItem('dwj-ui-role', requestedRole);
        // Persist token for the frontend app
        document.cookie = \`dwj_session=\${accessToken}; path=/; max-age=3600; SameSite=Lax\`;
        
        const destination = roleDestinations[requestedRole] || 'wali.html';
        window.location.replace(redirectTarget || destination);
      } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          showAuthMessage('Kesalahan', 'Gagal memproses otentikasi dengan Google.');
        }
      } finally {
        isSigningIn = false;
      }
    });`
);

// We also need to unset isSigningIn if it early returns!
code = code.replace(`showAuthMessage('Sistem belum siap', 'Harap tunggu sesaat hingga konfigurasi dimuat.');
         return;`, `showAuthMessage('Sistem belum siap', 'Harap tunggu sesaat hingga konfigurasi dimuat.');
         isSigningIn = false;
         return;`);
code = code.replace(`await auth.signOut();
           return;`, `await auth.signOut();
           isSigningIn = false;
           return;`);
code = code.replace(`await auth.signOut();
           return;`, `await auth.signOut();
           isSigningIn = false;
           return;`);

fs.writeFileSync('login.html', code);
