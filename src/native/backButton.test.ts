import { pushBackHandler, runBackHandler } from './backButton';

test('back button closes the most recently opened dialog first', () => {
  const calls: string[] = [];
  const offA = pushBackHandler(() => calls.push('settings dialog'));
  const offB = pushBackHandler(() => calls.push('explanation dialog'));
  expect(runBackHandler()).toBe(true);
  offB();
  expect(runBackHandler()).toBe(true);
  offA();
  expect(runBackHandler()).toBe(false); // nothing open: App.tsx falls back to tab / minimise
  expect(calls).toEqual(['explanation dialog', 'settings dialog']);
});
