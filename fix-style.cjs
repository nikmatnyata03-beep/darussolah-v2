const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const styleToInsert = `
    .bio-item[data-open] {
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .bio-item[data-open]:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.08);
      border-color: var(--pine-light, #3c7d6c);
    }
`;

if (!html.includes('.bio-item[data-open]')) {
  html = html.replace('</style>', styleToInsert + '</style>');
  fs.writeFileSync('index.html', html);
}
console.log('Added hover style');
