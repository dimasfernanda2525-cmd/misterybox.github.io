import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInstagramTarget,
  calculateLoadingProgress,
  detectMobilePlatform,
  getLoadingMessage,
  resolveInitialPhase,
  validateReactionInput,
} from './surpriseFlow';

test('resolveInitialPhase defaults to intro and supports autostart or explicit phase', () => {
  assert.equal(resolveInitialPhase(''), 'intro');
  assert.equal(resolveInitialPhase('?autostart=1'), 'loading');
  assert.equal(resolveInitialPhase('?phase=finale'), 'finale');
  assert.equal(resolveInitialPhase('?phase=jumpscare'), 'jumpscare');
  assert.equal(resolveInitialPhase('?phase=invalid'), 'intro');
});

test('calculateLoadingProgress bounds between 0 and 100 and advances monotonically', () => {
  assert.equal(calculateLoadingProgress(-50, 2000), 0);
  const mid = calculateLoadingProgress(1000, 2000);
  assert.ok(mid > 40 && mid < 80);
  assert.equal(calculateLoadingProgress(2000, 2000), 100);
  assert.equal(calculateLoadingProgress(4000, 2000), 100);
});

test('getLoadingMessage switches cleanly across thresholds', () => {
  assert.match(getLoadingMessage(10), /barcode/i);
  assert.match(getLoadingMessage(50), /segel/i);
  assert.match(getLoadingMessage(90), /spesial/i);
});

test('buildInstagramTarget strips @ and constructs web, iOS URI, and Android intent', () => {
  const target = buildInstagramTarget('@diferrr_');
  assert.equal(target.username, 'diferrr_');
  assert.equal(target.handle, '@diferrr_');
  assert.equal(target.webUrl, 'https://www.instagram.com/diferrr_/');
  assert.equal(target.appUri, 'instagram://user?username=diferrr_');
  assert.equal(
    target.androidIntentUri,
    'intent://instagram.com/_u/diferrr_/#Intent;package=com.instagram.android;scheme=https;end',
  );
});

test('detectMobilePlatform classifies Android, iOS, and desktop user agents', () => {
  assert.equal(detectMobilePlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8)'), 'android');
  assert.equal(detectMobilePlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'), 'ios');
  assert.equal(detectMobilePlatform('Mozilla/5.0 (X11; Linux x86_64) Chrome/128.0'), 'desktop');
});

test('validateReactionInput rejects invalid payloads and sanitizes valid submissions', () => {
  const tooShort = validateReactionInput({ name: 'A', message: 'Kaget' });
  assert.equal(tooShort.valid, false);
  assert.ok(tooShort.error);

  const emptyMsg = validateReactionInput({ name: 'Budi', message: ' ' });
  assert.equal(emptyMsg.valid, false);

  const valid = validateReactionInput({
    name: '  Sinta ',
    emoji: '😂',
    message: ' Kaget banget pas kucingnya teriak! ',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.sanitized, {
    name: 'Sinta',
    emoji: '😂',
    message: 'Kaget banget pas kucingnya teriak!',
  });
});
