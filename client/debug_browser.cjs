const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let loopCount = 0;

  page.on('console', msg => {
    console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', error => {
    console.log(`PAGE ERROR:`, error.message);
  });

  page.on('request', req => {
    loopCount++;
    if (loopCount > 100) {
      console.log('WARNING: Too many requests! Infinite loop detected?');
    }
  });

  try {
    console.log('Navigating to http://localhost:5173/register...');
    await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle0' });
    
    // Fill register form
    const email = `test${Date.now()}@test.com`;
    await page.type('input[name="name"]', 'Test User');
    await page.type('input[name="identifier"]', email);
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    console.log('Waiting for navigation to login...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('Current URL (should be login):', page.url());

    // Fill login form
    await page.type('input[name="identifier"]', email);
    await page.type('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    console.log('Waiting for navigation to dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('Current URL (should be dashboard):', page.url());

    console.log('Waiting on dashboard for 5 seconds to observe...');
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('Navigating to Job Tracker...');
    await page.goto('http://localhost:5173/job-tracker', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('Reloading Job Tracker...');
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 5000));
  } catch (error) {
    console.log('Navigation error:', error.message);
  }

  setTimeout(async () => {
    await browser.close();
  }, 5000);
})();
