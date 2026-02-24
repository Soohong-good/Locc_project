import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const pages = [
    { name: '처음 방문하시는 분', url: 'http://localhost:8080/church/first-visit'},
];

function safeFileName(s) {
    return s
        .trim()
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-') // 윈도우 금지문자 처리
        .replace(/\s+/g, '_')
        .replace(/-+/g, '-')
        .replace(/_+/g, '_');
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
    });

    // 애니메이션 때문에 캡처 흔들리면 이거 켜도 됨
    // await page.addStyleTag({ content: '* { animation: none !important; transition: none !important; }' });

    const results = [];

    for (const p of pages) {
        const fileBase = safeFileName(p.name);
        const filePath = path.join(OUT_DIR, `${fileBase}.png`);

        try {
            await page.goto(p.url, { waitUntil: 'networkidle', timeout: 60_000 });
            await page.waitForTimeout(500); // 폰트/미세 렌더링 안정화

            await page.screenshot({
                path: filePath,
                fullPage: true,
            });

            console.log(`✅ OK  ${p.name} -> ${filePath}`);
            results.push({ name: p.name, url: p.url, ok: true, file: filePath });
        } catch (e) {
            console.error(`❌ FAIL ${p.name} (${p.url})`);
            console.error(e?.message ?? e);
            results.push({ name: p.name, url: p.url, ok: false, error: e?.message ?? String(e) });
            // 실패해도 다음 페이지 계속
        }
    }

    await browser.close();

    // 결과 요약 저장(선택)
    const reportPath = path.join(OUT_DIR, `report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n📄 Report saved: ${reportPath}`);
})();
