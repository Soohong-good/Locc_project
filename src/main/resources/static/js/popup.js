/**
 * 팝업 관리 스크립트
 */

const PopupManager = {
    closedPopups: new Set(), // 세션 동안 닫은 팝업 ID 저장

    /**
     * 팝업 노출 여부 체크 (로컬스토리지 + 세션 기반)
     */
    shouldShowPopup(popupId) {
        // 세션 동안 닫은 팝업은 표시하지 않음
        if (this.closedPopups.has(popupId)) {
            return false;
        }

        // 로컬스토리지 체크 (오늘 하루 보지 않기)
        const key = `popup_hidden_${popupId}`;
        const hiddenUntil = localStorage.getItem(key);

        if (!hiddenUntil) {
            return true;
        }

        const today = new Date().toISOString().split('T')[0];
        return hiddenUntil < today;
    },

    /**
     * 오늘 하루 보지 않기 설정
     */
    hidePopupToday(popupId) {
        const key = `popup_hidden_${popupId}`;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        localStorage.setItem(key, tomorrow.toISOString().split('T')[0]);
        this.closePopup(popupId);
    },

    /**
     * 팝업 닫기 (세션 동안 저장)
     */
    closePopup(popupId) {
        // 세션 동안 닫은 팝업으로 기록
        this.closedPopups.add(popupId);

        const popupElement = document.getElementById(`popup-${popupId}`);
        if (popupElement) {
            popupElement.remove();
        }
    },

    /**
     * 활성 팝업 로드 및 표시 (메인 페이지에서만)
     */
    loadAndShowPopups() {
        // 현재 페이지가 메인 페이지인지 확인
        const isMainPage = window.location.pathname === '/' ||
            window.location.pathname === '/index' ||
            window.location.pathname === '';

        if (!isMainPage) {
            console.log('메인 페이지가 아니므로 팝업을 표시하지 않습니다.');
            return;
        }

        fetch('/api/popups/active')
            .then(response => response.json())
            .then(popups => {
                console.log('활성 팝업:', popups.length);
                popups.forEach((popup, index) => {
                    if (this.shouldShowPopup(popup.id)) {
                        this.renderPopup(popup, index);
                    }
                });
            })
            .catch(error => {
                console.error('팝업 로드 실패:', error);
            });
    },

    /**
     * 팝업 렌더링
     */
    renderPopup(popup, index) {
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            this.renderMobilePopup(popup);
        } else {
            this.renderDesktopPopup(popup, index);
        }
    },

    /**
     * 데스크톱 팝업 렌더링
     */
    renderDesktopPopup(popup, index) {
        const offsetX = index * 30;
        const offsetY = index * 30;

        const popupHtml = `
            <div class="popup-modal" id="popup-${popup.id}" 
                 style="left: ${popup.positionX + offsetX}px; 
                        top: ${popup.positionY + offsetY}px;
                        width: ${popup.popupWidth}px;
                        z-index: ${1000 + index};">
                <div class="popup-header">
                    <h5 class="popup-title">${this.escapeHtml(popup.title)}</h5>
                    <button type="button" class="popup-close" onclick="PopupManager.closePopup(${popup.id})" aria-label="닫기">
                        ×
                    </button>
                </div>
                <div class="popup-body" style="max-height: ${popup.popupHeight - 100}px; overflow-y: auto;">
                    ${popup.imageUrl ? `<img src="${popup.imageUrl}" alt="${this.escapeHtml(popup.title)}" class="popup-image">` : ''}
                    <div class="popup-content">${popup.content}</div>
                    ${popup.linkUrl ? `<a href="${popup.linkUrl}" class="popup-link" target="_blank">자세히 보기 →</a>` : ''}
                </div>
                <div class="popup-footer">
                    <label class="popup-checkbox-label">
                        <input type="checkbox" onchange="if(this.checked) PopupManager.hidePopupToday(${popup.id})">
                        오늘 하루 보지 않기
                    </label>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHtml);
    },

    /**
     * 모바일 팝업 렌더링
     */
    renderMobilePopup(popup) {
        const popupHtml = `
            <div class="popup-modal popup-modal-mobile" id="popup-${popup.id}">
                <div class="popup-header">
                    <h5 class="popup-title">${this.escapeHtml(popup.title)}</h5>
                    <button type="button" class="popup-close" onclick="PopupManager.closePopup(${popup.id})" aria-label="닫기">
                        ×
                    </button>
                </div>
                <div class="popup-body">
                    ${popup.imageUrl ? `<img src="${popup.imageUrl}" alt="${this.escapeHtml(popup.title)}" class="popup-image">` : ''}
                    <div class="popup-content">${popup.content}</div>
                    ${popup.linkUrl ? `<a href="${popup.linkUrl}" class="popup-link" target="_blank">자세히 보기 →</a>` : ''}
                </div>
                <div class="popup-footer">
                    <label class="popup-checkbox-label">
                        <input type="checkbox" onchange="if(this.checked) PopupManager.hidePopupToday(${popup.id})">
                        오늘 하루 보지 않기
                    </label>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', popupHtml);
    },

    /**
     * HTML 이스케이프
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 페이지 로드 시 팝업 표시
document.addEventListener('DOMContentLoaded', function() {
    PopupManager.loadAndShowPopups();
});