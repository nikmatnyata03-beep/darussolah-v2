const fs = require('fs');
let code = fs.readFileSync('darussolah-admin.js', 'utf8');

const debugStyles = `
  const applyPreferences = () => {
    try {
      const prefs = JSON.parse(localStorage.getItem('simdwj.preferences') || '{}');
      if (prefs.debug) {
        document.body.classList.add('debug-mode');
        if (!document.getElementById('debug-styles')) {
          const style = document.createElement('style');
          style.id = 'debug-styles';
          style.textContent = \`
            .debug-mode [data-debug-bind] {
              position: relative;
              outline: 2px dashed #f0c;
              outline-offset: 4px;
            }
            .debug-mode [data-debug-bind]::after {
              content: "{" attr(data-debug-bind) "}";
              position: absolute;
              top: -8px;
              right: -8px;
              background: #f0c;
              color: #fff;
              font-family: monospace;
              font-size: 8px;
              padding: 2px 4px;
              border-radius: 4px;
              z-index: 100;
              pointer-events: none;
              white-space: pre-wrap;
              max-width: 200px;
              word-break: break-all;
            }
          \`;
          document.head.append(style);
        }
      } else {
        document.body.classList.remove('debug-mode');
      }
    } catch (e) {}
  };
  applyPreferences();
  window.addEventListener('storage', (e) => {
    if (e.key === 'simdwj.preferences') applyPreferences();
  });

  const debugBind = (element, key, rawData) => {
    if (!element) return;
    try {
      const prefs = JSON.parse(localStorage.getItem('simdwj.preferences') || '{}');
      if (prefs.debug) {
        element.setAttribute('data-debug-bind', key + ': ' + JSON.stringify(rawData));
      } else {
        element.removeAttribute('data-debug-bind');
      }
    } catch(e){}
  };
`;

code = code.replace("const state = { students: [], classes: [], staff: [], records: {}, content: [] };", 
  "const state = { students: [], classes: [], staff: [], records: {}, content: [] };\n" + debugStyles);

fs.writeFileSync('darussolah-admin.js', code);
