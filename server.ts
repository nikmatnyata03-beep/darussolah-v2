import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './src/middleware/auth.ts';
import { resolveTenant } from './src/middleware/tenant.ts';
import { errorHandler, notFoundHandler, asyncHandler, ValidationError } from './src/middleware/error-handler.ts';
import { sanitizeString, validateRequiredFields, isValidEmail, isValidPhone, isValidDate, isValidIntegerId } from './src/lib/validation.ts';
import { db } from './src/db/index.ts';
import { attendance, registrations, foundations, institutions, posts, users, learningSubmissions, students, staff, content, adminRecords, invoices, studentProgress, leaveRequests, feedbacks } from './src/db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Apply global error handler AFTER all routes
app.use(errorHandler);

// Public endpoints
app.get('/v1/public/:tenant_slug/foundation', asyncHandler(async (req, res) => {
  const tenantSlug = sanitizeString(req.params.tenant_slug);
  if (!tenantSlug) {
    throw new ValidationError('Tenant slug is required');
  }
  
  const data = await db.select().from(foundations).where(eq(foundations.slug, tenantSlug)).limit(1);
  if (!data.length) {
    throw new ValidationError('Foundation not found', 'tenant_slug');
  }
  const row = data[0];
  res.json({ id: row.id, name: row.name, description: row.description, logo_url: row.logoUrl });
}));

app.get('/v1/public/:tenant_slug/institutions', asyncHandler(async (req, res) => {
  const tenantSlug = sanitizeString(req.params.tenant_slug);
  if (!tenantSlug) {
    throw new ValidationError('Tenant slug is required');
  }
  
  const data = await db.select().from(institutions).where(eq(institutions.slug, tenantSlug));
  res.json({
    items: data.map(row => ({ id: row.id, slug: row.slug, name: row.name, logo_url: row.logoUrl, description: row.description }))
  });
}));

app.get('/v1/public/:tenant_slug/institutions/:institution_slug', asyncHandler(async (req, res) => {
  const tenantSlug = sanitizeString(req.params.tenant_slug);
  const institutionSlug = sanitizeString(req.params.institution_slug);
  
  if (!tenantSlug || !institutionSlug) {
    throw new ValidationError('Tenant and institution slugs are required');
  }
  
  const data = await db.select().from(institutions).where(eq(institutions.slug, institutionSlug)).limit(1);
  if (!data.length) {
    throw new ValidationError('Institution not found', 'institution_slug');
  }
  const row = data[0];
  res.json({ id: row.id, slug: row.slug, name: row.name, description: row.description, logo_url: row.logoUrl });
}));

app.get('/v1/public/:tenant_slug/posts', asyncHandler(async (req, res) => {
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
}));

app.get('/v1/public/:tenant_slug/institutions/:institution_slug/posts', asyncHandler(async (req, res) => {
  const institutionSlug = sanitizeString(req.params.institution_slug);
  
  if (!institutionSlug) {
    throw new ValidationError('Institution slug is required');
  }
  
  const institution = await db.select().from(institutions).where(eq(institutions.slug, institutionSlug)).limit(1);
  if (!institution.length) {
    throw new ValidationError('Institution not found', 'institution_slug');
  }

  const items = await db.select().from(posts).where(eq(posts.institutionId, institution[0].id));
  res.json({
    items: items.map(p => ({
      post_type: p.postType,
      title: p.title,
      excerpt: p.excerpt,
      published_at: p.publishedAt
    }))
  });
}));

