const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<span data-name class="skeleton">Lembaga<small>Darussolah Wal Jinan</small></span>`);
const document = dom.window.document;
const el = document.querySelector('[data-name]');
const small = el.querySelector('small');
try {
  el.childNodes[0].nodeValue = 'TPQ Darul Jinan';
  console.log('Success:', el.outerHTML);
} catch (e) {
  console.error('Error:', e.message);
}
