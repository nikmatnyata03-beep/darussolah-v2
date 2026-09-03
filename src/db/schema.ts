import { pgTable, serial, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull().unique(),
  roles: text('roles').array().default(['wali']), // e.g. ['admin'], ['guru'], ['wali']
  createdAt: timestamp('created_at').defaultNow(),
});

export const attendance = pgTable('attendance', {
  id: serial('id').primaryKey(),
  institutionId: integer('institution_id').references(() => institutions.id),
  uid: text('uid').references(() => users.uid).notNull(),
  status: text('status').notNull(),
  date: text('date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const foundations = pgTable('foundations', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
});

export const institutions = pgTable('institutions', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  foundationId: integer('foundation_id').references(() => foundations.id),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  institutionId: integer('institution_id').references(() => institutions.id),
  postType: text('post_type').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt'),
  publishedAt: timestamp('published_at').defaultNow(),
});

export const learningSubmissions = pgTable('learning_submissions', {
  id: serial('id').primaryKey(),
  resourceId: text('resource_id').notNull(),
  studentId: text('student_id').notNull(),
  filePath: text('file_path'),
  note: text('note'),
  status: text('status').default('submitted'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(),
  applicationNo: text('application_no').notNull().unique(),
  institutionId: integer('institution_id').references(() => institutions.id),
  registrationType: text('registration_type'),
  academicYear: text('academic_year'),
  studentFullName: text('student_full_name').notNull(),
  birthPlace: text('birth_place'),
  birthDate: text('birth_date'),
  gender: text('gender'),
  address: text('address'),
  fatherName: text('father_name'),
  fatherPhone: text('father_phone'),
  motherName: text('mother_name'),
  motherPhone: text('mother_phone'),
  documents: text('documents'),
  notes: text('notes'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  institutionId: integer('institution_id').references(() => institutions.id),
  fullName: text('full_name').notNull(),
  nis: text('nis'),
  status: text('status').default('active'),
  classId: text('class_id'),
  guardianName: text('guardian_name'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const staff = pgTable('staff', {
  id: serial('id').primaryKey(),
  displayName: text('display_name').notNull(),
  education: text('education'),
  employmentType: text('employment_type'),
  institutionId: text('institution_id'),
  weeklyHours: integer('weekly_hours').default(0),
  status: text('status').default('active'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const content = pgTable('content', {
  id: serial('id').primaryKey(),
  institutionId: integer('institution_id').references(() => institutions.id),
  siteKind: text('site_kind'),
  contentType: text('content_type'),
  slug: text('slug'),
  title: text('title').notNull(),
  body: text('body'),
  excerpt: text('excerpt'),
  status: text('status').default('draft'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const adminRecords = pgTable('admin_records', {
  id: serial('id').primaryKey(),
  institutionId: integer('institution_id').references(() => institutions.id),
  module: text('module').notNull(),
  recordKey: text('record_key').notNull(),
  entityId: text('entity_id'),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at').defaultNow(),
});


export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  institutionId: integer('institution_id').references(() => institutions.id),
  studentId: integer('student_id').references(() => students.id),
  amount: text('amount').notNull(),
  status: text('status').default('unpaid'),
  dueDate: text('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const studentProgress = pgTable('student_progress', {
  id: serial('id').primaryKey(),
  institutionId: integer('institution_id').references(() => institutions.id),
  studentId: integer('student_id').references(() => students.id),
  target: text('target'),
  currentValue: text('current_value'),
  notes: text('notes'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const leaveRequests = pgTable('leave_requests', {
  id: serial('id').primaryKey(),
  institutionId: integer('institution_id').references(() => institutions.id),
  studentId: integer('student_id').references(() => students.id),
  date: text('date').notNull(),
  leaveType: text('leave_type'),
  note: text('note'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const feedbacks = pgTable('feedbacks', {
  id: serial('id').primaryKey(),
  institutionId: integer('institution_id').references(() => institutions.id),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
