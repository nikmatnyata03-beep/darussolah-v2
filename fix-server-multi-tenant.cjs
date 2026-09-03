const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Add import for resolveTenant
if (!code.includes('resolveTenant')) {
    code = code.replace(
        "import { requireAuth } from './src/middleware/auth.ts';",
        "import { requireAuth } from './src/middleware/auth.ts';\nimport { resolveTenant } from './src/middleware/tenant.ts';"
    );
}

// 2. Replace all `requireAuth, async` with `requireAuth, resolveTenant, async` for private routes
code = code.replace(/app\.(get|post|put|delete)\('\/v1\/private\/:tenant_slug([^']*)',\s*requireAuth,\s*async/g, "app.$1('/v1/private/:tenant_slug$2', requireAuth, resolveTenant, async");

// 3. Force multi-tenant filtering on students GET
code = code.replace(
    /const data = await db\.select\(\)\.from\(students\);/,
    "const data = await db.select().from(students).where(eq(students.institutionId, req.tenantId));"
);

// 4. Force multi-tenant filtering on staff GET
code = code.replace(
    /const data = await db\.select\(\)\.from\(staff\);/,
    "const data = await db.select().from(staff).where(eq(staff.institutionId, req.tenantId));"
);

// 5. Force multi-tenant filtering on invoices GET
code = code.replace(
    /const data = await db\.select\(\)\.from\(invoices\);/,
    "const data = await db.select().from(invoices).where(eq(invoices.institutionId, req.tenantId));"
);

// 6. Force multi-tenant filtering on studentProgress GET
code = code.replace(
    /const data = await db\.select\(\)\.from\(studentProgress\);/,
    "const data = await db.select().from(studentProgress).where(eq(studentProgress.institutionId, req.tenantId));"
);

// 7. On POST operations, automatically append institutionId
// For students POST
code = code.replace(
    /await db\.insert\(students\)\.values\(camelize\(req\.body\)\)/,
    "await db.insert(students).values({ ...camelize(req.body), institutionId: req.tenantId })"
);

// For staff POST
code = code.replace(
    /await db\.insert\(staff\)\.values\(camelize\(req\.body\)\)/,
    "await db.insert(staff).values({ ...camelize(req.body), institutionId: req.tenantId })"
);

// For invoices POST
code = code.replace(
    /await db\.insert\(invoices\)\.values\(camelize\(req\.body\)\)/,
    "await db.insert(invoices).values({ ...camelize(req.body), institutionId: req.tenantId })"
);

// For studentProgress POST
code = code.replace(
    /await db\.insert\(studentProgress\)\.values\(camelize\(req\.body\)\)/,
    "await db.insert(studentProgress).values({ ...camelize(req.body), institutionId: req.tenantId })"
);

fs.writeFileSync('server.ts', code);
console.log('server.ts secured with Multi-Tenancy!');
