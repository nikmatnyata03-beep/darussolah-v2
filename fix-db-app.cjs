const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.get\('\/', \(req, res\) => \{/;
const replacement = `app.get('/fix-db', async (req, res) => {
  try {
    const { sql } = require('drizzle-orm');
    await db.execute(sql\`ALTER TABLE staff DROP COLUMN institution_id;\`);
    res.send('Dropped');
  } catch(e) {
    res.send(e.message);
  }
});
app.get('/', (req, res) => {`;

code = code.replace(regex, replacement);
fs.writeFileSync('server.ts', code);
console.log('Added /fix-db endpoint');
