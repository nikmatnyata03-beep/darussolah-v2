const fs = require('fs');
let code = fs.readFileSync('darussolah-admin.js', 'utf8');

const targetToReplace = `  async function loadAnalytics() {
    const summary = await api('admin/summary');
    const set = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
    set('studentTotal', summary.students_active ?? 0); set('admissionTotal', summary.registrations_pending ?? 0);
    const finance = await records('finance'); const income = (finance || []).filter(item => item.payload?.type !== 'invoice').reduce((sum, item) => sum + (Number(item.payload?.amount) || 0), 0); set('incomeTotal', fmtMoney(income));
    const attendance = summary.attendance_sessions_today ? 'Tercatat' : 'Belum ada'; set('attendanceTotal', attendance);
    const scope = document.getElementById('scopeSelect'); if (scope) { scope.innerHTML = '<option value="all">Seluruh yayasan</option>' + (state.classes || []).map(item => \`<option value="\${safe(item.id)}">\${safe(item.name)}</option>\`).join(''); }
  }`;

const replacement = `  async function loadAnalytics() {
    // Add loading states
    const panelHeaders = document.querySelectorAll('.panel-heading h2');
    panelHeaders.forEach(h2 => {
      if (['institutionHeading', 'admissionHeading', 'attendanceHeading', 'emisHeading'].includes(h2.id)) {
        h2.innerHTML += ' <span style="font-size:10px; color:var(--muted); font-weight:normal;" class="loading-state">(Memuat data...)</span>';
      }
    });

    try {
      const summary = await api('admin/summary');
      const set = (id, value) => { const node = document.getElementById(id); if (node) node.textContent = value; };
      set('studentTotal', summary.students_active ?? 0); set('admissionTotal', summary.registrations_pending ?? 0);
      const finance = await records('finance'); const income = (finance || []).filter(item => item.payload?.type !== 'invoice').reduce((sum, item) => sum + (Number(item.payload?.amount) || 0), 0); set('incomeTotal', fmtMoney(income));
      const attendanceSummary = summary.attendance_sessions_today ? 'Tercatat' : 'Belum ada'; set('attendanceTotal', attendanceSummary);
      const scope = document.getElementById('scopeSelect'); if (scope) { scope.innerHTML = '<option value="all">Seluruh yayasan</option>' + (state.classes || []).map(item => \`<option value="\${safe(item.id)}">\${safe(item.name)}</option>\`).join(''); }

      // Fetch dynamic statistics to replace hardcoded elements
      const stats = await api('admin/statistics');
      
      // Remove loading states
      document.querySelectorAll('.loading-state').forEach(el => el.remove());

      // 1. Tren Pendaftaran (Admissions)
      if (stats.admissions) {
        const admissionPeriod = document.getElementById('admissionPeriod');
        if (admissionPeriod) {
            admissionPeriod.textContent = stats.admissions.period;
            debugBind(admissionPeriod.closest('.panel'), 'admissions', stats.admissions);
        }
        
        const plotColumns = document.querySelector('.plot-columns');
        const xAxis = document.querySelector('.x-axis');
        if (plotColumns && xAxis) {
          plotColumns.innerHTML = stats.admissions.waves.map(wave => \`
            <div class="plot-column">
              <i class="plot-bar" style="height:\${wave.new}%"></i>
              <i class="plot-bar alt" style="height:\${wave.verified}%"></i>
            </div>
          \`).join('');
          xAxis.innerHTML = stats.admissions.waves.map(wave => \`<span>\${safe(wave.name)}</span>\`).join('');
        }
      }

      // 2. Tren Kehadiran (Attendance)
      if (stats.attendance) {
        const attendanceValue = document.getElementById('attendanceChartValue');
        if (attendanceValue) {
            attendanceValue.textContent = stats.attendance.current;
            const parent = attendanceValue.parentElement;
            if (parent) {
                const span = parent.querySelector('span');
                if (span) span.textContent = \`\${stats.attendance.trend} dibanding semester lalu\`;
            }
            debugBind(attendanceValue.closest('.panel'), 'attendance', stats.attendance);
        }
        const miniLineChart = document.querySelector('.mini-line-chart');
        if (miniLineChart && stats.attendance.history) {
            miniLineChart.innerHTML = stats.attendance.history.map(val => \`<i class="line-point" style="height:\${val}%"></i>\`).join('');
        }
      }

      // 3. Sebaran Santri (Institutions)
      if (stats.sebaran_santri) {
        const instList = document.querySelector('.institution-list');
        if (instList) {
          const totalSantri = stats.sebaran_santri.reduce((sum, inst) => sum + inst.count, 0) || 1;
          instList.innerHTML = stats.sebaran_santri.map(inst => \`
            <div class="institution-row">
              <div class="institution-copy">
                <span class="institution-mark">\${escapeHtml(inst.slug.substring(0,2).toUpperCase())}</span>
                <span><strong>\${escapeHtml(inst.name)}</strong><span>\${escapeHtml(inst.slug)}</span></span>
              </div>
              <b class="institution-total">\${inst.count}</b>
              <div class="bar-line"><i style="width:\${(inst.count / totalSantri) * 100}%"></i></div>
            </div>
          \`).join('');
          debugBind(instList.closest('.panel'), 'sebaran_santri', stats.sebaran_santri);
        }
      }

      // 4. EMIS
      if (stats.emis) {
        const emisPercent = document.getElementById('emisPercent');
        if (emisPercent) {
          emisPercent.textContent = stats.emis.ready_percent + '%';
          debugBind(emisPercent.closest('.emis-card'), 'emis', stats.emis);
          
          const emisTrack = document.querySelector('.emis-track i');
          if (emisTrack) emisTrack.style.width = stats.emis.ready_percent + '%';

          const emisList = document.querySelector('.emis-card .emis-list');
          if (emisList) {
            emisList.innerHTML = \`
              <div class="emis-row"><span>Data santri</span>\${stats.emis.students_ready ? '<strong class="ready">Lengkap</strong>' : '<strong>Perlu dilengkapi</strong>'}</div>
              <div class="emis-row"><span>Data guru</span>\${stats.emis.teachers_ready ? '<strong class="ready">Lengkap</strong>' : '<strong>Perlu dilengkapi</strong>'}</div>
              <div class="emis-row"><span>Data rombel & jadwal</span>\${stats.emis.classes_ready ? '<strong class="ready">Lengkap</strong>' : \`<strong>Perlu \${stats.emis.missing_count} data</strong>\`}</div>
            \`;
          }
        }
      }

    } catch (e) {
      document.querySelectorAll('.loading-state').forEach(el => el.textContent = '(Gagal memuat)');
      toast('Gagal memuat analitik', e.message);
    }
  }`;

code = code.replace(targetToReplace, replacement);
fs.writeFileSync('darussolah-admin.js', code);
