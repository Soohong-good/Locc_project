/**
 * 공통 Quill 에디터 모듈
 * 설교, 공지사항 등 모든 컨텐츠 에디터에서 사용
 */

const QuillEditor = (function() {
    
    /**
     * 커스텀 폰트 크기 등록
     */
    function registerCustomFontSizes() {
        if (!window.Quill) {
            console.warn('Quill이 로드되지 않았습니다.');
            return;
        }
        
        const Size = Quill.import('formats/size');
        Size.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'];
        Quill.register(Size, true);
        
        console.log('커스텀 폰트 크기 등록 완료');
    }
    
    /**
     * ImageResize 모듈 등록
     */
    function registerImageResize() {
        if (window.Quill && window.ImageResize) {
            Quill.register('modules/imageResize', ImageResize.default);
            console.log('ImageResize 모듈 등록 완료');
        }
    }
    
    /**
     * Quill 에디터 초기화
     * @param {string} selector - 에디터 요소 선택자 (예: '#noticeContent')
     * @param {Object} options - 추가 옵션
     * @param {string} options.placeholder - 플레이스홀더 텍스트
     * @param {string} options.uploadUrl - 이미지 업로드 API URL
     * @param {number} options.height - 에디터 높이 (기본: 300)
     * @returns {Object} Quill 인스턴스
     */
    function init(selector, options = {}) {
        const element = document.querySelector(selector);
        if (!element) {
            console.error(`에디터 요소를 찾을 수 없습니다: ${selector}`);
            return null;
        }
        
        // 기본 옵션
        const defaultOptions = {
            placeholder: '내용을 입력하세요... (이미지를 드래그하여 추가할 수 있습니다)',
            uploadUrl: '/api/upload-image',
            height: 300
        };
        
        const config = { ...defaultOptions, ...options };
        
        // 높이 설정
        element.style.height = config.height + 'px';
        
        // Quill 인스턴스 생성
        const quill = new Quill(selector, {
            theme: 'snow',
            placeholder: config.placeholder,
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    [{ 'size': ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px'] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    ['link', 'image'],
                    ['clean']
                ],
                imageResize: {
                    displaySize: true,
                    modules: ['Resize', 'DisplaySize', 'Toolbar']
                }
            }
        });
        
        // 커스텀 핸들러 등록
        const toolbar = quill.getModule('toolbar');
        toolbar.addHandler('image', () => imageHandler(quill, config.uploadUrl));
        toolbar.addHandler('link', () => showLinkTooltip(quill));
        
        // 드래그 앤 드롭 이벤트 설정
        setupDragAndDrop(quill, config.uploadUrl);
        
        // 붙여넣기 이벤트 설정
        setupPaste(quill, config.uploadUrl);
        
        console.log('Quill 에디터 초기화 완료:', selector);
        return quill;
    }
    
    /**
     * 이미지 업로드 핸들러 (툴바 버튼)
     * @param {Object} quill - Quill 인스턴스
     * @param {string} uploadUrl - 업로드 API URL
     */
    function imageHandler(quill, uploadUrl) {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
        
        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;
            
            // 이미지 파일 검증
            if (!file.type.startsWith('image/')) {
                showToast('이미지 파일만 업로드 가능합니다.', 'error');
                return;
            }
            
            // 파일 크기 검증 (10MB)
            if (file.size > 10 * 1024 * 1024) {
                showToast('이미지 크기는 10MB를 초과할 수 없습니다.', 'error');
                return;
            }
            
            try {
                // 업로드 중 표시
                const range = quill.getSelection(true);
                quill.insertText(range.index, '이미지 업로드 중...', 'user');
                
                // 이미지 업로드
                const imageUrl = await uploadImage(file, uploadUrl);
                
                // 로딩 텍스트 삭제
                quill.deleteText(range.index, '이미지 업로드 중...'.length);
                
                // 이미지 삽입
                quill.insertEmbed(range.index, 'image', imageUrl, 'user');
                quill.setSelection(range.index + 1);
                
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
                showToast(error.message || '이미지 업로드에 실패했습니다.', 'error');
                
                // 로딩 텍스트 삭제
                const range = quill.getSelection();
                if (range) {
                    quill.deleteText(range.index - '이미지 업로드 중...'.length, '이미지 업로드 중...'.length);
                }
            }
        };
    }
    
    /**
     * 이미지 업로드
     * @param {File|Blob} imageFile - 업로드할 이미지 파일
     * @param {string} uploadUrl - 업로드 API URL
     * @returns {Promise<string>} 업로드된 이미지 URL
     */
    async function uploadImage(imageFile, uploadUrl) {
        if (!checkToken()) {
            throw new Error('로그인이 필요합니다.');
        }
        
        const formData = new FormData();
        formData.append('upload', imageFile);
        
        const token = localStorage.getItem('accessToken');
        
        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (handleAuthError(response)) {
            throw new Error('인증에 실패했습니다.');
        }
        
        if (!response.ok) {
            throw new Error('이미지 업로드에 실패했습니다.');
        }
        
        const data = await response.json();
        return data.url;
    }
    
    /**
     * 드래그 앤 드롭 이벤트 설정
     * @param {Object} quill - Quill 인스턴스
     * @param {string} uploadUrl - 업로드 API URL
     */
    function setupDragAndDrop(quill, uploadUrl) {
        const editor = quill.root;
        
        editor.addEventListener('drop', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            editor.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            if (files.length === 0) return;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                
                // 이미지 파일만 처리
                if (!file.type.startsWith('image/')) {
                    continue;
                }
                
                // 파일 크기 검증 (10MB)
                if (file.size > 10 * 1024 * 1024) {
                    showToast('이미지 크기는 10MB를 초과할 수 없습니다.', 'error');
                    continue;
                }
                
                try {
                    // 드롭 위치 계산
                    const range = quill.getSelection(true);
                    const index = range ? range.index : quill.getLength();
                    
                    // 업로드 중 표시
                    quill.insertText(index, '이미지 업로드 중...', 'user');
                    
                    // 이미지 업로드
                    const imageUrl = await uploadImage(file, uploadUrl);
                    
                    // 로딩 텍스트 삭제
                    quill.deleteText(index, '이미지 업로드 중...'.length);
                    
                    // 이미지 삽입
                    quill.insertEmbed(index, 'image', imageUrl, 'user');
                    quill.setSelection(index + 1);
                    
                } catch (error) {
                    console.error('이미지 업로드 실패:', error);
                    showToast(error.message || '이미지 업로드에 실패했습니다.', 'error');
                }
            }
        });
        
        editor.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            editor.style.backgroundColor = '#f1f5f9';
        });
        
        editor.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            editor.style.backgroundColor = '';
        });
    }
    
    /**
     * 붙여넣기 이벤트 설정 (클립보드 이미지)
     * @param {Object} quill - Quill 인스턴스
     * @param {string} uploadUrl - 업로드 API URL
     */
    function setupPaste(quill, uploadUrl) {
        const editor = quill.root;
        
        editor.addEventListener('paste', async function(e) {
            const items = e.clipboardData?.items;
            if (!items) return;
            
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const file = items[i].getAsFile();
                    
                    try {
                        const range = quill.getSelection(true);
                        const index = range ? range.index : quill.getLength();
                        
                        // 업로드 중 표시
                        quill.insertText(index, '이미지 업로드 중...', 'user');
                        
                        // 이미지 업로드
                        const imageUrl = await uploadImage(file, uploadUrl);
                        
                        // 로딩 텍스트 삭제
                        quill.deleteText(index, '이미지 업로드 중...'.length);
                        
                        // 이미지 삽입
                        quill.insertEmbed(index, 'image', imageUrl, 'user');
                        quill.setSelection(index + 1);
                        
                    } catch (error) {
                        console.error('이미지 업로드 실패:', error);
                        showToast(error.message || '이미지 업로드에 실패했습니다.', 'error');
                    }
                    break;
                }
            }
        });
    }
    
    /**
     * 링크 툴팁 표시
     * @param {Object} quill - Quill 인스턴스
     */
    function showLinkTooltip(quill) {
        const range = quill.getSelection();
        if (!range) return;
        
        // 현재 커서 위치 저장
        window.currentLinkRange = range;
        window.currentQuillInstance = quill;
        
        // 선택된 텍스트 가져오기
        const selectedText = quill.getText(range.index, range.length);
        document.getElementById('linkTextInput').value = selectedText || '';
        document.getElementById('linkUrlInput').value = '';
        
        // 링크 버튼 위치 찾기
        const linkButton = document.querySelector('.ql-link');
        if (linkButton) {
            const rect = linkButton.getBoundingClientRect();
            const tooltip = document.getElementById('linkTooltip');
            tooltip.style.display = 'block';
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = (rect.bottom + 5) + 'px';
            
            // URL 입력창에 포커스
            setTimeout(() => {
                document.getElementById('linkUrlInput').focus();
            }, 100);
        }
    }
    
    /**
     * 링크 툴팁 숨기기
     */
    function hideLinkTooltip() {
        const tooltip = document.getElementById('linkTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    /**
     * 툴팁에서 링크 삽입
     */
    function insertLinkFromTooltip() {
        const url = document.getElementById('linkUrlInput').value.trim();
        const text = document.getElementById('linkTextInput').value.trim();
        
        if (!url) {
            showToast('URL을 입력해주세요.', 'error');
            return;
        }
        
        const range = window.currentLinkRange;
        const quill = window.currentQuillInstance;
        
        if (!range || !quill) {
            hideLinkTooltip();
            return;
        }
        
        // 링크 삽입
        if (text) {
            // 텍스트가 있으면 현재 선택 영역 삭제하고 새 텍스트 삽입
            quill.deleteText(range.index, range.length);
            quill.insertText(range.index, text, 'link', url);
            quill.setSelection(range.index + text.length);
        } else {
            // 텍스트가 없으면 선택된 영역에 링크만 적용
            if (range.length > 0) {
                quill.formatText(range.index, range.length, 'link', url);
            } else {
                // 선택 영역이 없으면 URL을 텍스트로 삽입
                quill.insertText(range.index, url, 'link', url);
                quill.setSelection(range.index + url.length);
            }
        }
        
        hideLinkTooltip();
    }
    
    /**
     * 에디터 내용 가져오기
     * @param {Object} quill - Quill 인스턴스
     * @returns {string} HTML 내용
     */
    function getContent(quill) {
        return quill ? quill.root.innerHTML : '';
    }
    
    /**
     * 에디터 내용 설정
     * @param {Object} quill - Quill 인스턴스
     * @param {string} content - HTML 내용
     */
    function setContent(quill, content) {
        if (quill) {
            quill.root.innerHTML = content || '';
        }
    }
    
    /**
     * 에디터 내용 초기화
     * @param {Object} quill - Quill 인스턴스
     */
    function clearContent(quill) {
        if (quill) {
            quill.setContents([]);
        }
    }
    
    // 공개 API
    return {
        registerCustomFontSizes,
        registerImageResize,
        init,
        getContent,
        setContent,
        clearContent,
        hideLinkTooltip,
        insertLinkFromTooltip
    };
})();

// 전역 네임스페이스로 노출
window.QuillEditor = QuillEditor;
