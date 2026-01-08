/**
 * 공지사항 목록 페이지 스크립트
 * church/notice/list.html
 */

// 네임스페이스로 함수 격리
const NoticeList = (function() {
    // 비공개 변수
    let quill = null; // Quill 에디터 인스턴스
    let currentNoticeId = null; // 삭제용
    
    /**
     * 페이지 로드 시 초기화
     */
    function init() {
        console.log('공지사항 목록 페이지 초기화');
        
        // Quill 모듈 등록
        QuillEditor.registerCustomFontSizes();
        QuillEditor.registerImageResize();
        
        // 모달 외부 클릭 시 닫기
        window.addEventListener('click', function(event) {
            const noticeModal = document.getElementById('noticeModal');
            const deleteModal = document.getElementById('deleteModal');
            
            if (event.target === noticeModal) {
                closeModal();
            }
            if (event.target === deleteModal) {
                closeDeleteModal();
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeModal();
                closeDeleteModal();
            }
        });
        
        // 파일 선택 이벤트 리스너
        const fileInput = document.getElementById('noticeFiles');
        if (fileInput) {
            fileInput.addEventListener('change', handleFileSelect);
        }
    }
    
    /**
     * Quill 에디터 초기화
     */
    function initEditor() {
        if (quill) return;
        
        quill = QuillEditor.init('#noticeContent', {
            placeholder: '공지사항 내용을 입력하세요... (이미지를 드래그하여 추가할 수 있습니다)',
            uploadUrl: '/api/notices/upload-image',
            height: 400
        });
        
        console.log('공지사항 에디터 초기화 완료');
    }
    
    /**
     * 파일 선택 이벤트 처리
     * @param {Event} event - 파일 선택 이벤트
     */
    function handleFileSelect(event) {
        const fileListDiv = document.getElementById('fileList');
        if (!fileListDiv) return;
        
        fileListDiv.innerHTML = '';
        const files = event.target.files;
        
        if (files.length === 0) return;
        
        for (let i = 0; i < files.length; i++) {
            const fileDiv = document.createElement('div');
            fileDiv.textContent = files[i].name;
            fileListDiv.appendChild(fileDiv);
        }
    }
    
    /**
     * 새 공지사항 작성 모달 열기
     */
    function openWriteModal() {
        if (!checkToken()) return;
        
        console.log('새 공지사항 모달 열기');
        
        // Quill 에디터 초기화
        if (!quill) {
            initEditor();
        } else {
            QuillEditor.clearContent(quill);
        }
        
        // 제목 초기화
        const titleInput = document.getElementById('noticeTitle');
        if (titleInput) {
            titleInput.value = '';
        }
        
        // 파일 목록 초기화
        const fileListDiv = document.getElementById('fileList');
        if (fileListDiv) {
            fileListDiv.innerHTML = '';
        }
        
        // 파일 input 초기화
        const fileInput = document.getElementById('noticeFiles');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // 에러 메시지 숨김
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
            errorMsg.classList.add('hidden');
        }
        
        // 모달 열기
        const modal = document.getElementById('noticeModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * 모달 닫기
     */
    function closeModal() {
        const modal = document.getElementById('noticeModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        
        // 에디터 초기화
        if (quill) {
            QuillEditor.clearContent(quill);
        }
        
        // 제목 초기화
        const titleInput = document.getElementById('noticeTitle');
        if (titleInput) {
            titleInput.value = '';
        }
        
        // 파일 input 초기화
        const fileInput = document.getElementById('noticeFiles');
        if (fileInput) {
            fileInput.value = '';
        }
        
        // 파일 목록 초기화
        const fileListDiv = document.getElementById('fileList');
        if (fileListDiv) {
            fileListDiv.innerHTML = '';
        }
        
        // 에러 메시지 숨김
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
            errorMsg.classList.add('hidden');
        }
    }
    
    /**
     * 공지사항 저장 (생성만)
     */
    async function saveNotice() {
        if (!checkToken()) return;
        
        // 폼 데이터 수집
        const title = document.getElementById('noticeTitle').value.trim();
        const content = QuillEditor.getContent(quill);
        const fileInput = document.getElementById('noticeFiles');
        
        // 검증
        if (!title || !content || content === '<p><br></p>') {
            showError('모든 필드를 입력해주세요.');
            return;
        }
        
        // FormData 생성
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('isPinned', 'false');
        
        // 파일 추가
        if (fileInput && fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append('files', fileInput.files[i]);
            }
        }
        
        try {
            const token = localStorage.getItem('accessToken');
            
            const response = await fetch('/api/notices', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (handleAuthError(response)) return;
            
            if (response.ok) {
                showToast('공지사항이 등록되었습니다.', 'success');
                closeModal();
                
                // 페이지 새로고침
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                const error = await response.json();
                showError(error.message || '저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('공지사항 저장 실패:', error);
            showError('저장에 실패했습니다.');
        }
    }
    
    /**
     * 고정 토글
     * @param {Event} event - 클릭 이벤트
     * @param {number} noticeId - 공지사항 ID
     * @param {boolean} isPinned - 현재 고정 상태
     */
    async function togglePin(event, noticeId, isPinned) {
        if (event) {
            event.stopPropagation();
        }
        
        if (!checkToken()) return;
        
        try {
            const response = await fetch(`/api/notices/${noticeId}/pin`, {
                method: 'PATCH',
                headers: getAuthHeaders()
            });
            
            if (handleAuthError(response)) return;
            
            if (response.ok) {
                const message = isPinned ? '고정이 해제되었습니다.' : '최상단에 고정되었습니다.';
                showToast(message, 'success');
                
                // 페이지 새로고침
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                showToast('고정 상태 변경에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('고정 토글 실패:', error);
            showToast('고정 상태 변경에 실패했습니다.', 'error');
        }
    }
    
    /**
     * 삭제 확인
     * @param {Event} event - 클릭 이벤트
     * @param {number} noticeId - 공지사항 ID
     */
    function confirmDelete(event, noticeId) {
        if (event) {
            event.stopPropagation();
        }
        
        if (!checkToken()) return;
        
        const button = event.currentTarget;
        currentNoticeId = button.dataset.id;
        
        // 삭제 모달에 제목 표시
        const titleElement = document.getElementById('deleteNoticeTitle');
        if (titleElement) {
            titleElement.textContent = button.dataset.title;
        }
        
        // 모달 열기
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    /**
     * 삭제 모달 닫기
     */
    function closeDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
        currentNoticeId = null;
    }
    
    /**
     * 공지사항 삭제
     */
    async function deleteNotice() {
        if (!checkToken()) return;
        if (!currentNoticeId) return;
        
        try {
            const response = await fetch(`/api/notices/${currentNoticeId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (handleAuthError(response)) return;
            
            if (response.ok) {
                showToast('공지사항이 삭제되었습니다.', 'success');
                closeDeleteModal();
                
                // 페이지 새로고침
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                const error = await response.json().catch(() => ({ message: '삭제에 실패했습니다.' }));
                showToast(error.message || '삭제에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('공지사항 삭제 실패:', error);
            showToast('삭제에 실패했습니다.', 'error');
        }
    }
    
    /**
     * 에러 메시지 표시
     * @param {string} message - 에러 메시지
     */
    function showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }
    
    // 공개 API 반환
    return {
        init,
        openWriteModal,
        saveNotice,
        togglePin,
        confirmDelete,
        deleteNotice,
        closeModal,
        closeDeleteModal
    };
})();

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', NoticeList.init);

// 전역 네임스페이스로 노출 (HTML에서 호출 가능하도록)
window.NoticeList = NoticeList;
