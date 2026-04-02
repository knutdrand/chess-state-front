const { execSync } = require('child_process');
const path = require('path');

const frontendDir = path.resolve(__dirname, '..');

describe('Frontend build', () => {
  test('compiles successfully after API codegen', () => {
    // Run codegen + build to verify all imports resolve
    // This catches issues like httpClient.ts being deleted by codegen
    expect(() => {
      execSync('npm run generate-api && npx react-scripts build', {
        cwd: frontendDir,
        env: { ...process.env, CI: 'true' },
        stdio: 'pipe',
        timeout: 120000,
      });
    }).not.toThrow();
  }, 120000);
});
