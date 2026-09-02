const fs = require('fs');
let code = fs.readFileSync('google-docs.js', 'utf8');

const targetScope = `  provider.addScope('https://www.googleapis.com/auth/drive.readonly');`;
const replacementScope = `  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  provider.addScope('https://www.googleapis.com/auth/spreadsheets');
  provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');`;

code = code.replace(targetScope, replacementScope);

const sheetsFn = `
export const createGoogleSheet = async (token, title, rows) => {
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties: { title } })
  });
  if (!createRes.ok) throw new Error('Failed to create Google Sheet');
  const sheet = await createRes.json();
  
  if (rows && rows.length > 0) {
    const updateRes = await fetch(\`https://sheets.googleapis.com/v4/spreadsheets/\${sheet.spreadsheetId}/values/Sheet1!A1:append?valueInputOption=USER_ENTERED\`, {
      method: 'POST',
      headers: { Authorization: \`Bearer \${token}\`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: rows })
    });
    if (!updateRes.ok) throw new Error('Failed to append data to Google Sheet');
  }
  return sheet;
};
`;

code += sheetsFn;

fs.writeFileSync('google-docs.js', code);
