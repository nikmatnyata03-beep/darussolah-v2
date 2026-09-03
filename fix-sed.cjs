const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace("status: status || 'unpaid',\n    , institutionId: req.tenantId});", "status: status || 'unpaid',\n    institutionId: req.tenantId});");
fs.writeFileSync('server.ts', code);
