/**
 * 주보 상세 페이지 스크립트
 */
const BulletinDetail = {
    /**
     * 초기화
     */
    init() {
        // 조회수 증가 (한번만 실행)
        this.increaseViewCount();
    },

    /**
     * 조회수 증가
     */
    async increaseViewCount() {
        if (!window.BULLETIN_ID) return;

        try {
            await fetch(`/api/bulletin/${window.BULLETIN_ID}/view`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
        } catch (error) {
            console.error('조회수 증가 실패:', error);
        }
    },

    /**
     * 삭제 확인 모달 열기
     */
    confirmDelete() {
        document.getElementById('deleteModal').classList.remove('hidden');
    },

    /**
     * 삭제 모달 닫기
     */
    closeDeleteModal() {
        document.getElementById('deleteModal').classList.add('hidden');
    },

    /**
     * 주보 삭제
     */
    async deleteBulletin() {
        if (!window.BULLETIN_ID) return;

        try {
            const response = await fetch(`/api/bulletin/${window.BULLETIN_ID}`, {
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

            // 목록으로 이동
            setTimeout(() => {
                window.location.href = '/church/bulletin';
            }, 1000);

        } catch (error) {
            console.error('주보 삭제 실패:', error);
            showToast(error.message || '주보 삭제에 실패했습니다.', 'error');
        }
    }
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    BulletinDetail.init();
});
