const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Capture all console logs
  page.on('console', msg => console.log('PAGE LOG [' + msg.type() + ']:', msg.text()));
  
  // Capture page errors (unhandled exceptions)
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  // Capture failed requests
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });

  try {
    // Go to domain first so we can set localStorage
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0', timeout: 10000 });
    
    // Set mock token
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
    });

    console.log("Navigating to http://localhost:5173/dashboard...");
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0', timeout: 10000 });
    console.log("Navigation complete.");
  } catch (err) {
    console.log("Navigation error:", err.message);
  }

  // Wait a bit to let any scripts execute
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
