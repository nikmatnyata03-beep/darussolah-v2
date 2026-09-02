const fs = require('fs');
let code = fs.readFileSync('wali.html', 'utf8');

const targetToReplace = `      window.addEventListener('darussolah:ready', (event) => {
        const { profile, students, classes } = event.detail;`;

const replacement = `      window.addEventListener('darussolah:ready', (event) => {
        const { profile, students, classes, attendance, learning, learningSubmissions } = event.detail;
        
        // Handle attendance for Wali
        if (attendance && attendance.items && students.length > 0) {
          const studentId = students[0].id;
          const records = attendance.items;
          const myAttendance = records.filter(r => r.student_id === studentId);
          const present = myAttendance.filter(r => r.status === 'present').length;
          
          const attendValue = document.getElementById('attendanceValue');
          const attendFoot = document.getElementById('attendanceFoot');
          const attendDetail = document.getElementById('attendanceDetail');
          const attendRate = document.querySelector('.attendance-rate');
          const dataChip = document.querySelector('#kehadiran .data-chip');
          const weekStrip = document.querySelector('.week-strip');
          
          if (attendValue) attendValue.textContent = present + ' hari';
          if (attendFoot) attendFoot.textContent = records.length ? 'Bulan ini' : 'Belum ada data';
          if (attendDetail) attendDetail.textContent = present + ' hari hadir';
          if (attendRate) attendRate.textContent = myAttendance.length ? Math.round((present / myAttendance.length) * 100) + '%' : '0%';
          if (dataChip) dataChip.textContent = 'Data Live';
          
          if (weekStrip) {
            weekStrip.innerHTML = myAttendance.slice(0, 7).map(r => 
              \`<div class="day \${r.status === 'present' ? 'present' : r.status === 'sick' ? 'sick' : 'absent'}">
                <span>\${new Date(r.attendance_date || new Date()).toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                <strong>\${new Date(r.attendance_date || new Date()).getDate()}</strong>
              </div>\`
            ).join('');
          }
        }
        
        // Handle Tasks
        if (learning && students.length > 0) {
          const studentId = students[0].id;
          const assignments = learning.filter(l => l.resource_type === 'assignment');
          const submittedIds = (learningSubmissions || []).filter(s => s.student_id === studentId).map(s => s.resource_id);
          const activeTasks = assignments.filter(a => !submittedIds.includes(a.id)).length;
          
          const taskValue = document.getElementById('taskValue');
          const taskFoot = document.getElementById('taskFoot');
          if (taskValue) taskValue.textContent = activeTasks;
          if (taskFoot) taskFoot.textContent = activeTasks > 0 ? 'Tugas belum dikerjakan' : 'Semua tuntas';
        }
        `;

code = code.replace(targetToReplace, replacement);
fs.writeFileSync('wali.html', code);
