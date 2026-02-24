/**
 * 주보 목록 페이지 스크립트
 */
const BulletinList = {
    // 상태
    thumbnailFile: null,
    deleteTargetId: null,

    /**
     * 초기화
     */
    init() {
        this.setupEventListeners();
    },

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 썸네일 미리보기
        const thumbnailInput = document.getElementById('bulletinThumbnail');
        if (thumbnailInput) {
            thumbnailInput.addEventListener('change', (e) => this.previewThumbnail(e));
        }

        // 삭제 버튼 이벤트 위임
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.bulletin-delete-btn');
            if (deleteBtn) {
                e.preventDefault();
                const id = parseInt(deleteBtn.dataset.id);
                const title = deleteBtn.dataset.title;
                this.confirmDelete(id, title);
            }
        });
    },

    /**
     * 썸네일 미리보기
     */
    previewThumbnail(event) {
        const file = event.target.files[0];
        if (!file) {
            this.thumbnailFile = null;
            return;
        }

        // PDF 파일 검증
        if (file.type !== 'application/pdf') {
            showToast('PDF 파일만 업로드 가능합니다.', 'error');
            event.target.value = '';
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            showToast('파일 크기는 10MB를 초과할 수 없습니다.', 'error');
            event.target.value = '';
            return;
        }

        this.thumbnailFile = file;
        log.debug('PDF 파일 선택됨:', file.name);
    },

    /**
     * 글쓰기 모달 열기
     */
    openWriteModal() {
        document.getElementById('bulletinModal').classList.remove('hidden');
        this.resetForm();
    },

    /**
     * 모달 닫기
     */
    closeModal() {
        document.getElementById('bulletinModal').classList.add('hidden');
        this.resetForm();
    },

    /**
     * 폼 초기화
     */
    resetForm() {
        document.getElementById('bulletinForm').reset();
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
        this.thumbnailFile = null;
    },

    /**
     * 에러 메시지 표시
     */
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    },

    /**
     * 주보 저장
     */
    async saveBulletin() {
        try {
            const title = document.getElementById('bulletinTitle').value.trim();
            const content = document.getElementById('bulletinContent').value.trim();

            // 유효성 검증
            if (!title) {
                this.showError('제목을 입력해주세요.');
                return;
            }

            // FormData 생성
            const formData = new FormData();
            formData.append('title', title);
            if (content) {
                formData.append('content', content);
            }

            // 썸네일 첨부 (PDF 또는 이미지)
            if (this.thumbnailFile) {
                formData.append('thumbnail', this.thumbnailFile);
            }

            // API 호출
            const response = await fetch('/api/bulletin', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: '주보 등록에 실패했습니다.' }));
                throw new Error(error.message);
            }

            showToast('주보가 등록되었습니다.', 'success');
            this.closeModal();

            // 페이지 새로고침
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('주보 저장 실패:', error);
            this.showError(error.message || '주보 등록에 실패했습니다.');
            showToast(error.message || '주보 등록에 실패했습니다.', 'error');
        }
    },

    /**
     * 삭제 확인 모달 열기
     */
    confirmDelete(id, title) {
        this.deleteTargetId = id;
        document.getElementById('deleteBulletinTitle').textContent = title;
        document.getElementById('deleteModal').classList.remove('hidden');
    },

    /**
     * 삭제 모달 닫기
     */
    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
        this.deleteTargetId = null;
    },

    /**
     * 주보 삭제
     */
    async deleteBulletin() {
        if (!this.deleteTargetId) return;

        try {
            const response = await fetch(`/api/bulletin/${this.deleteTargetId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: '주보 삭제에 실패했습니다.' }));
                throw new Error(error.message);
            }

            showToast('주보가 삭제되었습니다.', 'success');
            this.closeDeleteModal();

            // 페이지 새로고침
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error('주보 삭제 실패:', error);
            showToast(error.message || '주보 삭제에 실패했습니다.', 'error');
        }
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    BulletinList.init();
});
