const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.error('ERROR:', err.toString()));
  await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle0' });
  
  await page.click('#google-login-btn');
  await page.waitForTimeout(1000);
  
  await browser.close();
})();
