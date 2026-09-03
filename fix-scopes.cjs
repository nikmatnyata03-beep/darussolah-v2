const fs = require('fs');
let code = fs.readFileSync('google-docs.js', 'utf8');
code = code.replace(
  "provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');",
  `provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
  provider.addScope('https://mail.google.com/');
  provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.action.compose');
  provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.message.action');
  provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.message.metadata');
  provider.addScope('https://www.googleapis.com/auth/gmail.addons.current.message.readonly');
  provider.addScope('https://www.googleapis.com/auth/gmail.compose');
  provider.addScope('https://www.googleapis.com/auth/gmail.insert');
  provider.addScope('https://www.googleapis.com/auth/gmail.labels');
  provider.addScope('https://www.googleapis.com/auth/gmail.metadata');
  provider.addScope('https://www.googleapis.com/auth/gmail.modify');
  provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
  provider.addScope('https://www.googleapis.com/auth/gmail.send');
  provider.addScope('https://www.googleapis.com/auth/gmail.settings.basic');
  provider.addScope('https://www.googleapis.com/auth/gmail.settings.sharing');`
);
fs.writeFileSync('google-docs.js', code);
console.log('Added Gmail scopes');
