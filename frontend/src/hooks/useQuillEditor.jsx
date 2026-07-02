/**
 * useQuillEditor
 * quill-editor.js (타임리프 버전) 로직을 그대로 React 훅으로 이식
 * (Quill CDN 방식 → npm 패키지 방식으로 교체, quill-image-resize-module 제거)
 */

import DOMPurify from 'dompurify'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { useEffect, useRef, useCallback, useState } from 'react'
import toast from '@/utils/toast'

const FONT_SIZES    = [false, '10px','12px','14px','16px','18px','20px','24px','28px','32px','36px']

// 링크 툴팁 초기 상태
const TIP_INIT = { visible: false, top: 0, left: 0, url: '', text: '' }

const useQuillEditor = ({ onImageUpload, onReady, onChange, initialValue } = {}) => {
  const containerRef   = useRef(null)
  const quillRef       = useRef(null)
  const uploadRef      = useRef(onImageUpload)
  const onReadyRef     = useRef(onReady)
  const onChangeRef    = useRef(onChange)
  const initialValRef  = useRef(initialValue)   // 초기화 시점의 값 보존
  useEffect(() => { uploadRef.current    = onImageUpload }, [onImageUpload])
  useEffect(() => { onReadyRef.current   = onReady }, [onReady])
  useEffect(() => { onChangeRef.current  = onChange }, [onChange])
  // initialValue가 나중에 변경될 경우(부모 데이터 로드 후) Quill에 주입
  useEffect(() => {
    if (!initialValue) return
    initialValRef.current = initialValue
    // Quill이 이미 초기화된 경우 직접 주입
    if (quillRef.current) {
      quillRef.current.root.innerHTML = DOMPurify.sanitize(initialValue || '')
    }
    // 미초기화 경우는 위 init 블록에서 initialValRef.current를 읽어 처리
  }, [initialValue])

  // ── 링크 툴팁 상태 (원본: window.currentLinkRange 대신 ref 사용) ──
  const [tip, setTip]   = useState(TIP_INIT)
  const linkRangeRef    = useRef(null)

  // ── Quill 초기화 ──────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // 의존성 배열 [] 의도적: Quill은 마운트 1회만 초기화.
  // imageHandler·showLinkTooltip·setupDragAndDrop·setupPaste 모두
  // ref(quillRef, uploadRef)에만 의존하므로 재생성 없이 안전하게 참조 가능.
  useEffect(() => {
    let dead = false

    const init = () => {
      if (dead || !containerRef.current || quillRef.current) return

      // registerCustomFontSizes()
      const Size = Quill.import('attributors/style/size')
      Size.whitelist = FONT_SIZES
      Quill.register(Size, true)

      const quill = new Quill(containerRef.current, {
        theme: 'snow',
        placeholder: '내용을 입력하세요... (이미지를 드래그하여 추가할 수 있습니다)',
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              [{ size: FONT_SIZES }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ color: [] }, { background: [] }],
              [{ align: [] }],
              ['link', 'image'],
              ['clean'],
            ],
          },
        },
      })

      // toolbar.addHandler — 원본과 동일
      const toolbar = quill.getModule('toolbar')
      toolbar.addHandler('image', () => imageHandler(quill))
      toolbar.addHandler('link',  () => showLinkTooltip(quill))

      setupDragAndDrop(quill)
      setupPaste(quill)
      setupImageResize(quill)
      quillRef.current = quill

      // 내용 변경 시 즉시 알림 (폴링 대체) — 미리보기 등에서 사용
      quill.on('text-change', () => {
        const html = quill.root.innerHTML
        const isEmpty = quill.root.textContent.trim() === '' && !quill.root.querySelector('img')
        onChangeRef.current?.(isEmpty ? '' : html)
      })

      // initialValue가 있으면 초기 내용 주입
      if (initialValRef.current) {
        quill.root.innerHTML = DOMPurify.sanitize(initialValRef.current || '')
      }

      // 초기화 완료 알림 — 대기 중인 setHTML 등을 안전하게 실행
      onReadyRef.current?.()
    }

    const t = setTimeout(init, 50)
    return () => { dead = true; clearTimeout(t); quillRef.current = null }
  }, [])

  // ── imageHandler (원본 그대로) ────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // uploadRef(ref)에만 의존 → [] 의존성 안전
  const imageHandler = useCallback((quill) => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files[0]
      if (!file) return
      if (!file.type.startsWith('image/')) { toast.error('이미지 파일만 업로드 가능합니다.'); return }
      if (file.size > 20 * 1024 * 1024) { toast.error('이미지 크기는 20MB를 초과할 수 없습니다.'); return }

      try {
        const range = quill.getSelection(true)
        quill.insertText(range.index, '이미지 업로드 중...', 'user')
        const imageUrl = await uploadRef.current(file)
        quill.deleteText(range.index, '이미지 업로드 중...'.length)
        quill.insertEmbed(range.index, 'image', imageUrl, 'user')
        quill.setSelection(range.index + 1)
      } catch (err) {
        quill.deleteText(quill.getSelection()?.index ?? 0, '이미지 업로드 중...'.length)
        const msg = err?.response?.data?.message ?? '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
        toast.error(msg)
      }
    }
  }, [])

  // ── setupDragAndDrop — 컨테이너 전체(툴바 포함)를 드래그 영역으로 처리 ──
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // containerRef·uploadRef(ref)에만 의존 → [] 의존성 안전
  const setupDragAndDrop = useCallback((quill) => {
    // quill.root = div.ql-editor (내용 영역)
    // containerRef.current = 바깥 래퍼(툴바 + 에디터 모두 포함)
    const container = containerRef.current
    const editorEl  = quill.root

    container.addEventListener('drop', async (e) => {
      e.preventDefault(); e.stopPropagation()
      editorEl.style.backgroundColor = ''
      const files = e.dataTransfer.files
      if (!files.length) return

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue
        if (file.size > 20 * 1024 * 1024) { toast.error('이미지 크기는 20MB를 초과할 수 없습니다.'); continue }
        try {
          const range = quill.getSelection(true)
          const index = range ? range.index : quill.getLength()
          quill.insertText(index, '이미지 업로드 중...', 'user')
          const imageUrl = await uploadRef.current(file)
          quill.deleteText(index, '이미지 업로드 중...'.length)
          quill.insertEmbed(index, 'image', imageUrl, 'user')
          quill.setSelection(index + 1)
        } catch (err) {
          const msg = err?.response?.data?.message ?? '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
          toast.error(msg)
        }
      }
    })

    container.addEventListener('dragover',  (e) => { e.preventDefault(); e.stopPropagation(); editorEl.style.backgroundColor = '#f1f5f9' })
    container.addEventListener('dragleave', (e) => {
      // 컨테이너 바깥으로 나갈 때만 배경 초기화 (자식 요소 이동은 무시)
      if (!container.contains(e.relatedTarget)) {
        editorEl.style.backgroundColor = ''
      }
    })
  }, [])

  // ── setupPaste (원본 그대로) ──────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // uploadRef(ref)에만 의존 → [] 의존성 안전
  const setupPaste = useCallback((quill) => {
    quill.root.addEventListener('paste', async (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault()
          const file = items[i].getAsFile()
          try {
            const range = quill.getSelection(true)
            const index = range ? range.index : quill.getLength()
            quill.insertText(index, '이미지 업로드 중...', 'user')
            const imageUrl = await uploadRef.current(file)
            quill.deleteText(index, '이미지 업로드 중...'.length)
            quill.insertEmbed(index, 'image', imageUrl, 'user')
            quill.setSelection(index + 1)
          } catch (err) {
            const msg = err?.response?.data?.message ?? '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
            toast.error(msg)
          }
          break
        }
      }
    })
  }, [])

  // ── setupImageResize ─────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setupImageResize = useCallback((quill) => {
    const editor    = quill.root              // .ql-editor (편집 영역)
    const container = quill.root.parentNode   // .ql-container (핸들 부착 대상)
    let activeImg = null
    let handle    = null
    let startX, startW

    const removeHandle = () => {
      if (handle)    { handle.remove(); handle = null }
      if (activeImg) { activeImg.style.outline = ''; activeImg = null }
    }

    const updateHandlePos = (img) => {
      if (!handle) return
      const imgRect       = img.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      handle.style.left = (imgRect.right  - containerRect.left - 6) + 'px'
      handle.style.top  = (imgRect.bottom - containerRect.top  - 6) + 'px'
    }

    const createHandle = (img) => {
      removeHandle()
      activeImg = img
      img.style.outline = '2px solid #2563eb'

      // Quill 선택 영역을 이미지 위치로 설정 → 툴바 정렬 버튼 즉시 동작
      const blot = Quill.find(img)
      if (blot) {
        const index = quill.getIndex(blot)
        quill.setSelection(index, 1, 'silent')
      }

      handle = document.createElement('div')
      handle.style.cssText = [
        'position:absolute', 'width:12px', 'height:12px',
        'background:#2563eb', 'border:2px solid #fff',
        'border-radius:2px', 'cursor:se-resize', 'z-index:9999',
      ].join(';')

      // .ql-container에 붙임 — 에디터 내부 DOM 간섭 방지
      container.style.position = 'relative'
      container.appendChild(handle)
      updateHandlePos(img)

      handle.addEventListener('mousedown', (e) => {
        e.preventDefault()
        e.stopPropagation()
        startX = e.clientX
        startW = img.offsetWidth

        const onMove = (e) => {
          const newW = Math.max(50, startW + (e.clientX - startX))
          img.style.width  = newW + 'px'
          img.style.height = 'auto'
          updateHandlePos(img)
        }
        const onUp = () => {
          document.removeEventListener('mousemove', onMove)
          document.removeEventListener('mouseup',   onUp)
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup',   onUp)
      })
    }

    editor.addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG') createHandle(e.target)
      else if (e.target !== handle)   removeHandle()
    })

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) removeHandle()
    })
  }, [])

  // ── showLinkTooltip ───────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // setTip(setState)·linkRangeRef(ref)에만 의존 → [] 의존성 안전
  const showLinkTooltip = useCallback((quill) => {
    const range = quill.getSelection()
    if (!range) return

    linkRangeRef.current = range
    const selectedText = quill.getText(range.index, range.length)

    const linkButton = document.querySelector('.ql-link')
    if (!linkButton) return

    const rect = linkButton.getBoundingClientRect()

    setTip({
      visible: true,
      top:     rect.bottom + 5,   // 원본: rect.bottom + 5
      left:    rect.left,          // 원본: rect.left
      url:     '',
      text:    selectedText || '',
    })

    setTimeout(() => document.getElementById('ql-link-url-input')?.focus(), 100)
  }, [])

  // ── hideLinkTooltip ───────────────────────────────────────────────
  // setTip(setState)에만 의존 → [] 의존성 안전 (함수형 업데이트)
  const hideLinkTooltip = useCallback(() => {
    setTip((p) => ({ ...p, visible: false }))
  }, [])

  // ── insertLinkFromTooltip ─────────────────────────────────────────
  // tip 상태와 hideLinkTooltip에 의존 → [tip, hideLinkTooltip] 정상
  const insertLinkFromTooltip = useCallback(() => {
    const url  = tip.url.trim()
    const text = tip.text.trim()

    if (!url) { document.getElementById('ql-link-url-input')?.focus(); return }

    const range = linkRangeRef.current
    const quill = quillRef.current
    if (!range || !quill) { hideLinkTooltip(); return }

    if (text) {
      quill.deleteText(range.index, range.length)
      quill.insertText(range.index, text, 'link', url)
      quill.setSelection(range.index + text.length)
    } else {
      if (range.length > 0) {
        quill.formatText(range.index, range.length, 'link', url)
      } else {
        quill.insertText(range.index, url, 'link', url)
        quill.setSelection(range.index + url.length)
      }
    }

    hideLinkTooltip()
  }, [tip, hideLinkTooltip])

  // ── getHTML / setHTML ─────────────────────────────────────────────
  // quillRef(ref)에만 의존 → [] 의존성 안전
  const getHTML = useCallback(() => {
    if (!quillRef.current) return ''
    const root = quillRef.current.root
    const isEmpty = root.textContent.trim() === '' && !root.querySelector('img')
    return isEmpty ? '' : root.innerHTML
  }, [])

  // quillRef(ref)에만 의존 → [] 의존성 안전
  const setHTML = useCallback((html) => {
    if (quillRef.current) quillRef.current.root.innerHTML = DOMPurify.sanitize(html || '')
  }, [])

  // ── LinkTooltip 컴포넌트 ─────────────────────────────────────────
  // tip 상태·insertLinkFromTooltip·hideLinkTooltip에 의존
  // → [tip, insertLinkFromTooltip, hideLinkTooltip] 정상
  const LinkTooltip = useCallback(() => {
    if (!tip.visible) return null
    return (
      <div
        id="linkTooltip"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position:     'fixed',
          top:          tip.top,
          left:         tip.left,
          display:      'block',
          background:   '#4a5568',
          borderRadius: 4,
          padding:      12,
          boxShadow:    '0 4px 12px rgba(0,0,0,0.3)',
          zIndex:       99999,
          minWidth:     320,
        }}
      >
        <label style={{ display: 'block', color: '#e2e8f0', fontSize: 11, marginBottom: 4 }}>URL</label>
        <input
          id="ql-link-url-input"
          type="text"
          value={tip.url}
          onChange={(e) => setTip((p) => ({ ...p, url: e.target.value }))}
          onKeyDown={(e) => { if (e.key === 'Enter') insertLinkFromTooltip(); if (e.key === 'Escape') hideLinkTooltip() }}
          placeholder="https://example.com"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#2d3748', border: '1px solid #4a5568',
            color: '#fff', padding: '6px 8px', borderRadius: 3,
            fontSize: 13, marginBottom: 8, outline: 'none',
          }}
        />

        <label style={{ display: 'block', color: '#e2e8f0', fontSize: 11, marginBottom: 4 }}>텍스트 (선택사항)</label>
        <input
          type="text"
          value={tip.text}
          onChange={(e) => setTip((p) => ({ ...p, text: e.target.value }))}
          onKeyDown={(e) => { if (e.key === 'Enter') insertLinkFromTooltip(); if (e.key === 'Escape') hideLinkTooltip() }}
          placeholder="링크 텍스트"
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#2d3748', border: '1px solid #4a5568',
            color: '#fff', padding: '6px 8px', borderRadius: 3,
            fontSize: 13, marginBottom: 8, outline: 'none',
          }}
        />

        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            onClick={hideLinkTooltip}
            style={{ padding: '5px 12px', background: 'transparent', color: '#e2e8f0', border: 'none', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}
          >
            취소
          </button>
          <button
            onClick={insertLinkFromTooltip}
            style={{ padding: '5px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 3, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            삽입
          </button>
        </div>
      </div>
    )
  }, [tip, insertLinkFromTooltip, hideLinkTooltip])

  return { containerRef, getHTML, setHTML, LinkTooltip }
}

export default useQuillEditor
