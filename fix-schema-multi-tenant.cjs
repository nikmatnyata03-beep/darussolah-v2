const fs = require('fs');
let code = fs.readFileSync('src/db/schema.ts', 'utf8');

// Function to inject institution_id if missing
function injectInstitutionId(tableName, tableCode) {
    if (tableCode.includes("institutionId: integer('institution_id')")) return tableCode;
    
    // Replace the first column definition to inject institutionId right after id
    return tableCode.replace(
        /id: serial\('id'\)\.primaryKey\(\),/,
        "id: serial('id').primaryKey(),\n  institutionId: integer('institution_id').references(() => institutions.id),"
    );
}

// 1. Fix staff (it has text('institution_id'))
code = code.replace(/institutionId: text\('institution_id'\),/, "institutionId: integer('institution_id').references(() => institutions.id),");

// 2. Add to students
const stdRegex = /export const students = pgTable\('students', {[\s\S]*?}\);/;
const stdMatch = code.match(stdRegex);
if(stdMatch) code = code.replace(stdRegex, injectInstitutionId('students', stdMatch[0]));

// 3. Add to content
const contentRegex = /export const content = pgTable\('content', {[\s\S]*?}\);/;
const contentMatch = code.match(contentRegex);
if(contentMatch) code = code.replace(contentRegex, injectInstitutionId('content', contentMatch[0]));

// 4. Add to adminRecords
const adminRegex = /export const adminRecords = pgTable\('admin_records', {[\s\S]*?}\);/;
const adminMatch = code.match(adminRegex);
if(adminMatch) code = code.replace(adminRegex, injectInstitutionId('adminRecords', adminMatch[0]));

// 5. Add to invoices
const invRegex = /export const invoices = pgTable\('invoices', {[\s\S]*?}\);/;
const invMatch = code.match(invRegex);
if(invMatch) code = code.replace(invRegex, injectInstitutionId('invoices', invMatch[0]));

// 6. Add to studentProgress
const progRegex = /export const studentProgress = pgTable\('student_progress', {[\s\S]*?}\);/;
const progMatch = code.match(progRegex);
if(progMatch) code = code.replace(progRegex, injectInstitutionId('studentProgress', progMatch[0]));

// 7. Add to leaveRequests
const leaveRegex = /export const leaveRequests = pgTable\('leave_requests', {[\s\S]*?}\);/;
const leaveMatch = code.match(leaveRegex);
if(leaveMatch) code = code.replace(leaveRegex, injectInstitutionId('leaveRequests', leaveMatch[0]));

// 8. Add to feedbacks
const fbRegex = /export const feedbacks = pgTable\('feedbacks', {[\s\S]*?}\);/;
const fbMatch = code.match(fbRegex);
if(fbMatch) code = code.replace(fbRegex, injectInstitutionId('feedbacks', fbMatch[0]));

// 9. Add to attendance
const attRegex = /export const attendance = pgTable\('attendance', {[\s\S]*?}\);/;
const attMatch = code.match(attRegex);
if(attMatch) code = code.replace(attRegex, injectInstitutionId('attendance', attMatch[0]));

fs.writeFileSync('src/db/schema.ts', code);
console.log('Schema Multi-Tenancy upgraded!');
