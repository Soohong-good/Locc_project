/**
 * 설교 녹취록 텍스트 → 구조화 HTML 변환 (단일 출처)
 *
 * 송구영신예배(NewYear) 녹취록과 설교 PDF 자동 추출 본문에서 공통 사용한다.
 * 출력 HTML은 `.sermon-body` 컨테이너 하위에서 `sermon-*` 스타일(index.css)로 렌더된다.
 *
 * [에디터로 저장된 경우] p태그가 여러 개 → 그대로 반환
 * [텍스트로 저장된 경우] 아래 규칙으로 구조화:
 *   빈 줄          → 단락 구분
 *   서론/본론       → <h2> 섹션 헤더
 *   결론-...        → <h2> 섹션 헤더
 *   1. 2. 3.        → <h3> 대항목
 *   1) 2) 3) 4)     → <p class="sermon-sub"> 소항목
 *   책명장:절 "..." → <p class="sermon-ref"> + <blockquote class="sermon-quote">
 *   "..."           → <blockquote class="sermon-quote">
 *   -설명문         → <p class="sermon-desc"> 들여쓰기 설명
 *   그 외           → <p class="sermon-p"> 일반 단락
 */

/** XSS 방지: 텍스트 노드를 HTML에 삽입하기 전 이스케이프 */
export function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export function formatTranscript(html) {
  if (!html) return html

  // 에디터로 저장된 구조화 데이터 → 그대로 반환
  // 단, Quill이 생성한 <p><span style=...> 패턴은 재처리 필요
  const pCount = (html.match(/<p[\s>]/gi) || []).length
  const isQuillHtml = html.includes('<span style=') || html.includes('<span class=')
  if (pCount > 1 && !isQuillHtml) return html

  // Quill HTML인 경우 — 태그 제거 후 텍스트만 추출하여 재처리
  let rawText = html
  if (isQuillHtml) {
    rawText = html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')   // 나머지 태그 제거
      .replace(/&nbsp;/g, ' ')
      .trim()
    const lines2 = rawText.split('\n').map((l) => l.trim())
    const result2 = []
    for (const line of lines2) {
      if (!line) continue
      result2.push(`<p class="sermon-p">${escapeHtml(line)}</p>`)
    }
    return result2.join('\n')
  }

  // 내부 텍스트 추출
  const inner = html
    .replace(/^<p[^>]*>/i, '')
    .replace(/<\/p>$/i, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .trim()

  // 리터럴 \n 문자열(DB 저장 아티팩트)을 실제 줄바꿈으로 변환
  const normalized = inner.replace(/\\n/g, '\n')

  // 줄 단위로 분리
  const lines = normalized.split('\n').map((l) => l.trim())

  // blocks: 렌더 직전까지 원문 텍스트를 들고 있다가 마지막에 escape+태그를 씌운다.
  // appendable=true인 블록은, 새 패턴으로 시작하지 않는 다음 줄(=PDF 컬럼폭 줄바꿈으로
  // 끊긴 같은 문장의 나머지)을 계속 이어붙일 수 있다. 빈 줄을 만나면 이어붙이기를 멈춘다.
  const blocks = []
  let lastAppendable = null
  let titleDone = false // 첫 타이틀 블록 처리 여부

  const pushBlock = (tag, className, text, appendable) => {
    const block = { tag, className, text }
    blocks.push(block)
    lastAppendable = appendable ? block : null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // 빈 줄 → 단락 구분(이어붙이기 중단), 스킵
    if (line === '') { lastAppendable = null; continue }

    // ── 첫 번째 타이틀 블록 ──────────────────────────────────────
    if (!titleDone) {
      // 날짜 패턴으로 시작하면 타이틀 (예: "12.31, 2025. 송구영신예배")
      if (/^\d+\.\d+/.test(line)) {
        pushBlock('p', 'sermon-title-date', line, false)
        continue
      }
      // 서론/본론/결론/숫자/인용이 아니면 주제 성구
      if (!/^(서론|본론|결론)/.test(line) && !/^[1-9]/.test(line) && !/^[-"]/.test(line)) {
        pushBlock('p', 'sermon-title-verse', line, false)
        continue
      }
      titleDone = true
    }

    // 서론 / 본론
    if (/^(서론|본론)\s*$/.test(line)) {
      pushBlock('h2', 'sermon-section', line, false)
      continue
    }

    // 결론-... (결론 뒤에 설명이 붙는 형태)
    if (/^결론/.test(line)) {
      pushBlock('h2', 'sermon-section', line, false)
      continue
    }

    // 1. 2. 3. 대항목
    if (/^[1-9]\d*\.[가-힣]/.test(line)) {
      pushBlock('h3', 'sermon-h3', line, false)
      continue
    }

    // 1) 2) 3) 소항목
    if (/^[1-9]\d*\)[가-힣]/.test(line)) {
      pushBlock('p', 'sermon-sub', line, true)
      continue
    }

    // 책명+장절 "인용" — 예: 딤후3:1-2 "...", 시145:1 "..."
    const refQuoteMatch = line.match(/^([가-힣]{1,4}\d+:\d+[\d\-,b]*)\s+([“”"].+)$/)
    if (refQuoteMatch) {
      pushBlock('p', 'sermon-ref', refQuoteMatch[1], false)
      pushBlock('blockquote', 'sermon-quote', refQuoteMatch[2], true)
      continue
    }

    // 큰따옴표로 시작하는 인용 (책명 없이)
    if (/^[“”"]/.test(line)) {
      pushBlock('blockquote', 'sermon-quote', line, true)
      continue
    }

    // - 설명문
    if (/^-[가-힣]/.test(line)) {
      pushBlock('p', 'sermon-desc', line, true)
      continue
    }

    // 새 패턴으로 시작하지 않는 줄 — PDF 컬럼폭 줄바꿈으로 끊긴 이전 문장의
    // 나머지일 가능성이 높으므로, 이어붙일 블록이 있으면 그대로 붙인다
    // (컬럼 줄바꿈은 대부분 단어 중간에서 끊기므로 공백 없이 이어붙임).
    if (lastAppendable) {
      lastAppendable.text += line
    } else {
      pushBlock('p', 'sermon-p', line, true)
    }
  }

  return blocks
    .map(({ tag, className, text }) => `<${tag} class="${className}">${escapeHtml(text)}</${tag}>`)
    .join('\n')
}
