import { useEffect, useRef } from 'react'

const QUILL_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.snow.min.css'
const QUILL_JS  = 'https://cdnjs.cloudflare.com/ajax/libs/quill/1.3.7/quill.min.js'

/**
 * Quill 에디터 훅
 *
 * @param {object} options
 * @param {string}   options.initialValue  - 초기 HTML 값 (수정 모드)
 * @param {Function} options.onChange      - (html: string) => void
 * @param {Function} options.onImageUpload - (file: File) => Promise<string>  (URL 반환)
 *
 * @returns {{ containerRef, getHTML }}
 *   containerRef: <div ref={containerRef} /> 에 연결
 *   getHTML:      현재 에디터 HTML 반환 함수
 */
const useQuillEditor = ({ initialValue = '', onChange, onImageUpload } = {}) => {
  const containerRef = useRef(null)
  const quillRef     = useRef(null)
  const onChangeRef  = useRef(onChange)
  const uploadRef    = useRef(onImageUpload)

  // ref 최신값 유지 (re-render 없이)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])
  useEffect(() => { uploadRef.current   = onImageUpload }, [onImageUpload])

  useEffect(() => {
    if (!containerRef.current) return

    // CSS 로드 (중복 방지)
    const loadCSS = () => {
      if (!document.querySelector(`link[href="${QUILL_CSS}"]`)) {
        const link = document.createElement('link')
        link.rel  = 'stylesheet'
        link.href = QUILL_CSS
        document.head.appendChild(link)
      }
    }

    // JS 로드 → Quill 초기화
    const initQuill = () => {
      if (quillRef.current) return // 이미 초기화됨

      const Quill = window.Quill
      if (!Quill) return

      // 이미지 업로드 핸들러
      const imageHandler = () => {
        const input = document.createElement('input')
        input.type   = 'file'
        input.accept = 'image/*'
        input.onchange = async () => {
          const file = input.files[0]
          if (!file || !uploadRef.current) return
          try {
            const url   = await uploadRef.current(file)
            const range = quillRef.current.getSelection(true)
            quillRef.current.insertEmbed(range.index, 'image', url)
            quillRef.current.setSelection(range.index + 1)
          } catch (err) {
            console.error('이미지 업로드 실패:', err)
          }
        }
        input.click()
      }

      const quill = new Quill(containerRef.current, {
        theme: 'snow',
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              [{ align: [] }],
              ['link', 'image'],
              ['clean'],
            ],
            handlers: { image: imageHandler },
          },
        },
      })

      // 초기값 설정
      if (initialValue) {
        quill.root.innerHTML = initialValue
      }

      // 변경 이벤트
      quill.on('text-change', () => {
        const html = quill.root.innerHTML
        onChangeRef.current?.(html === '<p><br></p>' ? '' : html)
      })

      quillRef.current = quill
    }

    loadCSS()

    if (window.Quill) {
      initQuill()
    } else {
      // 이미 script 태그가 있으면 로드 이벤트만 기다림
      let script = document.querySelector(`script[src="${QUILL_JS}"]`)
      if (!script) {
        script     = document.createElement('script')
        script.src = QUILL_JS
        document.head.appendChild(script)
      }
      script.addEventListener('load', initQuill)
      return () => script.removeEventListener('load', initQuill)
    }
  }, []) // mount 1회만

  // 초기값이 나중에 세팅되는 경우 (수정 모드: 데이터 로딩 후)
  useEffect(() => {
    if (quillRef.current && initialValue && !quillRef.current._initialSet) {
      quillRef.current.root.innerHTML = initialValue
      quillRef.current._initialSet    = true
    }
  }, [initialValue])

  const getHTML = () => {
    if (!quillRef.current) return ''
    const html = quillRef.current.root.innerHTML
    return html === '<p><br></p>' ? '' : html
  }

  return { containerRef, getHTML }
}

export default useQuillEditor
