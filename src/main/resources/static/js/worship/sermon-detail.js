/**
 * 설교 상세 페이지 스크립트
 * worship/sermon/detail.html
 */

// 전역 변수
let sermonId = null;
let quill = null; // Quill 에디터 인스턴스

/**
 * 설교 ID 설정
 * @param {number} id - 설교 ID
 */
function setSermonId(id) {
    sermonId = id;
    console.log('설교 ID 설정:', sermonId);
}

/**
 * Quill 에디터 초기화
 */
function initEditor() {
    if (quill) return;
    
    // Hidden textarea에서 초기 내용 가져오기
    const hiddenTextarea = document.getElementById('editContentHidden');
    const initialContent = hiddenTextarea ? hiddenTextarea.value : '';
    
    quill = QuillEditor.init('#editContent', {
        placeholder: '설교 내용을 입력하세요... (이미지를 드래그하여 추가할 수 있습니다)',
        uploadUrl: '/api/sermons/upload-image',
        height: 300
    });
    
    // 초기 내용 설정
    if (initialContent && quill) {
        QuillEditor.setContent(quill, initialContent);
    }
    
    console.log('설교 에디터 초기화 완료');
}

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('설교 상세 페이지 초기화');
    
    // Quill 모듈 등록
    QuillEditor.registerCustomFontSizes();
    QuillEditor.registerImageResize();
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        const editModal = document.getElementById('editModal');
        const deleteModal = document.getElementById('deleteModal');
        
        if (event.target === editModal) {
            closeEditModal();
        }
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeEditModal();
            closeDeleteModal();
        }
    });
});

/**
 * 수정 모달 열기
 */
function openEditModal() {
    if (!checkToken()) return;
    
    console.log('설교 수정 모달 열기');
    
    // Quill 에디터 초기화
    if (!quill) {
        initEditor();
    }
    
    // 에러 메시지 숨김
    const errorMsg = document.getElementById('editErrorMessage');
    if (errorMsg) {
        errorMsg.classList.add('hidden');
    }
    
    // 모달 열기
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * 수정 모달 닫기
 */
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // 에러 메시지 숨김
        const errorMsg = document.getElementById('editErrorMessage');
        if (errorMsg) {
            errorMsg.classList.add('hidden');
        }
    }
}

/**
 * 설교 수정 저장
 */
async function saveEdit() {
    if (!checkToken()) return;
    if (!sermonId) {
        showToast('설교 ID를 찾을 수 없습니다.', 'error');
        return;
    }
    
    // 폼 데이터 수집
    const title = document.getElementById('editTitle').value.trim();
    const bibleVerse = document.getElementById('editBibleVerse').value.trim();
    const preacher = document.getElementById('editPreacher').value.trim();
    const date = document.getElementById('editDate').value;
    const content = QuillEditor.getContent(quill);
    const category = document.getElementById('editCategory').value;
    const videoUrl = document.getElementById('editVideoUrl').value.trim();
    
    // 검증
    if (!title || !bibleVerse || !preacher || !date || !content || content === '<p><br></p>') {
        showEditError('모든 필드를 입력해주세요.');
        return;
    }
    
    // FormData 생성 (multipart/form-data)
    const formData = new FormData();
    formData.append('title', title);
    formData.append('scripture', bibleVerse);
    formData.append('preacher', preacher);
    formData.append('sermonDate', date);
    formData.append('content', content);
    formData.append('category', category);
    if (videoUrl) {
        formData.append('videoUrl', videoUrl);
    }
    
    // 파일 첨부 (있는 경우)
    const fileInput = document.getElementById('editFiles');
    if (fileInput && fileInput.files.length > 0) {
        Array.from(fileInput.files).forEach(file => {
            formData.append('files', file);
        });
        console.log('첨부파일:', fileInput.files.length, '개');
    }
    
    try {
        showLoading();
        
        const response = await fetch(`/api/sermons/${sermonId}`, {
            method: 'PUT',
            headers: getAuthHeaders(false), // Content-Type 자동 설정
            body: formData
        });
        
        hideLoading();
        
        if (handleAuthError(response)) return;
        
        if (response.ok) {
            showToast('설교가 수정되었습니다.', 'success');
            closeEditModal();
            
            // 페이지 새로고침
            setTimeout(() => {
                location.reload();
            }, 500);
        } else {
            const error = await response.json();
            showEditError(error.message || '수정에 실패했습니다.');
        }
    } catch (error) {
        hideLoading();
        console.error('설교 수정 실패:', error);
        showEditError('수정에 실패했습니다.');
    }
}

/**
 * 삭제 확인 모달 열기
 */
function confirmDelete() {
    if (!checkToken()) return;
    
    console.log('설교 삭제 확인 모달 열기');
    
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
}

/**
 * 설교 삭제
 */
async function deleteSermon() {
    if (!checkToken()) return;
    if (!sermonId) {
        showToast('설교 ID를 찾을 수 없습니다.', 'error');
        return;
    }
    
    try {
        showLoading();
        
        const response = await fetch(`/api/sermons/${sermonId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        hideLoading();
        
        if (handleAuthError(response)) return;
        
        if (response.ok) {
            showToast('설교가 삭제되었습니다.', 'success');
            closeDeleteModal();
            
            // 목록 페이지로 이동
            setTimeout(() => {
                window.location.href = '/worship';
            }, 500);
        } else {
            const error = await response.json().catch(() => ({ message: '삭제에 실패했습니다.' }));
            showToast(error.message || '삭제에 실패했습니다.', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('설교 삭제 실패:', error);
        showToast('삭제에 실패했습니다.', 'error');
    }
}

/**
 * 수정 폼 에러 메시지 표시
 * @param {string} message - 에러 메시지
 */
function showEditError(message) {
    const errorDiv = document.getElementById('editErrorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

/**
 * 상세 페이지에서 첨부파일 삭제 (즉시 삭제)
 * @param {number} fileId - 파일 ID
 */
async function deleteAttachmentFromDetail(fileId) {
    if (!checkToken()) return;
    
    if (!confirm('이 파일을 삭제하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (handleAuthError(response)) return;
        
        if (response.ok) {
            // DOM에서 파일 항목 제거
            const fileElement = document.getElementById(`attachment-${fileId}`);
            if (fileElement) {
                fileElement.remove();
            }
            
            showToast('파일이 삭제되었습니다.', 'success');
        } else {
            const error = await response.json().catch(() => ({ message: '파일 삭제에 실패했습니다.' }));
            showToast(error.message || '파일 삭제에 실패했습니다.', 'error');
        }
    } catch (error) {
        console.error('파일 삭제 실패:', error);
        showToast('파일 삭제에 실패했습니다.', 'error');
    }
}

// 전역 함수로 노출
window.setSermonId = setSermonId;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveEdit = saveEdit;
window.confirmDelete = confirmDelete;
window.closeDeleteModal = closeDeleteModal;
window.deleteSermon = deleteSermon;
window.deleteAttachmentFromDetail = deleteAttachmentFromDetail;
