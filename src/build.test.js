import { execSync } from 'child_process';
import path from 'path';

const frontendDir = path.resolve(import.meta.dirname, '..');

describe('Frontend build', () => {
  test('compiles successfully after API codegen', () => {
    // Run codegen + build to verify all imports resolve
    // This catches issues like httpClient.ts being deleted by codegen
    expect(() => {
      execSync('npm run generate-api && npx tsc --noEmit && npx vite build', {
        cwd: frontendDir,
        env: { ...process.env, CI: 'true' },
        stdio: 'pipe',
        timeout: 120000,
      });
    }).not.toThrow();
  }, 120000);
});