app.post('/v1/public/:tenant_slug/registrations', asyncHandler(async (req, res) => {
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
  
  // Validate required fields
  const validation = validateRequiredFields(req.body, ['student_full_name']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Sanitize inputs
  const sanitizedFullName = sanitizeString(student_full_name);
  const sanitizedBirthPlace = sanitizeString(birth_place);
  const sanitizedAddress = sanitizeString(address);
  const sanitizedFatherName = sanitizeString(father_name);
  const sanitizedMotherName = sanitizeString(mother_name);
  const sanitizedFatherPhone = sanitizeString(father_phone);
  const sanitizedMotherPhone = sanitizeString(mother_phone);
  
  // Validate phone numbers if provided
  if (father_phone && !isValidPhone(father_phone)) {
    throw new ValidationError('Invalid father phone number format', 'father_phone');
  }
  if (mother_phone && !isValidPhone(mother_phone)) {
    throw new ValidationError('Invalid mother phone number format', 'mother_phone');
  }
  
  // Validate date if provided
  if (birth_date && !isValidDate(birth_date)) {
    throw new ValidationError('Invalid birth date format. Use YYYY-MM-DD', 'birth_date');
  }
  
  // Generate a unique application number with timestamp
  const applicationNo = "REG-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
  
  const result = await db.insert(registrations).values({
    institutionId: isValidIntegerId(institution_id) ? parseInt(institution_id) : null,
    registrationType: sanitizeString(registration_type),
    academicYear: sanitizeString(academic_year) || '2026/2027',
    studentFullName: sanitizedFullName,
    birthPlace: sanitizedBirthPlace,
    birthDate: birth_date,
    gender: sanitizeString(gender),
    address: sanitizedAddress,
    fatherName: sanitizedFatherName,
    motherName: sanitizedMotherName,
    fatherPhone: sanitizedFatherPhone,
    motherPhone: sanitizedMotherPhone,
    documents: JSON.stringify(Array.isArray(documents) ? documents : []),
    notes: sanitizeString(notes),
    applicationNo,
    status: 'pending'
  }).returning();
  
  res.status(201).json({
    id: result[0].id,
    application_no: result[0].applicationNo,
    status: result[0].status
  });
}));

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

app.put('/v1/private/:tenant_slug/attendance', asyncHandler(async (req, res) => {
  const payload = camelize(req.body);
  const classId = sanitizeString(payload.classId);
  const date = sanitizeString(payload.attendanceDate);
  
  // Validate required fields
  const validation = validateRequiredFields(payload, ['classId', 'attendanceDate']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Validate date format
  if (date && !isValidDate(date)) {
    throw new ValidationError('Invalid date format. Use YYYY-MM-DD', 'attendanceDate');
  }
  
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
}));



app.put('/v1/private/:tenant_slug/learning/submissions/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validate ID
  if (isNaN(id) || id <= 0) {
    throw new ValidationError('Invalid submission ID', 'id');
  }
  
  const existing = await db.select().from(adminRecords).where(eq(adminRecords.id, id)).limit(1);
  if (!existing.length) {
    throw new ValidationError('Submission not found', 'id');
  }
  
  const updatedPayload = { ...existing[0].payload, ...camelize(req.body) };
  
  // Sanitize note if present
  if (typeof updatedPayload.note === 'string') {
    updatedPayload.note = sanitizeString(updatedPayload.note);
  }
  
  await db.update(adminRecords).set({ payload: updatedPayload }).where(eq(adminRecords.id, id));
  res.json({ success: true, item: updatedPayload });
}));

