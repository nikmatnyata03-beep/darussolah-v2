const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

code = code.replace(
  "export const staff = pgTable('staff', {\n  id: serial('id').primaryKey(),\n  displayName: text('display_name').notNull(),\n  education: text('education'),\n  employmentType: text('employment_type'),\n  institutionId: integer('institution_id').references(() => institutions.id),",
  "export const staff = pgTable('staff', {\n  id: serial('id').primaryKey(),\n  displayName: text('display_name').notNull(),\n  education: text('education'),\n  employmentType: text('employment_type'),\n  institutionId: text('institution_id'),"
);

// also fix attendance which was accidentally broken
code = code.replace(
  "export const attendance = pgTable('attendance', {\n  id: serial('id').primaryKey(),\n  institutionId: text('institution_id'),",
  "export const attendance = pgTable('attendance', {\n  id: serial('id').primaryKey(),\n  institutionId: integer('institution_id').references(() => institutions.id),"
);

fs.writeFileSync('src/db/schema.ts', code);
console.log('Fixed staff schema');
