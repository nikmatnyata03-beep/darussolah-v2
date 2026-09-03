const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
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
`;

code = code.replace(
  /const foundUsers = await db\.select\(\)\.from\(users\)\.where\(eq\(users\.uid, \(req as any\)\.user\.uid\)\)\.limit\(1\);\n\s*const userRecord = foundUsers\[0\];/,
  replacement
);

fs.writeFileSync('server.ts', code);
console.log('Server updated for auto-admin provisioning');
