const fs = require('fs');
let code = fs.readFileSync('analitik.html', 'utf8');

const newScript = `
window.addEventListener('darussolah:ready', async () => {
    try {
        const portal = window.DarussolahPortal;
        if (!portal || !portal.session) return;
        
        const res = await portal.fetchPrivate(null, 'admin/statistics', portal.session);
        if (res && res.items) {
            // Update total active students
            let totalStudents = 0;
            res.items.forEach(inst => totalStudents += inst.count);
            const totalEl = document.querySelector('#kpi-active');
            if (totalEl) totalEl.textContent = totalStudents;
            
            // Update institution list
            const instList = document.querySelector('.institution-list');
            if (instList) {
                instList.innerHTML = res.items.map(inst => {
                    const pct = totalStudents > 0 ? (inst.count / totalStudents * 100).toFixed(0) : 0;
                    return \\\`<div class="institution-row">
                        <div class="institution-copy">
                            <span class="institution-mark">\${inst.slug.substring(0,2).toUpperCase()}</span>
                            <span><strong>\${inst.name}</strong><span>Unit \${inst.slug.toUpperCase()}</span></span>
                        </div>
                        <b class="institution-total">\${inst.count}</b>
                        <div class="bar-line"><i style="width:\${pct}%"></i></div>
                    </div>\\\`;
                }).join('');
            }
        }
    } catch(e) {
        console.error('Failed to load statistics', e);
    }
});`;

// Insert the new logic right before `let toastTimer;`
code = code.replace(/let toastTimer;/g, newScript.trim() + '\n    let toastTimer;');
fs.writeFileSync('analitik.html', code);
console.log('Analitik fully fixed');
