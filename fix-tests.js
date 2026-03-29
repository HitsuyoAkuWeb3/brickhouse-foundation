const fs = require('fs');

const mockSessionScript = `
    // Inject mock auth token to prevent ProtectedRoute from redirecting before mock endpoints reply
    await page.addInitScript(() => {
      const originalGetItem = window.localStorage.getItem;
      window.localStorage.getItem = function(key) {
        if (key && key.includes('auth-token')) {
          return JSON.stringify({
            access_token: 'test-access',
            refresh_token: 'test-refresh',
            user: { id: 'test', aud: 'authenticated', role: 'authenticated' },
            expires_at: Math.floor(Date.now() / 1000) + 3600
          });
        }
        return originalGetItem.call(this, key);
      };
    });
`;

['e2e/affirmations.spec.ts', 'e2e/daily-ritual.spec.ts', 'e2e/profile-dashboard.spec.ts'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Find where they route '**/auth/v1/user' and insert right after
  content = content.replace(
    /await page\.route\('\*\*\/auth\/v1\/user'.*?\}\);\s*\n\s*\}\);/gs,
    match => match + '\n' + mockSessionScript
  );
  fs.writeFileSync(file, content);
});
console.log('Fixed auth init scripts.');
