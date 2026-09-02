const fs = require('fs');
let code = fs.readFileSync('pengaturan.html', 'utf8');

const targetToInsert = `<div class="setting-row"><span class="setting-icon">◒</span><span class="setting-copy"><strong>Kontras tinggi</strong><span>Perjelas batas elemen untuk kebutuhan visual.</span></span><button class="toggle" id="contrastToggle" type="button" aria-label="Aktifkan kontras tinggi"></button></div>`;
const replacement = targetToInsert + `\n<div class="setting-row"><span class="setting-icon">⚙</span><span class="setting-copy"><strong>Debug Mode</strong><span>Tampilkan data mentah API di atas UI untuk pengujian.</span></span><button class="toggle" id="debugToggle" type="button" aria-label="Aktifkan debug mode"></button></div>`;

code = code.replace(targetToInsert, replacement);

const scriptTarget1 = `document.getElementById('contrastToggle').addEventListener('click',()=>{document.body.classList.toggle('high-contrast');const high=document.body.classList.contains('high-contrast');document.getElementById('contrastToggle').classList.toggle('on',high);document.getElementById('accessStatus').textContent=high?'Kontras tinggi':'Standar';showToast(high?'Kontras tinggi aktif':'Kontras standar aktif','Kontras tampilan sudah diperbarui.');});`;
const scriptReplacement1 = scriptTarget1 + `\n    document.getElementById('debugToggle').addEventListener('click',()=>{document.body.classList.toggle('debug-mode');const debug=document.body.classList.contains('debug-mode');document.getElementById('debugToggle').classList.toggle('on',debug);showToast(debug?'Debug mode aktif':'Debug mode dimatikan','Data mentah API akan terlihat pada elemen data bind.');});`;

code = code.replace(scriptTarget1, scriptReplacement1);

const prefSaveTarget = `contrast:document.body.classList.contains('high-contrast')}));}catch(error){}};`;
const prefSaveReplacement = `contrast:document.body.classList.contains('high-contrast'),debug:document.body.classList.contains('debug-mode')}));}catch(error){}};`;

code = code.replace(prefSaveTarget, prefSaveReplacement);

const prefSyncTarget = `const contrast=document.body.classList.contains('high-contrast');`;
const prefSyncReplacement = `const contrast=document.body.classList.contains('high-contrast');const debug=document.body.classList.contains('debug-mode');`;

code = code.replace(prefSyncTarget, prefSyncReplacement);

const prefSyncControlTarget = `document.getElementById('contrastToggle').classList.toggle('on',contrast);`;
const prefSyncControlReplacement = prefSyncControlTarget + `\ndocument.getElementById('debugToggle').classList.toggle('on',debug);`;

code = code.replace(prefSyncControlTarget, prefSyncControlReplacement);

const ariaSyncTarget = `document.getElementById('contrastToggle').setAttribute('aria-pressed',String(contrast));`;
const ariaSyncReplacement = ariaSyncTarget + `\ndocument.getElementById('debugToggle').setAttribute('aria-pressed',String(debug));`;

code = code.replace(ariaSyncTarget, ariaSyncReplacement);

const initialLoadTarget = `document.body.classList.toggle('high-contrast',preferences.contrast===true);`;
const initialLoadReplacement = initialLoadTarget + `\ndocument.body.classList.toggle('debug-mode',preferences.debug===true);`;

code = code.replace(initialLoadTarget, initialLoadReplacement);

const arrayBindTarget = `['themeToggle','textToggle','contrastToggle','resetView']`;
const arrayBindReplacement = `['themeToggle','textToggle','contrastToggle','debugToggle','resetView']`;

code = code.replace(arrayBindTarget, arrayBindReplacement);

fs.writeFileSync('pengaturan.html', code);
