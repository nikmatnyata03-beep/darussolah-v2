const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

const regex = /export const registrations = pgTable\('registrations', \{[\s\S]*?\}\);/;
const replacement = `export const registrations = pgTable('registrations', {
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
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/db/schema.ts', code);
console.log('Registrations schema updated');
