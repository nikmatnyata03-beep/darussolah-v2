const fs = require('fs');
let js = fs.readFileSync('editor.js', 'utf8');

const injection = `
// Inject Admin Dashboard toggle in footer
document.addEventListener('DOMContentLoaded', () => {
  const footers = document.querySelectorAll('.footer-bottom, .footer-note');
  footers.forEach(footer => {
    if (!footer.querySelector('.admin-edit-toggle')) {
      const link = document.createElement('a');
      link.className = 'admin-edit-toggle';
      link.href = '#';
      link.style = 'color: inherit; text-decoration: underline; margin-left: 10px; font-size: 0.9em;';
      link.textContent = 'Admin Dashboard (Edit Mode)';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const u = new URL(window.location.href);
        if (u.searchParams.get('edit') === 'true') {
          u.searchParams.delete('edit');
        } else {
          u.searchParams.set('edit', 'true');
        }
        window.location.href = u.toString();
      });
      footer.appendChild(link);
    }
  });
});
`;

// Prepend to editor.js
fs.writeFileSync('editor.js', injection + '\n' + js);
console.log('Injected footer toggle');
