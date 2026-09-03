import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './src/middleware/auth.ts';
import { resolveTenant } from './src/middleware/tenant.ts';
import { db } from './src/db/index.ts';
import { attendance, registrations, foundations, institutions, posts, users, learningSubmissions, students, staff, content, adminRecords, invoices, studentProgress, leaveRequests, feedbacks } from './src/db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.get('/api/fix-db', async (req, res) => {
  try {
    const { sql } = await import('drizzle-orm');
    await db.execute(sql`ALTER TABLE staff DROP COLUMN institution_id;`);
    res.send('Dropped');
  } catch(e) {
    res.send(e.message);
  }
});

const PORT = 3000;

app.use(express.json());

// Public endpoints
app.get('/v1/public/:tenant_slug/foundation', async (req, res) => {
  try {
    const data = await db.select().from(foundations).where(eq(foundations.slug, req.params.tenant_slug)).limit(1);
    if (!data.length) return res.status(404).json({ error: 'Foundation not found' });
    const row = data[0];
    res.json({ id: row.id, name: row.name, description: row.description, logo_url: row.logoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/public/:tenant_slug/institutions', async (req, res) => {
  try {
    const data = await db.select().from(institutions);
    res.json({
      items: data.map(row => ({ id: row.id, slug: row.slug, name: row.name, logo_url: row.logoUrl, description: row.description }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/public/:tenant_slug/institutions/:institution_slug', async (req, res) => {
  try {
    const { institution_slug } = req.params;
    const data = await db.select().from(institutions).where(eq(institutions.slug, institution_slug)).limit(1);
    if (!data.length) return res.status(404).json({ error: 'Institution not found' });
    const row = data[0];
    res.json({ id: row.id, slug: row.slug, name: row.name, description: row.description, logo_url: row.logoUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/public/:tenant_slug/posts', async (req, res) => {
  try {
    const items = await db.select({
      id: posts.id,
      title: posts.title,
      excerpt: posts.excerpt,
      postType: posts.postType,
      publishedAt: posts.publishedAt,
      institutionSlug: institutions.slug,
      institutionName: institutions.name
    })
    .from(posts)
    .leftJoin(institutions, eq(posts.institutionId, institutions.id))
    .orderBy(desc(posts.publishedAt))
    .limit(10);
    
    res.json({
      items: items.map(p => ({
        id: p.id,
        post_type: p.postType,
        title: p.title,
        excerpt: p.excerpt,
        published_at: p.publishedAt,
        institution_slug: p.institutionSlug,
        institution_name: p.institutionName || 'Yayasan Darussolah'
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/public/:tenant_slug/institutions/:institution_slug/posts', async (req, res) => {
  try {
    const { institution_slug } = req.params;
    const institution = await db.select().from(institutions).where(eq(institutions.slug, institution_slug)).limit(1);
    if (!institution.length) return res.status(404).json({ error: 'Institution not found' });

    const items = await db.select().from(posts).where(eq(posts.institutionId, institution[0].id));
    res.json({
      items: items.map(p => ({
        post_type: p.postType,
        title: p.title,
        excerpt: p.excerpt,
        published_at: p.publishedAt
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/public/:tenant_slug/registrations', async (req, res) => {
  try {
    const { 
      institution_id, 
      registration_type, 
      academic_year, 
      student_full_name, 
      birth_place,
      birth_date,
      gender,
      address,
      father_name,
      mother_name,
      father_phone, 
      mother_phone,
      documents,
      notes
    } = req.body;
    
    // Generate a simple application number
    const applicationNo = "REG-" + Math.floor(Math.random() * 1000000);
    
    const result = await db.insert(registrations).values({
      institutionId: parseInt(institution_id?.toString().replace(/\D/g, '') || '0') || null,
      registrationType: registration_type,
      academicYear: academic_year || '2026/2027',
      studentFullName: student_full_name,
      birthPlace: birth_place,
      birthDate: birth_date,
      gender: gender,
      address: address,
      fatherName: father_name,
      motherName: mother_name,
      fatherPhone: father_phone,
      motherPhone: mother_phone,
      documents: JSON.stringify(documents || []),
      notes,
      applicationNo,
      status: 'pending'
    }).returning();
    
    res.status(201).json({
      id: result[0].id,
      application_no: result[0].applicationNo,
      status: result[0].status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Private endpoints (Protected by Firebase Auth middleware)
app.get('/v1/private/:tenant_slug/me', requireAuth, resolveTenant, async (req, res) => {
  try {
    // (req as any).user comes from firebase adminAuth via requireAuth middleware
    
    const decodedUser = (req as any).user;
    let foundUsers = await db.select().from(users).where(eq(users.uid, decodedUser.uid)).limit(1);
    
    // Auto-provision admin
    if (decodedUser.email === 'nikmatnyata03@gmail.com') {
      if (foundUsers.length === 0) {
        // Maybe exists by email?
        const byEmail = await db.select().from(users).where(eq(users.email, decodedUser.email)).limit(1);
        if (byEmail.length > 0) {
          await db.update(users).set({ uid: decodedUser.uid, roles: ['admin', 'guru', 'wali'] }).where(eq(users.id, byEmail[0].id));
          foundUsers = await db.select().from(users).where(eq(users.uid, decodedUser.uid)).limit(1);
        } else {
          await db.insert(users).values({ uid: decodedUser.uid, email: decodedUser.email, roles: ['admin', 'guru', 'wali'] });
          foundUsers = await db.select().from(users).where(eq(users.uid, decodedUser.uid)).limit(1);
        }
      } else {
        const u = foundUsers[0];
        if (!u.roles.includes('admin')) {
          await db.update(users).set({ roles: ['admin', 'guru', 'wali'] }).where(eq(users.id, u.id));
          foundUsers[0].roles = ['admin', 'guru', 'wali'];
        }
      }
    }
    
    const userRecord = foundUsers[0];

    
    const foundationData = await db.select().from(foundations).where(eq(foundations.slug, req.params.tenant_slug)).limit(1);
    const tenantName = foundationData.length ? foundationData[0].name : "Darussolah";
    const tenantId = foundationData.length ? foundationData[0].id : 1;

    res.json({
      tenant: { id: tenantId, name: tenantName },
      user: { user_id: userRecord?.id, uid: userRecord?.uid, email: userRecord?.email, display_name: (req as any).user.name || (req as any).user.email, roles: userRecord?.roles || ['wali'] }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/attendance', requireAuth, resolveTenant, async (req, res) => {
  try {
    const classId = req.query.class_id;
    const date = req.query.attendance_date;
    const recordKey = `${classId}:${date}`;
    const data = await db.select().from(adminRecords).where(
      and(eq(adminRecords.module, 'attendance'), eq(adminRecords.recordKey, recordKey))
    ).limit(1);
    
    if (data.length) {
      res.json(decamelize(data[0].payload));
    } else {
      res.json({ records: [], close_session: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/v1/private/:tenant_slug/attendance', requireAuth, resolveTenant, async (req, res) => {
  try {
    const payload = camelize(req.body);
    const classId = payload.classId;
    const date = payload.attendanceDate;
    const recordKey = `${classId}:${date}`;
    
    const existing = await db.select().from(adminRecords).where(
      and(eq(adminRecords.module, 'attendance'), eq(adminRecords.recordKey, recordKey))
    ).limit(1);
    
    if (existing.length) {
      await db.update(adminRecords)
        .set({ payload: req.body })
        .where(eq(adminRecords.id, existing[0].id));
    } else {
      await db.insert(adminRecords).values({
        module: 'attendance',
        recordKey: recordKey,
        payload: req.body
      });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.put('/v1/private/:tenant_slug/learning/submissions/:id', requireAuth, resolveTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await db.select().from(adminRecords).where(eq(adminRecords.id, id)).limit(1);
    if (!existing.length) {
      return res.status(404).json({ error: 'Not Found' });
    }
    const updatedPayload = { ...existing[0].payload, ...req.body };
    await db.update(adminRecords).set({ payload: updatedPayload }).where(eq(adminRecords.id, id));
    res.json({ success: true, item: updatedPayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/learning/submissions', requireAuth, resolveTenant, async (req, res) => {
  try {
    const { resource_id, student_id, file_path, note } = req.body;
    
    if (!resource_id || !student_id) {
      return res.status(400).json({ error: 'resource_id and student_id are required' });
    }

    const result = await db.insert(learningSubmissions)
      .values({
        resourceId: resource_id,
        studentId: student_id,
        filePath: file_path,
        note: note,
      })
      .returning();
      
    res.status(201).json(decamelize(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



function camelize(obj: any): any {
  if (Array.isArray(obj)) return obj.map(camelize);
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const newKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        result[newKey] = camelize(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

function decamelize(obj: any): any {
  if (Array.isArray(obj)) return obj.map(decamelize);
  if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const newKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[newKey] = decamelize(obj[key]);
      }
    }
    return result;
  }
  return obj;
}


app.get('/v1/private/:tenant_slug/students', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(students).where(eq(students.institutionId, req.tenantId));
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/classes', requireAuth, resolveTenant, async (req, res) => {
  try {
    // For now, return a default list or an empty list so it doesn't break.
    // In a full implementation, you'd have a classes table. We'll simulate a TPQ class to satisfy the UI.
    res.json({ items: [{ id: 'class-tpq-1', institution_code: 'TPQ', name: 'Al-Fatih', code: 'A1' }] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/learning', requireAuth, resolveTenant, async (req, res) => { res.json({ items: [] }); });
app.get('/v1/private/:tenant_slug/learning/submissions', requireAuth, resolveTenant, async (req, res) => { res.json({ items: [] }); });
app.post('/v1/private/:tenant_slug/learning', requireAuth, resolveTenant, async (req, res) => {
  try {
    const payload = camelize(req.body);
    // Dummy insert to adminRecords just to store it for now
    await db.insert(adminRecords).values({
      module: 'learning',
      recordKey: `${payload.classId || 'default'}:${Date.now()}`,
      payload: req.body
    });
    res.json({ success: true, item: req.body });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/v1/private/:tenant_slug/learning/submissions', requireAuth, resolveTenant, async (req, res) => {
  try {
    const payload = camelize(req.body);
    const result = await db.insert(adminRecords).values({
      module: 'submissions',
      recordKey: `${payload.resourceId || 'unknown'}:${payload.studentId || 'unknown'}:${Date.now()}`,
      payload: req.body
    }).returning();
    res.json({ success: true, item: { id: result[0].id, ...req.body } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// --- Wali Endpoints ---
app.get('/v1/private/:tenant_slug/wali/dashboard/:student_id', requireAuth, resolveTenant, async (req, res) => {
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
      const payload: any = (record.payload as any) || {};
      const records = payload.records || [];
      const studentRec = records.find((r: any) => r.uid === studentId.toString());
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
});

app.post('/v1/private/:tenant_slug/wali/leave', requireAuth, resolveTenant, async (req, res) => {
  try {
    const payload = camelize(req.body);
    if (payload.studentId) {
       payload.studentId = parseInt(payload.studentId);
    }
    const result = await db.insert(leaveRequests).values(payload).returning();
    res.status(201).json(decamelize(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/wali/feedback', requireAuth, resolveTenant, async (req, res) => {
  try {
    const payload = camelize(req.body);
    const result = await db.insert(feedbacks).values(payload).returning();
    res.status(201).json(decamelize(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/posts', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(posts);
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/documents', requireAuth, resolveTenant, async (req, res) => {
  try {
    // just returning content that might be documents
    const data = await db.select().from(content).where(eq(content.contentType, 'document'));
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/v1/private/:tenant_slug/attendance', requireAuth, resolveTenant, async (req, res) => {
  try {
    const { class_id, attendance_date, records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid records' });
    }
    
    // Convert to our attendance schema
    const values = records.map(r => ({
      uid: r.student_id.toString(), // The frontend sends student_id as uid here
      date: attendance_date,
      status: r.status
    }));

    // In a real production app we would do an UPSERT here. 
    // Since this is a simple schema, we just insert.
    await db.insert(attendance).values(values);

    res.json({ success: true, count: values.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/v1/private/:tenant_slug/admin/progress', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(studentProgress).where(eq(studentProgress.institutionId, req.tenantId));
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/progress', requireAuth, resolveTenant, async (req, res) => {
  try {
    const { student_id, type, current_value, target, notes, status } = req.body;
    
    // Convert to schema
    const val = {
      studentId: parseInt(student_id),
      currentValue: current_value || type, // save type in currentValue if needed, or target
      target: target,
      notes: notes || (status ? 'Status: ' + status : '')
    };

    await db.insert(studentProgress).values(val);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/v1/private/:tenant_slug/admin/invoices', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(invoices).where(eq(invoices.institutionId, req.tenantId));
    // Also fetch students so we can map names
    const stdData = await db.select().from(students);
    const enriched = data.map(inv => {
      const st = stdData.find(s => s.id === inv.studentId);
      return {
        ...inv,
        student_name: st ? st.fullName : 'Santri tidak diketahui'
      };
    });
    res.json({ items: decamelize(enriched) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/invoices', requireAuth, resolveTenant, async (req, res) => {
  try {
    const { student_id, type, amount, status, notes } = req.body;
    
    
    await db.insert(invoices).values({
      studentId: parseInt(student_id) || 1,
      amount: 'Rp ' + (amount ? Number(amount).toLocaleString('id-ID') : '0'),
      status: status || 'unpaid',
    institutionId: req.tenantId});

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/v1/private/:tenant_slug/admin/broadcasts', requireAuth, resolveTenant, async (req, res) => {
  try {
    const { target, mode, channel, title, message } = req.body;
    
    await db.insert(posts).values({
      title: title,
      postType: 'broadcast',
      excerpt: message || (mode + ' via ' + channel + ' to ' + target),
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- Admin Endpoints ---

app.get('/v1/private/:tenant_slug/admin/records', requireAuth, resolveTenant, async (req, res) => {
  try {
    const moduleName = req.query.module;
    let query: any = db.select().from(adminRecords);
    if (moduleName) {
      query = query.where(eq(adminRecords.module, String(moduleName)));
    }
    const data = await query;
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/records', requireAuth, resolveTenant, async (req, res) => {
  try {
    const payload = camelize(req.body);
    const result = await db.insert(adminRecords).values(payload).returning();
    res.status(201).json(decamelize(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/v1/private/:tenant_slug/admin/records/:id', requireAuth, resolveTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.update(adminRecords)
      .set(camelize(req.body))
      .where(eq(adminRecords.id, id))
      .returning();
    res.json(decamelize(result[0] || {}));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/students', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(students);
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/students', requireAuth, resolveTenant, async (req, res) => {
  try {
    const result = await db.insert(students).values({ ...camelize(req.body), institutionId: req.tenantId }).returning();
    res.status(201).json(decamelize(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/staff', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(staff).where(eq(staff.institutionId, req.tenantId));
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/staff', requireAuth, resolveTenant, async (req, res) => {
  try {
    const result = await db.insert(staff).values({ ...camelize(req.body), institutionId: req.tenantId }).returning();
    res.status(201).json(decamelize(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/content', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(content);
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/content', requireAuth, resolveTenant, async (req, res) => {
  try {
    const result = await db.insert(content).values(camelize(req.body)).returning();
    res.status(201).json(decamelize(result[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/v1/private/:tenant_slug/admin/content/:id', requireAuth, resolveTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await db.update(content).set(camelize(req.body)).where(eq(content.id, id)).returning();
    res.json(decamelize(result[0] || {}));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/statistics', requireAuth, resolveTenant, async (req, res) => {
  try {
    const stdData = await db.select().from(students);
    const institutionsData = await db.select().from(institutions);
    
    const byInstitution = institutionsData.map(inst => {
      return {
        id: inst.id,
        slug: inst.slug,
        name: inst.name,
        count: stdData.length // mock until class mapping is done
      };
    });
    
    // Simulate some admissions data for the trend chart
    const admissions = {
      period: '2026 / 2027',
      waves: [
        { name: 'Gel. 1', new: 45, verified: 30 },
        { name: 'Gel. 2', new: 60, verified: 40 },
        { name: 'Gel. 3', new: 80, verified: 55 },
        { name: 'Gel. 4', new: 65, verified: 50 },
      ]
    };
    
    // Simulate attendance trend
    const attendance = {
      target: '≥ 90%',
      current: '93.8%',
      trend: '+2.1%',
      history: [52, 59, 57, 68, 76, 88]
    };
    
    // Simulate emis readiness
    const emis = {
      ready_percent: 86,
      students_ready: true,
      teachers_ready: true,
      classes_ready: false,
      missing_count: 4
    };

    res.json({
      sebaran_santri: byInstitution,
      admissions,
      attendance,
      emis
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/summary', requireAuth, resolveTenant, async (req, res) => {
  try {
    const stdData = await db.select().from(students);
    const stfData = await db.select().from(staff);
    res.json({
      students_total: stdData.length,
      teachers_active: stfData.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/v1/private/:tenant_slug/admin/export', requireAuth, resolveTenant, async (req, res) => {
  try {
    const stdData = await db.select().from(students);
    const stfData = await db.select().from(staff);
    const recData = await db.select().from(adminRecords);
    const cntData = await db.select().from(content);
    res.json({
      timestamp: new Date().toISOString(),
      students: decamelize(stdData),
      staff: decamelize(stfData),
      records: decamelize(recData),
      content: decamelize(cntData)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// --- Visual Builder Endpoints ---
const BACKUP_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR);
}

app.post('/api/page/save', express.json({limit: '50mb'}), (req, res) => {
  try {
    const { html, pathname } = req.body;
    if (!html) return res.status(400).json({error: 'No HTML provided'});
    
    let filename = 'index.html';
    if (pathname && (pathname.includes('/tpq') || pathname.includes('/mdt') || pathname.includes('/ra') || pathname.includes('/rtq'))) {
      if (pathname.includes('pendaftaran.html')) filename = 'tenant-pendaftaran.html';
      else filename = 'tenant-landing.html';
    }
    
    const indexPath = path.join(__dirname, filename);
    
    // Create backup
    if (fs.existsSync(indexPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(indexPath, path.join(BACKUP_DIR, `${filename}-${timestamp}.html`));
    }
    
    // Save new html
    fs.writeFileSync(indexPath, html, 'utf8');
    res.json({success: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to save page'});
  }
});

app.get('/api/page/backups', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.startsWith('index-') && f.endsWith('.html'));
    // Sort descending by timestamp
    files.sort((a, b) => b.localeCompare(a));
    res.json({ backups: files });
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to list backups'});
  }
});


app.post('/api/tenant/save-content', express.json(), (req, res) => {
  try {
    const { tenant_slug, key, value } = req.body; // key e.g. 'quote' or 'about'
    if (!tenant_slug || !key || !value) return res.status(400).json({error: 'Missing data'});
    
    const jsPath = path.join(__dirname, 'darussolah-institution-site.js');
    let js = fs.readFileSync(jsPath, 'utf8');
    
    // Simple replacement for SITES
    // SITES looks like: tpq: {name:'...', slug:'tpq', type:'...', quote:'...', about:'...',
    const regex = new RegExp(`(${tenant_slug}:\\s*\\{[^}]*?${key}:\\s*')([^']*)(')`);
    if (regex.test(js)) {
      js = js.replace(regex, (match, p1, p2, p3) => p1 + value.replace(/'/g, "\\'") + p3);
      fs.writeFileSync(jsPath, js, 'utf8');
      return res.json({success: true});
    }
    res.status(404).json({error: 'Key not found in JS dictionary'});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to save script'});
  }
});

app.post('/api/page/restore', express.json(), (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({error: 'No filename provided'});
    
    const backupPath = path.join(BACKUP_DIR, filename);
    const indexPath = path.join(__dirname, 'index.html');
    
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({error: 'Backup not found'});
    }
    
    // Backup current before restoring
    if (fs.existsSync(indexPath)) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      fs.copyFileSync(indexPath, path.join(BACKUP_DIR, `index-${timestamp}-prerestore.html`));
    }
    
    fs.copyFileSync(backupPath, indexPath);
    res.json({success: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({error: 'Failed to restore backup'});
  }
});

// Serve static frontend files
app.use(express.static(__dirname));


// Middleware to detect subdomain
app.use((req, res, next) => {
  const host = req.headers.host || '';
  const match = host.match(/^(tpq|mdt|ra|rtq)\./i);
  if (match) {
    req.tenant_subdomain = match[1].toLowerCase();
  }
  next();
});

// Dynamic Sub-Path Routing for Frontends (e.g., /tpq/santri.html)
app.get('/:tenant_slug([a-z0-9-]+)/:page([a-z0-9-]+\\.html)', (req, res, next) => {
  const { tenant_slug, page } = req.params;
  if (tenant_slug === 'v1' || tenant_slug === 'api') return next();
  
  let filePath = path.join(__dirname, page);
  if (page === 'index.html') filePath = path.join(__dirname, 'tenant-landing.html');
  if (page === 'pendaftaran.html') filePath = path.join(__dirname, 'tenant-pendaftaran.html');

  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf8');
    if (!html.includes('darussolah-tenant-slug')) {
      html = html.replace('</head>', `<meta name="darussolah-tenant-slug" content="${tenant_slug}"></head>`);
    }
    html = html.replace('data-institution="REPLACE_TENANT"', `data-institution="${tenant_slug}"`);
    res.send(html);
  } else {
    next();
  }
});

app.get('/:tenant_slug([a-z0-9-]+)/?', (req, res, next) => {
  const { tenant_slug } = req.params;
  if (tenant_slug === 'v1' || tenant_slug === 'api') return next();

  let filePath = path.join(__dirname, 'tenant-landing.html');
  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf8');
    if (!html.includes('darussolah-tenant-slug')) {
      html = html.replace('</head>', `<meta name="darussolah-tenant-slug" content="${tenant_slug}"></head>`);
    }
    html = html.replace('data-institution="REPLACE_TENANT"', `data-institution="${tenant_slug}"`);
    res.send(html);
  } else {
    next();
  }
});
// Fallback routing handling subdomains
app.get('*', (req, res) => {
  if (req.tenant_subdomain) {
    let filePath = path.join(__dirname, 'tenant-landing.html');
    if (req.path === '/pendaftaran.html') filePath = path.join(__dirname, 'tenant-pendaftaran.html');
    
    if (fs.existsSync(filePath)) {
      let html = fs.readFileSync(filePath, 'utf8');
      if (!html.includes('darussolah-tenant-slug')) {
        html = html.replace('</head>', `<meta name="darussolah-tenant-slug" content="${req.tenant_subdomain}"></head>`);
      }
      html = html.replace(/data-institution="[^"]*"/g, `data-institution="${req.tenant_subdomain}"`);
      return res.send(html);
    }
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
