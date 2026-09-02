const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  await page.goto('http://localhost:3000/login.html', { waitUntil: 'networkidle0' });
  
  const hasGoogleBtn = await page.evaluate(() => !!document.querySelector('#google-login-btn'));
  console.log('Has Google button?', hasGoogleBtn);
  
  await browser.close();
})();
