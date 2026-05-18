import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('screens');
fs.mkdirSync(OUT_DIR, { recursive: true });

const pages = [
    { name: '새로운 테마', url: 'http://localhost:3000/design-preview' }
];

function safeFileName(s) {
    return s.trim()
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
        .replace(/\s+/g, '_')
        .replace(/-+/g, '-')
        .replace(/_+/g, '_');
}

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
    });

    const results = [];

    for (const p of pages) {
        const fileBase = safeFileName(p.name);
        const filePath = path.join(OUT_DIR, `${fileBase}.png`);

        try {
            await page.goto(p.url, { waitUntil: 'networkidle', timeout: 60_000 });

            // ✅ 수정 1: goto 이후에 스타일 주입 (goto 전 주입은 페이지 이동 시 사라짐)
            await page.addStyleTag({
                content: `
                    * { animation: none !important; transition: none !important; }
                    .dt-fade { opacity: 1 !important; transform: none !important; }
                `
            });

            // ✅ 수정 2: 폰트 로딩 완료 대기
            await page.evaluate(() => document.fonts.ready);

            // ✅ 수정 3: 이미지 전부 로드될 때까지 대기
            await page.evaluate(() =>
                Promise.all(
                    [...document.images].map(img =>
                        img.complete
                            ? Promise.resolve()
                            : new Promise(resolve => {
                                img.onload = resolve;
                                img.onerror = resolve; // 실패해도 진행
                            })
                    )
                )
            );

            // ✅ 수정 4: 추가 안정화 대기 (폰트 렌더링 마무리)
            await page.waitForTimeout(1500);

            await page.screenshot({ path: filePath, fullPage: true });

            console.log(`✅ OK  ${p.name} -> ${filePath}`);
            results.push({ name: p.name, url: p.url, ok: true, file: filePath });
        } catch (e) {
            console.error(`❌ FAIL ${p.name} (${p.url})`);
            console.error(e?.message ?? e);
            results.push({ name: p.name, url: p.url, ok: false, error: e?.message ?? String(e) });
        }
    }

    await browser.close();

    const reportPath = path.join(OUT_DIR, 'report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`\n📄 Report saved: ${reportPath}`);
})();