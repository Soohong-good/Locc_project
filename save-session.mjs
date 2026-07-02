/**
 * save-session.mjs
 *
 * 소셜 로그인 계정처럼 자동화가 어려운 경우, 브라우저를 직접 열어
 * 로그인한 뒤 세션 쿠키를 admin-session.json 에 저장합니다.
 *
 * 사용법:
 *   node save-session.mjs
 *
 * → 브라우저 창이 열리면 소셜 로그인을 완료하세요.
 * → /admin 페이지가 표시되면 아무 키나 누르면 세션이 저장됩니다.
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const BASE         = 'http://localhost:3000';
const SESSION_FILE = path.resolve('admin-session.json');

function waitForEnter(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, () => { rl.close(); resolve(); });
  });
}

(async () => {
  const browser = await chromium.launch({
    headless: false,           // 브라우저 창을 직접 보면서 로그인
    slowMo: 50,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  console.log('\n🌐 브라우저가 열렸습니다.');
  console.log('   로그인 페이지로 이동합니다...\n');

  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });

  console.log('📌 소셜 로그인을 완료하고 관리자 대시보드(/admin)에 진입하세요.');
  await waitForEnter('   로그인이 완료되면 Enter 키를 누르세요... ');

  // 현재 URL이 /admin인지 확인
  const currentUrl = page.url();
  if (!currentUrl.includes('/admin')) {
    console.warn(`⚠️  현재 URL: ${currentUrl}`);
    console.warn('   /admin 페이지가 아닙니다. 세션이 저장되지만 권한이 없을 수 있습니다.');
  }

  // 쿠키 + localStorage 저장
  const state = await context.storageState();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(state, null, 2), 'utf-8');

  console.log(`\n✅ 세션 저장 완료: ${SESSION_FILE}`);
  console.log('   이제 node screenshot.mjs 를 실행하면 이 세션으로 관리자 페이지를 캡처합니다.\n');

  await browser.close();
})();
