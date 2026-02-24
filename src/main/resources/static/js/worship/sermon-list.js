/**
 * 설교 목록 페이지 스크립트
 * worship/sermon/list.html
 */

// 네임스페이스로 함수 격리
const SermonList = (function() {
    // 비공개 변수
    let quill = null; // Quill 에디터 인스턴스
    let currentSermonId = null;
    let isAdminUser = false; // 관리자 여부 저장
    let staffList = []; // 교역자 목록 저장
    
    /**
     * 페이지 로드 시 초기화
     */
    function init() {
        console.log('설교 목록 페이지 초기화');
        
        // Quill 모듈 등록
        QuillEditor.registerCustomFontSizes();
        QuillEditor.registerImageResize();
        
        // 관리자 권한 체크 - 페이지 로드 시 한 번만 확인
        checkAdminStatus();
        
        // 교역자 목록 로드
        loadStaffList();
        
        // 설교자 select 이벤트 설정
        setupPreacherSelect();
        
        // 카테고리 버튼 이벤트 리스너 추가
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                filterByCategory(category, this);
            });
        });
        
        // 모달 외부 클릭 시 닫기
        window.addEventListener('click', function(event) {
            const sermonModal = document.getElementById('sermonModal');
            const deleteModal = document.getElementById('deleteModal');
            
            if (event.target === sermonModal) {
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
    }
    
    /**
     * Quill 에디터 초기화
     */
    function initEditor() {
        if (quill) return;
        
        quill = QuillEditor.init('#sermonContent', {
            placeholder: '설교 내용을 입력하세요... (이미지를 드래그하여 추가할 수 있습니다)',
            uploadUrl: '/api/sermons/upload-image',
            height: 300
        });
        
        console.log('설교 에디터 초기화 완료');
    }
    
    /**
     * 관리자 권한 체크
     */
    function checkAdminStatus() {
        // 숨겨진 관리자 마커 요소를 찾음
        const adminMarker = document.getElementById('admin-marker');
        isAdminUser = adminMarker !== null && adminMarker.dataset.admin === 'true';
        console.log('관리자 권한:', isAdminUser);
    }
    
    /**
     * 교역자 목록 로드 (설교자만: 담임목사, 목사, 전도사)
     */
    async function loadStaffList() {
        try {
            const response = await fetch('/api/staff/preachers');
            if (response.ok) {
                staffList = await response.json();
                console.log('설교자 목록 로드 완료:', staffList.length, '명');
            }
        } catch (error) {
            console.error('설교자 목록 로드 실패:', error);
        }
    }
    
    /**
     * 설교자 select 박스 채우기
     * 이름 + displayPosition 조합
     */
    function populatePreacherSelect() {
        const selectElement = document.getElementById('sermonPreacherSelect');
        if (!selectElement) return;
        
        // 기존 옵션 제거 (첫 번째 "교역자 선택"과 마지막 "직접입력" 제외)
        while (selectElement.options.length > 2) {
            selectElement.remove(1);
        }
        
        // 교역자 목록으로 옵션 추가 (이름 + 표시용 직분명)
        // "직접입력" 앞에 삽입
        const directInputOption = selectElement.lastElementChild;
        staffList.forEach(staff => {
            const option = document.createElement('option');
            const displayText = `${staff.name} ${staff.displayPosition}`;
            option.value = displayText;
            option.textContent = displayText;
            selectElement.insertBefore(option, directInputOption);
        });
        
        console.log('설교자 옵션 추가 완료:', staffList.length, '명');
    }
    
    /**
     * 설교자 select에서 선택 시 input에 반영
     */
    function setupPreacherSelect() {
        const selectElement = document.getElementById('sermonPreacherSelect');
        const inputElement = document.getElementById('sermonPreacher');
        
        if (!selectElement || !inputElement) return;
        
        selectElement.addEventListener('change', function() {
            if (this.value === '__DIRECT__') {
                // 직접입력 선택 시
                inputElement.value = '';
                inputElement.readOnly = false;
                inputElement.classList.remove('bg-slate-100');
                inputElement.classList.add('bg-slate-50');
                inputElement.placeholder = '설교자 이름 직접입력';
                inputElement.focus();
                // select 초기화
                this.value = '';
            } else if (this.value) {
                // 교역자 선택 시
                inputElement.value = this.value;
                inputElement.readOnly = true;
                inputElement.classList.remove('bg-slate-50');
                inputElement.classList.add('bg-slate-100');
                inputElement.placeholder = '설교자 이름';
                // select 초기화
                this.value = '';
            }
        });
    }
    
    /**
     * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
     */
    function getTodayDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    /**
     * 새 설교 작성 모달 열기
     */
    function openWriteModal() {
        console.log('=== openWriteModal 함수 호출됨 ===');
        
        if (!checkToken()) {
            console.log('토큰 체크 실패');
            return;
        }
        
        console.log('토큰 체크 통과');
        console.log('새 설교 모달 열기');
        
        // 모달 제목 변경
        const modalTitle = document.getElementById('modalTitle');
        console.log('modalTitle 요소:', modalTitle);
        if (modalTitle) {
            modalTitle.textContent = '새 설교 등록';
        }
        
        // Quill 에디터 초기화
        if (!quill) {
            initEditor();
        } else {
            QuillEditor.clearContent(quill);
        }
        
        // 폼 초기화 (Quill은 제외)
        document.getElementById('sermonTitle').value = '';
        document.getElementById('sermonBibleVerse').value = '';
        
        const preacherInput = document.getElementById('sermonPreacher');
        preacherInput.value = '';
        preacherInput.readOnly = true;
        preacherInput.classList.remove('bg-slate-50');
        preacherInput.classList.add('bg-slate-100');
        preacherInput.placeholder = '설교자 이름';
        
        document.getElementById('sermonDate').value = getTodayDate();
        
        // 카테고리 설정: 페이지의 hidden input에서 가져오기
        const categoryInput = document.getElementById('sermonCategory');
        if (categoryInput) {
            // 이미 value가 설정되어 있으면 그대로 사용 (템플릿에서 설정됨)
            console.log('현재 카테고리:', categoryInput.value);
        }
        
        document.getElementById('sermonVideoUrl').value = '';
        
        // 설교자 select 박스 채우기
        populatePreacherSelect();
        
        console.log('날짜 기본값 설정:', getTodayDate());
        
        // ID 초기화
        currentSermonId = null;
        
        // 에러 메시지 숨김
        const errorMsg = document.getElementById('errorMessage');
        if (errorMsg) {
            errorMsg.classList.add('hidden');
        }
        
        // 모달 열기
        const modal = document.getElementById('sermonModal');
        console.log('sermonModal 요소:', modal);
        console.log('모달 클래스 리스트:', modal?.classList);
        
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            console.log('모달 열림 - 클래스:', modal.classList.toString());
        } else {
            console.error('모달 요소를 찾을 수 없습니다!');
        }
    }
    
    /**
     * 수정 모달 열기
     * @param {Event} event - 클릭 이벤트
     * @param {number} sermonId - 설교 ID
     */
    async function openEditModal(event, sermonId) {
        if (event) {
            event.stopPropagation();
        }
        
        if (!checkToken()) return;
        
        console.log('설교 수정 모달 열기 - ID:', sermonId);
        
        // 모달 제목 변경
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.textContent = '설교 수정';
        }
        
        // Quill 에디터 초기화
        if (!quill) {
            initEditor();
        }
        
        // 설교자 select 박스 채우기
        populatePreacherSelect();
        
        try {
            // 서버에서 상세 정보 가져오기
            const response = await fetch(`/api/sermons/${sermonId}`);
            
            if (!response.ok) {
                throw new Error('설교 정보를 불러오는데 실패했습니다.');
            }
            
            const sermon = await response.json();
            
            // 데이터 채우기
            document.getElementById('sermonTitle').value = sermon.title || '';
            document.getElementById('sermonBibleVerse').value = sermon.scripture || '';
            
            const preacherInput = document.getElementById('sermonPreacher');
            const preacherValue = sermon.preacher || '';
            preacherInput.value = preacherValue;
            
            // 설교자가 교역자 목록에 있는지 확인
            const isStaffPreacher = staffList.some(staff => 
                `${staff.name} ${staff.displayPosition}` === preacherValue
            );
            
            if (isStaffPreacher) {
                // 교역자 목록에 있으면 readonly
                preacherInput.readOnly = true;
                preacherInput.classList.remove('bg-slate-50');
                preacherInput.classList.add('bg-slate-100');
            } else {
                // 교역자 목록에 없으면 직접입력 상태
                preacherInput.readOnly = false;
                preacherInput.classList.remove('bg-slate-100');
                preacherInput.classList.add('bg-slate-50');
            }
            
            document.getElementById('sermonDate').value = sermon.sermonDate || '';
            document.getElementById('sermonCategory').value = sermon.category || '';
            document.getElementById('sermonVideoUrl').value = sermon.videoUrl || '';
            
            // Quill 에디터에 내용 설정
            if (quill && sermon.content) {
                QuillEditor.setContent(quill, sermon.content);
            }
            
            currentSermonId = sermonId;
            
            // 에러 메시지 숨김
            const errorMsg = document.getElementById('errorMessage');
            if (errorMsg) {
                errorMsg.classList.add('hidden');
            }
            
            // 모달 열기
            const modal = document.getElementById('sermonModal');
            if (modal) {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.error('설교 정보 로드 실패:', error);
            showToast('설교 정보를 불러오는데 실패했습니다.', 'error');
        }
    }
    
    /**
     * 모달 닫기
     */
    function closeModal() {
        const modal = document.getElementById('sermonModal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Quill 에디터 초기화
            if (quill) {
                QuillEditor.clearContent(quill);
            }
            
            // 폼 리셋 (Quill 제외)
            document.getElementById('sermonTitle').value = '';
            document.getElementById('sermonBibleVerse').value = '';
            
            const preacherInput = document.getElementById('sermonPreacher');
            preacherInput.value = '';
            preacherInput.readOnly = true;
            preacherInput.classList.remove('bg-slate-50');
            preacherInput.classList.add('bg-slate-100');
            preacherInput.placeholder = '설교자 이름';
            
            document.getElementById('sermonDate').value = '';
            // 카테고리는 초기화하지 않음 (템플릿에서 설정된 값 유지)
            document.getElementById('sermonVideoUrl').value = '';
            
            currentSermonId = null;
            
            // 에러 메시지 숨김
            const errorMsg = document.getElementById('errorMessage');
            if (errorMsg) {
                errorMsg.classList.add('hidden');
            }
        }
    }
    
    /**
     * 설교 저장 (생성 or 수정)
     */
    async function saveSermon() {
        if (!checkToken()) return;
        
        // 폼 데이터 수집
        const title = document.getElementById('sermonTitle').value.trim();
        const bibleVerse = document.getElementById('sermonBibleVerse').value.trim();
        const preacher = document.getElementById('sermonPreacher').value.trim();
        const sermonDate = document.getElementById('sermonDate').value;
        const content = QuillEditor.getContent(quill);
        const category = document.getElementById('sermonCategory').value;
        const videoUrl = document.getElementById('sermonVideoUrl').value.trim();
        
        console.log('=== 설교 저장 시작 ===');
        console.log('제목:', title);
        console.log('성경구절:', bibleVerse);
        console.log('설교자:', preacher);
        console.log('날짜:', sermonDate);
        console.log('카테고리:', category);
        console.log('유튜브 URL:', videoUrl);
        console.log('내용 길이:', content.length);
        
        // 검증
        if (!title || !bibleVerse || !preacher || !sermonDate || !content || content === '<p><br></p>') {
            showError('모든 필수 필드를 입력해주세요.');
            return;
        }
        
        // FormData 생성 (multipart/form-data)
        const formData = new FormData();
        formData.append('title', title);
        formData.append('scripture', bibleVerse);
        formData.append('preacher', preacher);
        formData.append('sermonDate', sermonDate);
        formData.append('content', content);
        formData.append('category', category);
        
        // serviceNumber 추가 (있는 경우)
        const serviceNumberElement = document.getElementById('sermonServiceNumber');
        if (serviceNumberElement && serviceNumberElement.value) {
            formData.append('serviceNumber', serviceNumberElement.value);
            console.log('serviceNumber:', serviceNumberElement.value);
        }
        
        if (videoUrl) {
            formData.append('videoUrl', videoUrl);
        }
        
        // 파일 첨부 (있는 경우)
        const fileInput = document.getElementById('sermonFiles');
        if (fileInput && fileInput.files.length > 0) {
            Array.from(fileInput.files).forEach(file => {
                formData.append('files', file);
            });
            console.log('첨부파일:', fileInput.files.length, '개');
        }
        
        console.log('FormData 생성 완료');
        
        try {
            const headers = getAuthHeaders(false); // Content-Type 자동 설정
            
            console.log('요청 헤더:', headers);
            
            let response;
            if (currentSermonId) {
                // 수정
                console.log('설교 수정 요청 - ID:', currentSermonId);
                response = await fetch(`/api/sermons/${currentSermonId}`, {
                    method: 'PUT',
                    headers: headers,
                    body: formData
                });
            } else {
                // 생성
                console.log('설교 생성 요청');
                response = await fetch('/api/sermons', {
                    method: 'POST',
                    headers: headers,
                    body: formData
                });
            }
            
            console.log('응답 상태:', response.status);
            
            if (handleAuthError(response)) return;
            
            if (response.ok) {
                const result = await response.json();
                console.log('성공 응답:', result);
                showToast(currentSermonId ? '설교가 수정되었습니다.' : '설교가 등록되었습니다.', 'success');
                closeModal();
                
                // 페이지 새로고침
                setTimeout(() => {
                    location.reload();
                }, 500);
            } else {
                const errorText = await response.text();
                console.error('에러 응답:', errorText);
                try {
                    const error = JSON.parse(errorText);
                    showError(error.message || '저장에 실패했습니다.');
                } catch (e) {
                    showError(`저장에 실패했습니다. (${response.status})`);
                }
            }
        } catch (error) {
            console.error('설교 저장 실패:', error);
            showError('저장에 실패했습니다.');
        }
    }
    
    /**
     * 삭제 확인 모달 열기
     * @param {Event} event - 클릭 이벤트
     * @param {number} sermonId - 설교 ID
     */
    function confirmDelete(event, sermonId) {
        if (event) {
            event.stopPropagation();
        }
        
        if (!checkToken()) return;
        
        const button = event.currentTarget;
        currentSermonId = button.dataset.id;
        
        // 삭제 모달에 제목 표시
        const titleElement = document.getElementById('deleteSermonTitle');
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
        currentSermonId = null;
    }
    
    /**
     * 설교 삭제
     */
    async function deleteSermon() {
        if (!checkToken()) return;
        if (!currentSermonId) return;
        
        try {
            const response = await fetch(`/api/sermons/${currentSermonId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (handleAuthError(response)) return;
            
            if (response.ok) {
                showToast('설교가 삭제되었습니다.', 'success');
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
            console.error('설교 삭제 실패:', error);
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

    /**
     * 카테고리별 필터링
     * @param {string} category - 카테고리명
     * @param {HTMLElement} button - 클릭된 버튼
     */
    async function filterByCategory(category, button) {
        console.log('카테고리 필터링:', category);
        
        // 버튼 스타일 업데이트
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('bg-slate-900', 'text-white');
            btn.classList.add('bg-white', 'text-slate-700', 'hover:bg-slate-100');
        });
        button.classList.remove('bg-white', 'text-slate-700', 'hover:bg-slate-100');
        button.classList.add('bg-slate-900', 'text-white');
        
        try {
            // 설교 목록 로드
            await loadSermons(category);
            
            // 최신 설교 영상 로드
            await loadLatestSermon(category);
        } catch (error) {
            console.error('카테고리 필터링 실패:', error);
            showToast('데이터를 불러오는데 실패했습니다.', 'error');
        }
    }

    /**
     * 설교 목록 로드
     * @param {string} category - 카테고리명
     */
    async function loadSermons(category) {
        const apiUrl = category 
            ? `/api/sermons/category/${encodeURIComponent(category)}?size=12`
            : `/api/sermons?size=12`;
        
        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error('설교 목록을 불러오는데 실패했습니다.');
            }
            
            const data = await response.json();
            renderSermons(data.content);
        } catch (error) {
            console.error('설교 목록 로드 실패:', error);
            throw error;
        }
    }

    /**
     * 설교 카드 렌더링
     * @param {Array} sermons - 설교 목록
     */
    function renderSermons(sermons) {
        const container = document.getElementById('sermonListContainer');
        
        if (!container) {
            console.error('설교 목록 컨테이너를 찾을 수 없습니다.');
            return;
        }
        
        if (sermons.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <p class="text-slate-400 font-light text-lg">등록된 설교가 없습니다.</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = sermons.map(sermon => createSermonCard(sermon)).join('');
    }

    /**
     * 설교 카드 HTML 생성
     * @param {Object} sermon - 설교 데이터
     * @returns {string} HTML 문자열
     */
    function createSermonCard(sermon) {
        const formattedDate = formatDate(sermon.sermonDate);
        
        // 최근 3일 이내 여부 확인
        const isNew = sermon.createdAt ? isWithin3Days(sermon.createdAt) : false;
        
        return `
            <article class="group bg-white border border-slate-200 hover:border-slate-900 hover:shadow-lg transition-all duration-300 relative">
                ${isAdminUser ? `
                <div class="absolute top-4 right-4 flex gap-2 z-10">
                    <button onclick="SermonList.openEditModal(event, ${sermon.id})"
                            data-id="${sermon.id}"
                            data-title="${escapeHtml(sermon.title)}"
                            data-bibleverse="${escapeHtml(sermon.scripture || '')}"
                            data-preacher="${escapeHtml(sermon.preacher || '')}"
                            data-sermondate="${sermon.sermonDate || ''}"
                            data-category="${escapeHtml(sermon.category || '')}"
                            data-videourl="${escapeHtml(sermon.videoUrl || '')}"
                            class="px-3 py-1 text-xs bg-white border border-slate-300 hover:border-slate-900 transition">
                        수정
                    </button>
                    <button onclick="SermonList.confirmDelete(event, ${sermon.id})"
                            data-id="${sermon.id}"
                            data-title="${escapeHtml(sermon.title)}"
                            class="px-3 py-1 text-xs bg-white border border-red-300 text-red-600 hover:border-red-600 transition">
                        삭제
                    </button>
                </div>
                ` : ''}

                <div class="p-8 cursor-pointer" onclick="location.href='/worship/sermon/${sermon.id}'">
                    <!-- 날짜 + NEW 배지 -->
                    <div class="flex items-center justify-between mb-4">
                        <p class="text-sm text-slate-400 font-light tracking-wide">${formattedDate}</p>
                        ${isNew ? '<span class="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded">NEW</span>' : ''}
                    </div>
                    
                    <h3 class="text-2xl font-light text-slate-900 leading-tight mb-4 group-hover:text-slate-600 transition line-clamp-2">
                        ${escapeHtml(sermon.title)}
                    </h3>
                    <p class="text-base text-slate-600 mb-4 font-medium">${escapeHtml(sermon.scripture || '')}</p>
                    <p class="text-sm text-slate-500">${escapeHtml(sermon.preacher || '')}</p>
                </div>

                <!-- 하단 바 -->
                <div class="px-8 py-4 bg-slate-50 group-hover:bg-slate-900 transition-colors cursor-pointer"
                     onclick="location.href='/worship/sermon/${sermon.id}'">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-slate-600 group-hover:text-white transition font-medium">
                            설교 보기
                        </span>
                        <svg class="w-5 h-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * 최근 3일 이내인지 확인
     * @param {string} dateString - ISO 날짜 문자열
     * @returns {boolean} 3일 이내 여부
     */
    function isWithin3Days(dateString) {
        if (!dateString) return false;
        const createdDate = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
    }

    /**
     * 최신 설교 영상 로드
     * @param {string} category - 카테고리명
     */
    async function loadLatestSermon(category) {
        // 전체 카테고리인 경우 주일오전의 최신 설교 표시
        const targetCategory = category || '주일오전';
        const apiUrl = `/api/sermons/category/${encodeURIComponent(targetCategory)}/latest`;
        
        try {
            const response = await fetch(apiUrl);
            
            // 204 No Content - 최신 설교가 없음
            if (response.status === 204) {
                console.log('최신 설교가 없습니다.');
                hideLatestSermon();
                return;
            }
            
            if (!response.ok) {
                console.log('최신 설교 로드 중 에러:', response.status);
                hideLatestSermon();
                return;
            }
            
            const sermon = await response.json();
            
            // sermon이 null이거나 videoUrl이 없으면 섹션 숨기기
            if (!sermon || !sermon.videoUrl) {
                console.log('최신 설교 영상이 없습니다.');
                hideLatestSermon();
                return;
            }
            
            renderLatestSermon(sermon);
        } catch (error) {
            console.log('최신 설교 로드 중 에러:', error);
            // 에러가 나도 섹션만 숨기고 전체 동작은 계속
            hideLatestSermon();
        }
    }

    /**
     * 최신 설교 영상 렌더링
     * @param {Object} sermon - 설교 데이터
     */
    function renderLatestSermon(sermon) {
        const section = document.getElementById('latestSermonSection');
        
        if (!sermon || !sermon.videoUrl) {
            hideLatestSermon();
            return;
        }
        
        // YouTube ID 추출
        let videoId = '';
        if (sermon.videoUrl.includes('youtube.com')) {
            videoId = sermon.videoUrl.split('v=')[1];
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
        } else if (sermon.videoUrl.includes('youtu.be')) {
            videoId = sermon.videoUrl.split('/').pop();
        }
        
        if (!videoId) {
            hideLatestSermon();
            return;
        }
        
        // 섹션 표시
        if (section) {
            section.classList.remove('hidden');
            
            // 제목 업데이트
            const titleElement = document.getElementById('latestSermonTitle');
            if (titleElement) {
                titleElement.textContent = sermon.title;
            }
            
            // 영상 업데이트
            const videoElement = document.getElementById('latestSermonVideo');
            if (videoElement) {
                videoElement.innerHTML = `
                    <iframe src="https://www.youtube.com/embed/${videoId}"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            class="w-full h-full">
                    </iframe>
                `;
            }
            
            // 메타 정보 업데이트
            const metaElement = document.getElementById('latestSermonMeta');
            if (metaElement) {
                const formattedDate = formatDate(sermon.sermonDate);
                metaElement.innerHTML = `
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        <span>${escapeHtml(sermon.preacher || '')}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                        <span>${escapeHtml(sermon.scripture || '')}</span>
                    </div>
                `;
            }
        }
    }

    /**
     * 최신 설교 섹션 숨기기
     */
    function hideLatestSermon() {
        const section = document.getElementById('latestSermonSection');
        if (section) {
            section.classList.add('hidden');
        }
    }

    /**
     * 날짜 포맷팅
     * @param {string} dateString - ISO 날짜 문자열
     * @returns {string} 포맷된 날짜
     */
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    }

    /**
     * HTML 이스케이프
     * @param {string} text - 이스케이프할 텍스트
     * @returns {string} 이스케이프된 텍스트
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 공개 API 반환
    return {
        init,
        openWriteModal,
        openEditModal,
        saveSermon,
        confirmDelete,
        deleteSermon,
        closeModal,
        closeDeleteModal
    };
})();

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DOMContentLoaded 이벤트 발생 ===');
    SermonList.init();
    console.log('SermonList 초기화 완료');
    console.log('window.SermonList:', window.SermonList);
    console.log('SermonList.openWriteModal:', SermonList.openWriteModal);
});

// 전역 네임스페이스로 노출 (HTML에서 호출 가능하도록)
window.SermonList = SermonList;
console.log('=== sermon-list.js 로드됨 ===');
console.log('SermonList 객체:', SermonList);
