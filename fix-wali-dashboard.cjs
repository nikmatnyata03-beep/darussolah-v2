const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

// Replace the /wali/dashboard/:student_id route
const dashboardRegex = /app\.get\('\/v1\/private\/:tenant_slug\/wali\/dashboard\/:student_id', requireAuth, async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Internal Server Error' \}\);\s*\}\s*\}\);/g;

const newDashboardRoute = `app.get('/v1/private/:tenant_slug/wali/dashboard/:student_id', requireAuth, async (req, res) => {
  try {
    const studentId = parseInt(req.params.student_id);
    
    // Invoices
    const invData = await db.select().from(invoices).where(eq(invoices.studentId, studentId));
    // Progress
    const progData = await db.select().from(studentProgress).where(eq(studentProgress.studentId, studentId));
    
    // Calculate attendance from adminRecords
    const attendanceRecords = await db.select().from(adminRecords).where(eq(adminRecords.module, 'attendance'));
    let presentCount = 0;
    
    attendanceRecords.forEach(record => {
      const payload = record.payload || {};
      const records = payload.records || [];
      const studentRec = records.find(r => r.uid === studentId.toString());
      if (studentRec && studentRec.status === 'hadir') {
        presentCount++;
      }
    });
    
    res.json({
      invoices: decamelize(invData),
      progress: decamelize(progData),
      attendance: { presentCount }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});`;

if (dashboardRegex.test(serverCode)) {
  serverCode = serverCode.replace(dashboardRegex, newDashboardRoute);
  fs.writeFileSync('server.ts', serverCode);
  console.log("Dashboard route replaced successfully.");
} else {
  console.log("Dashboard route not found!");
}

// Modify wali.html to use this response
let html = fs.readFileSync('wali.html', 'utf8');
const loadDashboardRegex = /const attendanceData = window\.DarussolahPortal\?\.attendance;[\s\S]*?document\.getElementById\('attendanceFoot'\)\.textContent = 'Belum ada data';\s*\}/g;

const newAttendanceLogic = `const presentCount = res.attendance?.presentCount || 0;
          document.getElementById('attendanceValue').textContent = presentCount + ' hari';
          document.getElementById('attendanceFoot').textContent = 'Kehadiran tercatat';
          document.getElementById('attendanceDetail').textContent = presentCount + ' Kehadiran';
          document.querySelector('.attendance-rate').textContent = (presentCount > 0 ? 'Aktif' : '-');`;

if (loadDashboardRegex.test(html)) {
  html = html.replace(loadDashboardRegex, newAttendanceLogic);
  fs.writeFileSync('wali.html', html);
  console.log("wali.html replaced successfully.");
} else {
  console.log("wali.html logic not found!");
}