app.post('/v1/private/:tenant_slug/learning/submissions', asyncHandler(async (req, res) => {
  const { resource_id, student_id, file_path, note } = req.body;
  
  // Validate required fields
  const validation = validateRequiredFields(req.body, ['resource_id', 'student_id']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Validate IDs
  if (!isValidIntegerId(student_id)) {
    throw new ValidationError('Invalid student ID format', 'student_id');
  }
  
  // Sanitize inputs
  const sanitizedResourceId = sanitizeString(resource_id);
  const sanitizedFilePath = sanitizeString(file_path);
  const sanitizedNote = sanitizeString(note);
  
  const result = await db.insert(learningSubmissions)
    .values({
      resourceId: sanitizedResourceId,
      studentId: parseInt(student_id),
      filePath: sanitizedFilePath,
      note: sanitizedNote,
    })
    .returning();
    
  res.status(201).json(decamelize(result[0]));
}));



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
app.post('/v1/private/:tenant_slug/learning', asyncHandler(async (req, res) => {
  const payload = camelize(req.body);
  
  // Validate required fields
  const validation = validateRequiredFields(payload, ['classId']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Sanitize inputs
  if (typeof payload.classId === 'string') {
    payload.classId = sanitizeString(payload.classId);
  }
  
  // Dummy insert to adminRecords just to store it for now
  await db.insert(adminRecords).values({
    module: 'learning',
    recordKey: `${payload.classId}:${Date.now()}`,
    payload: req.body
  });
  res.json({ success: true, item: req.body });
}));


app.post('/v1/private/:tenant_slug/learning/submissions', asyncHandler(async (req, res) => {
  const payload = camelize(req.body);
  
  // Validate required fields
  const validation = validateRequiredFields(payload, ['resourceId', 'studentId']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Sanitize inputs
  if (typeof payload.resourceId === 'string') {
    payload.resourceId = sanitizeString(payload.resourceId);
  }
  if (typeof payload.studentId === 'string') {
    if (!isValidIntegerId(payload.studentId)) {
      throw new ValidationError('Invalid student ID format', 'studentId');
    }
    payload.studentId = parseInt(payload.studentId);
  }
  
  const result = await db.insert(adminRecords).values({
    module: 'submissions',
    recordKey: `${payload.resourceId}:${payload.studentId}:${Date.now()}`,
    payload: req.body
  }).returning();
  res.json({ success: true, item: { id: result[0].id, ...req.body } });
}));




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

app.post('/v1/private/:tenant_slug/wali/leave', asyncHandler(async (req, res) => {
  const payload = camelize(req.body);
  
  // Validate required fields
  const validation = validateRequiredFields(payload, ['studentId', 'reason']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Validate student ID
  if (!isValidIntegerId(payload.studentId)) {
    throw new ValidationError('Invalid student ID format', 'studentId');
  }
  
  // Sanitize inputs
  if (typeof payload.reason === 'string') {
    payload.reason = sanitizeString(payload.reason);
  }
  if (typeof payload.startDate === 'string' && !isValidDate(payload.startDate)) {
    throw new ValidationError('Invalid start date format. Use YYYY-MM-DD', 'startDate');
  }
  if (typeof payload.endDate === 'string' && !isValidDate(payload.endDate)) {
    throw new ValidationError('Invalid end date format. Use YYYY-MM-DD', 'endDate');
  }
  
  payload.studentId = parseInt(payload.studentId);
  
  const result = await db.insert(leaveRequests).values(payload).returning();
  res.status(201).json(decamelize(result[0]));
}));

app.post('/v1/private/:tenant_slug/wali/feedback', asyncHandler(async (req, res) => {
  const payload = camelize(req.body);
  
  // Validate required fields
  const validation = validateRequiredFields(payload, ['message']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Sanitize inputs
  if (typeof payload.message === 'string') {
    payload.message = sanitizeString(payload.message);
  }
  if (typeof payload.category === 'string') {
    payload.category = sanitizeString(payload.category);
  }
  if (payload.studentId && !isValidIntegerId(payload.studentId)) {
    throw new ValidationError('Invalid student ID format', 'studentId');
  }
  if (payload.studentId) {
    payload.studentId = parseInt(payload.studentId);
  }
  
  const result = await db.insert(feedbacks).values(payload).returning();
  res.status(201).json(decamelize(result[0]));
}));

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


app.post('/v1/private/:tenant_slug/attendance', asyncHandler(async (req, res) => {
  const { class_id, attendance_date, records } = req.body;
  
  // Validate required fields
  const validation = validateRequiredFields(req.body, ['class_id', 'attendance_date', 'records']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  if (!Array.isArray(records)) {
    throw new ValidationError('Records must be an array', 'records');
  }
  
  // Sanitize inputs
  const sanitizedClassId = sanitizeString(class_id);
  const sanitizedDate = sanitizeString(attendance_date);
  
  // Validate date format
  if (sanitizedDate && !isValidDate(sanitizedDate)) {
    throw new ValidationError('Invalid date format. Use YYYY-MM-DD', 'attendance_date');
  }
  
  // Convert to our attendance schema with validation
  const values = records.map((r: any, index: number) => {
    if (!r.student_id || !r.status) {
      throw new ValidationError(`Record ${index} missing student_id or status`);
    }
    return {
      uid: r.student_id.toString(),
      date: sanitizedDate,
      status: sanitizeString(r.status)
    };
  });

  // In a real production app we would do an UPSERT here. 
  // Since this is a simple schema, we just insert.
  await db.insert(attendance).values(values);

  res.json({ success: true, count: values.length });
}));


app.get('/v1/private/:tenant_slug/admin/progress', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(studentProgress).where(eq(studentProgress.institutionId, req.tenantId));
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/progress', asyncHandler(async (req, res) => {
  const { student_id, type, current_value, target, notes, status } = req.body;
  
  // Validate required fields
  const validation = validateRequiredFields(req.body, ['student_id', 'type']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Validate student_id is integer
  if (!isValidIntegerId(student_id)) {
    throw new ValidationError('Invalid student ID format', 'student_id');
  }
  
  // Sanitize inputs
  const sanitizedType = sanitizeString(type);
  const sanitizedNotes = sanitizeString(notes);
  const sanitizedStatus = sanitizeString(status);
  
  // Convert to schema
  const val = {
    studentId: parseInt(student_id),
    currentValue: current_value || sanitizedType,
    target: sanitizeString(target),
    notes: sanitizedNotes || (sanitizedStatus ? 'Status: ' + sanitizedStatus : '')
  };

  await db.insert(studentProgress).values(val);

  res.json({ success: true });
}));


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

app.post('/v1/private/:tenant_slug/admin/invoices', asyncHandler(async (req, res) => {
  const { student_id, type, amount, status, notes } = req.body;
  
  // Validate required fields
  const validation = validateRequiredFields(req.body, ['student_id', 'amount']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Validate student_id is integer
  if (!isValidIntegerId(student_id)) {
    throw new ValidationError('Invalid student ID format', 'student_id');
  }
  
  // Validate amount is numeric
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    throw new ValidationError('Invalid amount. Must be a positive number', 'amount');
  }
  
  // Sanitize inputs
  const sanitizedType = sanitizeString(type);
  const sanitizedStatus = sanitizeString(status);
  const sanitizedNotes = sanitizeString(notes);
  
  await db.insert(invoices).values({
    studentId: parseInt(student_id),
    amount: 'Rp ' + parsedAmount.toLocaleString('id-ID'),
    status: sanitizedStatus || 'unpaid',
    institutionId: req.tenantId
  });

  res.json({ success: true });
}));


app.post('/v1/private/:tenant_slug/admin/broadcasts', asyncHandler(async (req, res) => {
  const { target, mode, channel, title, message } = req.body;
  
  // Validate required fields
  const validation = validateRequiredFields(req.body, ['title', 'message']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Sanitize inputs
  const sanitizedTitle = sanitizeString(title);
  const sanitizedMessage = sanitizeString(message);
  const sanitizedTarget = sanitizeString(target);
  const sanitizedMode = sanitizeString(mode);
  const sanitizedChannel = sanitizeString(channel);
  
  await db.insert(posts).values({
    title: sanitizedTitle,
    postType: 'broadcast',
    excerpt: sanitizedMessage || (`${sanitizedMode} via ${sanitizedChannel} to ${sanitizedTarget}`),
  });

  res.json({ success: true });
}));

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

app.post('/v1/private/:tenant_slug/admin/records', asyncHandler(async (req, res) => {
  const payload = camelize(req.body);
  
  // Validate required fields for admin records
  const validation = validateRequiredFields(payload, ['module']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Sanitize module name
  if (typeof payload.module === 'string') {
    payload.module = sanitizeString(payload.module);
  }
  
  const result = await db.insert(adminRecords).values(payload).returning();
  res.status(201).json(decamelize(result[0]));
}));

app.put('/v1/private/:tenant_slug/admin/records/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validate ID
  if (isNaN(id) || id <= 0) {
    throw new ValidationError('Invalid record ID', 'id');
  }
  
  const payload = camelize(req.body);
  
  // Sanitize module name if present
  if (typeof payload.module === 'string') {
    payload.module = sanitizeString(payload.module);
  }
  
  const result = await db.update(adminRecords)
    .set(payload)
    .where(eq(adminRecords.id, id))
    .returning();
    
  if (!result.length) {
    throw new ValidationError('Record not found', 'id');
  }
  
  res.json(decamelize(result[0]));
}));

app.get('/v1/private/:tenant_slug/admin/students', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(students);
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/students', asyncHandler(async (req, res) => {
  const payload = camelize(req.body);
  
  // Validate required fields for students
  const validation = validateRequiredFields(payload, ['fullName', 'institutionId']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Sanitize string inputs
  if (typeof payload.fullName === 'string') {
    payload.fullName = sanitizeString(payload.fullName);
  }
  if (typeof payload.address === 'string') {
    payload.address = sanitizeString(payload.address);
  }
  if (typeof payload.phone === 'string') {
    if (!isValidPhone(payload.phone)) {
      throw new ValidationError('Invalid phone number format', 'phone');
    }
    payload.phone = sanitizeString(payload.phone);
  }
  
  // Validate institution ID
  if (!isValidIntegerId(payload.institutionId)) {
    throw new ValidationError('Invalid institution ID format', 'institutionId');
  }
  
  const result = await db.insert(students).values({ 
    ...payload, 
    institutionId: parseInt(payload.institutionId) 
  }).returning();
  
  res.status(201).json(decamelize(result[0]));
}));

app.get('/v1/private/:tenant_slug/admin/staff', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(staff).where(eq(staff.institutionId, req.tenantId));
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/staff', asyncHandler(async (req, res) => {
  const payload = camelize(req.body);
  
  // Validate required fields for staff
  const validation = validateRequiredFields(payload, ['fullName', 'institutionId']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Sanitize string inputs
  if (typeof payload.fullName === 'string') {
    payload.fullName = sanitizeString(payload.fullName);
  }
  if (typeof payload.address === 'string') {
    payload.address = sanitizeString(payload.address);
  }
  if (typeof payload.phone === 'string') {
    if (!isValidPhone(payload.phone)) {
      throw new ValidationError('Invalid phone number format', 'phone');
    }
    payload.phone = sanitizeString(payload.phone);
  }
  if (typeof payload.position === 'string') {
    payload.position = sanitizeString(payload.position);
  }
  
  // Validate institution ID
  if (!isValidIntegerId(payload.institutionId)) {
    throw new ValidationError('Invalid institution ID format', 'institutionId');
  }
  
  const result = await db.insert(staff).values({ 
    ...payload, 
    institutionId: parseInt(payload.institutionId) 
  }).returning();
  
  res.status(201).json(decamelize(result[0]));
}));

app.get('/v1/private/:tenant_slug/admin/content', requireAuth, resolveTenant, async (req, res) => {
  try {
    const data = await db.select().from(content);
    res.json({ items: decamelize(data) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/v1/private/:tenant_slug/admin/content', asyncHandler(async (req, res) => {
  const payload = camelize(req.body);
  
  // Validate required fields for content
  const validation = validateRequiredFields(payload, ['title', 'content']);
  if (!validation.valid) {
    throw new ValidationError(`Missing required fields: ${validation.missing.join(', ')}`);
  }
  
  // Sanitize string inputs
  if (typeof payload.title === 'string') {
    payload.title = sanitizeString(payload.title);
  }
  if (typeof payload.content === 'string') {
    payload.content = sanitizeString(payload.content);
  }
  if (typeof payload.contentType === 'string') {
    payload.contentType = sanitizeString(payload.contentType);
  }
  
  const result = await db.insert(content).values(payload).returning();
  res.status(201).json(decamelize(result[0]));
}));

app.put('/v1/private/:tenant_slug/admin/content/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Validate ID
  if (isNaN(id) || id <= 0) {
    throw new ValidationError('Invalid content ID', 'id');
  }
  
  const payload = camelize(req.body);
  
  // Sanitize string inputs
  if (typeof payload.title === 'string') {
    payload.title = sanitizeString(payload.title);
  }
  if (typeof payload.content === 'string') {
    payload.content = sanitizeString(payload.content);
  }
  if (typeof payload.contentType === 'string') {
    payload.contentType = sanitizeString(payload.contentType);
  }
  
  const result = await db.update(content).set(payload).where(eq(content.id, id)).returning();
  
  if (!result.length) {
    throw new ValidationError('Content not found', 'id');
  }
  
  res.json(decamelize(result[0]));
}));

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

app.post('/api/page/save', express.json({limit: '50mb'}), asyncHandler(async (req, res) => {
  const { html, pathname } = req.body;
  
  // Validate required fields
  if (!html) {
    throw new ValidationError('No HTML provided');
  }
  
  // Sanitize pathname if provided
  let sanitizedPathname = '';
  if (pathname) {
    sanitizedPathname = sanitizeString(pathname);
  }
  
  let filename = 'index.html';
  if (sanitizedPathname && (sanitizedPathname.includes('/tpq') || sanitizedPathname.includes('/mdt') || sanitizedPathname.includes('/ra') || sanitizedPathname.includes('/rtq'))) {
    if (sanitizedPathname.includes('pendaftaran.html')) filename = 'tenant-pendaftaran.html';
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
}));

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
