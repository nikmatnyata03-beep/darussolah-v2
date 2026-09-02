const fs = require('fs');
let code = fs.readFileSync('keuangan.html', 'utf8');

const regexTableClick = /document\.querySelectorAll\('\.bill-table'\)\.forEach\(.*?\}\)\}\);/s;
code = code.replace(regexTableClick, '');

const regexInvoice = /document\.getElementById\('invoiceForm'\)\.addEventListener\('submit',.*?\}\);/s;
code = code.replace(regexInvoice, '');

const regexDonation = /document\.getElementById\('donationForm'\)\.addEventListener\('submit',.*?\}\);/s;
code = code.replace(regexDonation, '');

fs.writeFileSync('keuangan.html', code);
