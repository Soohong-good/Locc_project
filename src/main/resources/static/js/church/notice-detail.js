/**
 * 공지사항 상세 페이지 스크립트
 * church/notice/detail.html
 */

let noticeId = null;
let quill = null;
let currentNotice = null; // 현재 공지사항 데이터 저장

/**
 * 공지사항 ID 설정
 */
function setNoticeId(id) {
    noticeId = id;
    console.log('공지사항 ID 설정:', noticeId);
}

/**
 * Quill 에디터 초기화
 */
function initEditor() {
    if (quill) return;

    quill = QuillEditor.init('#editContent', {
        placeholder: '공지사항 내용을 입력하세요... (이미지를 드래그하여 추가할 수 있습니다)',
        uploadUrl: '/api/notices/upload-image',
        height: 300
    });

    console.log('공지사항 에디터 초기화 완료');
}

/**
 * 수정 모달 열기
 */
async function openEditModal() {
    if (!checkToken()) return;
    if (!noticeId) return;

    console.log('수정 모달 열기:', noticeId);

    try {
        showLoading();

        const response = await fetch(`/api/notices/${noticeId}`, {
            headers: getAuthHeaders()
        });

        hideLoading();

        if (handleAuthError(response)) return;

        if (response.ok) {
            const notice = await response.json();
            
            // 현재 공지사항 데이터 저장 (isPinned 상태 보존용)
            currentNotice = notice;

            // 제목 설정
            document.getElementById('editTitle').value = notice.title || '';

            // Quill 에디터 초기화 및 내용 설정
            if (!quill) {
                initEditor();
            }

            setTimeout(() => {
                if (quill && notice.content) {
                    QuillEditor.setContent(quill, notice.content);
                }
            }, 100);

            // 파일 input 초기화
            const fileInput = document.getElementById('editFiles');
            if (fileInput) {
                fileInput.value = '';
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
        } else {
            showToast('공지사항을 불러오는데 실패했습니다.', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('공지사항 데이터 로드 실패:', error);
        showToast('공지사항을 불러오는데 실패했습니다.', 'error');
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
    }

    if (quill) {
        QuillEditor.clearContent(quill);
    }

    const titleInput = document.getElementById('editTitle');
    if (titleInput) {
        titleInput.value = '';
    }

    const fileInput = document.getElementById('editFiles');
    if (fileInput) {
        fileInput.value = '';
    }

    const errorMsg = document.getElementById('editErrorMessage');
    if (errorMsg) {
        errorMsg.classList.add('hidden');
    }
}

/**
 * 수정 저장
 */
async function saveEdit() {
    if (!checkToken()) return;
    if (!noticeId) return;

    const title = document.getElementById('editTitle').value.trim();
    const content = QuillEditor.getContent(quill);
    const fileInput = document.getElementById('editFiles');

    if (!title || !content || content === '<p><br></p>') {
        showEditError('모든 필드를 입력해주세요.');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    
    // 현재 isPinned 상태 유지 (중요!)
    const isPinned = currentNotice ? currentNotice.isPinned : false;
    formData.append('isPinned', isPinned.toString());
    
    console.log('저장 시 isPinned 상태:', isPinned);

    if (fileInput && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            formData.append('files', fileInput.files[i]);
        }
    }

    try {
        showLoading();

        const token = localStorage.getItem('accessToken');
        const response = await fetch(`/api/notices/${noticeId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        hideLoading();

        if (handleAuthError(response)) return;

        if (response.ok) {
            showToast('공지사항이 수정되었습니다.', 'success');
            closeEditModal();
            setTimeout(() => location.reload(), 500);
        } else {
            const error = await response.json();
            showEditError(error.message || '수정에 실패했습니다.');
        }
    } catch (error) {
        hideLoading();
        console.error('공지사항 수정 실패:', error);
        showEditError('수정에 실패했습니다.');
    }
}

/**
 * 고정 토글
 */
async function toggleDetailPin() {
    if (!checkToken()) return;
    if (!noticeId) return;

    try {
        showLoading();

        const response = await fetch(`/api/notices/${noticeId}/pin`, {
            method: 'PATCH',
            headers: getAuthHeaders()
        });

        hideLoading();

        if (handleAuthError(response)) return;

        if (response.ok) {
            const button = document.querySelector('[onclick="toggleDetailPin()"]');
            const isPinned = button?.dataset.pinned === 'true';
            const message = isPinned ? '고정이 해제되었습니다.' : '최상단에 고정되었습니다.';
            showToast(message, 'success');
            setTimeout(() => location.reload(), 500);
        } else {
            showToast('고정 상태 변경에 실패했습니다.', 'error');
        }
    } catch (error) {
        hideLoading();
        console.error('고정 토글 실패:', error);
        showToast('고정 상태 변경에 실패했습니다.', 'error');
    }
}

/**
 * 삭제 확인 모달 열기
 */
function confirmDelete() {
    if (!checkToken()) return;
    if (!noticeId) return;

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
 * 공지사항 삭제
 */
async function deleteNotice() {
    if (!checkToken()) return;
    if (!noticeId) return;

    try {
        showLoading();

        const response = await fetch(`/api/notices/${noticeId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        hideLoading();

        if (handleAuthError(response)) return;

        if (response.ok) {
            showToast('공지사항이 삭제되었습니다.', 'success');
            setTimeout(() => location.href = '/church/notice', 500);
        } else {
            const error = await response.json().catch(() => ({ message: '삭제에 실패했습니다.' }));
            showToast(error.message || '삭제에 실패했습니다.', 'error');
            closeDeleteModal();
        }
    } catch (error) {
        hideLoading();
        console.error('공지사항 삭제 실패:', error);
        showToast('삭제에 실패했습니다.', 'error');
        closeDeleteModal();
    }
}

/**
 * 에러 메시지 표시
 */
function showEditError(message) {
    const errorDiv = document.getElementById('editErrorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

/**
 * 파일 선택 이벤트 처리
 */
function handleEditFileSelect(event) {
    const fileListDiv = document.getElementById('editFileList');
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
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('공지사항 상세 페이지 초기화');

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
            const editModal = document.getElementById('editModal');
            const deleteModal = document.getElementById('deleteModal');

            if (editModal && !editModal.classList.contains('hidden')) {
                closeEditModal();
            }
            if (deleteModal && !deleteModal.classList.contains('hidden')) {
                closeDeleteModal();
            }
        }
    });

    // 파일 선택 이벤트 리스너
    const fileInput = document.getElementById('editFiles');
    if (fileInput) {
        fileInput.addEventListener('change', handleEditFileSelect);
    }
});

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
window.setNoticeId = setNoticeId;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.saveEdit = saveEdit;
window.toggleDetailPin = toggleDetailPin;
window.confirmDelete = confirmDelete;
window.closeDeleteModal = closeDeleteModal;
window.deleteNotice = deleteNotice;
window.deleteAttachmentFromDetail = deleteAttachmentFromDetail;