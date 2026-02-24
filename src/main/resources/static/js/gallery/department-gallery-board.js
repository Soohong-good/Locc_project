/**
 * 부서 갤러리 - 공지 게시판 형태
 */
let deptBoardState = {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    isInitialized: false
};

function initDepartmentGallery() {
    if (deptBoardState.isInitialized) return;
    deptBoardState.isInitialized = true;

    console.log('갤러리 게시판 초기화');

    loadGalleryBoard(0);
    setupDeptModals();
    setupDeptUploadForm();
}

function resetDeptGallery() {
    deptBoardState.currentPage = 0;
    deptBoardState.totalPages = 0;
    deptBoardState.totalElements = 0;
    deptBoardState.isInitialized = false;
    document.getElementById('deptGalleryList').innerHTML = '';
    document.getElementById('deptGalleryPagination').innerHTML = '';
}

/**
 * 갤러리 게시판 로드
 */
async function loadGalleryBoard(page) {
    const listContainer = document.getElementById('deptGalleryList');
    const headerContainer = document.getElementById('deptGalleryHeader');
    const emptyContainer = document.getElementById('deptEmptyGallery');

    try {
        // 로딩 UI 표시
        listContainer.innerHTML = `
            <div class="flex items-center justify-center py-12 col-span-full">
                <div class="text-center">
                    <div class="inline-block w-12 h-12 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4"></div>
                    <p class="text-slate-600">갤러리를 불러오는 중...</p>
                </div>
            </div>
        `;

        const response = await fetch(`/api/departments/${departmentCode}/gallery?page=${page}`);

        if (!response.ok) {
            throw new Error('갤러리 로드 실패');
        }

        const data = await response.json();

        console.log('갤러리 데이터:', data);

        deptBoardState.currentPage = data.number;
        deptBoardState.totalPages = data.totalPages;
        deptBoardState.totalElements = data.totalElements;

        if (data.content.length === 0) {
            headerContainer.classList.add('hidden');
            emptyContainer.classList.remove('hidden');
            listContainer.innerHTML = '';
        } else {
            headerContainer.classList.remove('hidden');
            emptyContainer.classList.add('hidden');
            renderGalleryList(data.content, data);
            renderPagination(data);
        }

    } catch (error) {
        console.error('갤러리 로드 오류:', error);
        headerContainer.classList.add('hidden');
        listContainer.innerHTML = `
            <div class="text-center py-12">
                <p class="text-red-600">갤러리를 불러오는 중 오류가 발생했습니다.</p>
                <button onclick="loadGalleryBoard(0)" class="mt-4 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800">
                    다시 시도
                </button>
            </div>
        `;
    }
}

/**
 * 갤러리 목록 렌더링 (테이블 형식)
 */
function renderGalleryList(images, pageData) {
    const listContainer = document.getElementById('deptGalleryList');

    const html = images.map((image, index) => {
        const rowNumber = pageData.totalElements - (pageData.number * pageData.size) - index;

        // imageCount 확인 (없으면 1로 설정)
        const imageCount = image.imageCount || 1;
        const countBadge = imageCount > 1 ? ` <span class="text-xs text-slate-500">(${imageCount}장)</span>` : '';

        return `
        <div class="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-5 px-4 border-b border-slate-200 hover:bg-slate-50 transition-all duration-200 items-center group cursor-pointer"
             onclick="window.location.href='/departments/${departmentCode}/gallery/${image.id}'">
            
            <!-- No -->
            <div class="hidden md:flex col-span-1 items-center justify-center">
                <span class="text-slate-400 font-light text-sm">${rowNumber}</span>
            </div>
            
            <!-- 썸네일 -->
            <div class="col-span-1 flex items-center justify-center">
                <img src="/uploads/gallery/${image.thumbnailFilename || image.storedFilename}" 
                     alt="${escapeHtml(image.title)}"
                     class="w-16 h-16 object-cover rounded border border-slate-200"
                     onerror="this.src='/images/no-image.png'">
            </div>
            
            <!-- 제목 -->
            <div class="col-span-1 md:col-span-4">
                <div class="flex items-center gap-3">
                    <span class="text-base md:text-lg text-slate-700 font-light hover:underline">
                        ${escapeHtml(image.title)}${countBadge}
                    </span>
                </div>
                ${image.description ? `<p class="text-sm text-slate-500 mt-1 line-clamp-1">${escapeHtml(image.description)}</p>` : ''}
            </div>
            
            <!-- 작성자 -->
            <div class="col-span-1 md:col-span-2 flex items-center md:justify-center">
                <span class="text-sm md:text-base text-slate-500 md:text-slate-600">${escapeHtml(image.uploaderName || '익명')}</span>
            </div>
            
            <!-- 작성일 -->
            <div class="col-span-1 md:col-span-2 flex items-center md:justify-center">
                <span class="text-sm md:text-base text-slate-400 md:text-slate-500">${formatDate(image.createdAt)}</span>
            </div>
            
            <!-- 조회수 -->
            <div class="col-span-1 md:col-span-2 flex items-center md:justify-center">
                <span class="text-sm md:text-base text-slate-400 md:text-slate-500 font-light">${image.viewCount || 0}</span>
            </div>
        </div>
        `;
    }).join('');

    listContainer.innerHTML = html;
}

/**
 * 페이지네이션 렌더링 (공지 게시판 스타일)
 */
function renderPagination(data) {
    const paginationContainer = document.getElementById('deptGalleryPagination');

    if (data.totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    const currentPage = data.number;
    const totalPages = data.totalPages;

    let html = '<nav class="flex items-center gap-2">';

    // 이전 페이지
    if (currentPage > 0) {
        html += `
            <a onclick="loadGalleryBoard(${currentPage - 1}); return false;" 
               href="#"
               class="px-3 py-2 text-slate-600 hover:bg-slate-100 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </a>
        `;
    }

    // 페이지 번호
    for (let i = 0; i < totalPages; i++) {
        if (i === currentPage) {
            html += `<span class="px-4 py-2 bg-slate-900 text-white transition font-light">${i + 1}</span>`;
        } else {
            html += `<a onclick="loadGalleryBoard(${i}); return false;" href="#" class="px-4 py-2 text-slate-600 hover:bg-slate-100 transition font-light">${i + 1}</a>`;
        }
    }

    // 다음 페이지
    if (currentPage < totalPages - 1) {
        html += `
            <a onclick="loadGalleryBoard(${currentPage + 1}); return false;" 
               href="#"
               class="px-3 py-2 text-slate-600 hover:bg-slate-100 transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </a>
        `;
    }

    html += '</nav>';

    paginationContainer.innerHTML = html;
}

/**
 * 단일 이미지 라이트박스 열기
 */
async function openSingleImageLightbox(imageId) {
    try {
        const response = await fetch(`/api/departments/${departmentCode}/gallery/${imageId}`);
        const image = await response.json();

        const lightbox = document.getElementById('deptLightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        const lightboxDescription = document.getElementById('lightboxDescription');
        const lightboxDate = document.getElementById('lightboxDate');
        const lightboxCounter = document.getElementById('lightboxCounter');
        const lightboxTitle = document.getElementById('lightboxTitle');

        // 이미지 설정
        lightboxImage.src = `/uploads/gallery/${image.storedFilename}`;
        lightboxImage.alt = image.title;

        // 정보 설정
        lightboxTitle.textContent = image.title;
        lightboxDescription.textContent = image.description || '';
        lightboxDate.textContent = `${formatDate(image.createdAt)} | ${image.uploaderName}`;
        lightboxCounter.textContent = '1 / 1';

        // 이전/다음 버튼 숨김
        document.getElementById('lightboxPrevBtn').style.display = 'none';
        document.getElementById('lightboxNextBtn').style.display = 'none';

        // 라이트박스 표시
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('이미지 로드 오류:', error);
        alert('이미지를 불러오는 중 오류가 발생했습니다.');
    }
}

/**
 * 모달 설정
 */
function setupDeptModals() {
    const lightbox = document.getElementById('deptLightbox');
    const lightboxClose = document.getElementById('lightboxClose');

    // 라이트박스 닫기
    lightboxClose?.addEventListener('click', () => {
        lightbox.classList.add('hidden');
        document.body.style.overflow = 'auto';
    });

    // ESC 키로 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
            lightbox.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });

    // 배경 클릭 시 닫기
    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });
}

/**
 * 업로드 폼 설정
 */
function setupDeptUploadForm() {
    const uploadBtn = document.getElementById('deptUploadBtn');
    const uploadModal = document.getElementById('deptUploadModal');
    const cancelUploadBtn = document.getElementById('deptCancelUpload');
    const uploadForm = document.getElementById('deptUploadForm');

    // 업로드 버튼 클릭
    uploadBtn?.addEventListener('click', () => {
        uploadModal.classList.remove('hidden');
    });

    // 취소 버튼
    cancelUploadBtn?.addEventListener('click', () => {
        uploadModal.classList.add('hidden');
        uploadForm.reset();
        document.getElementById('imagePreview').innerHTML = '';
        document.getElementById('imagePreview').classList.add('hidden');
    });

    // 폼 제출
    uploadForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(uploadForm);

        try {
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`/api/departments/${departmentCode}/gallery`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('업로드 실패');
            }

            alert('이미지가 업로드되었습니다.');
            uploadModal.classList.add('hidden');
            uploadForm.reset();
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('imagePreview').classList.add('hidden');

            // 목록 새로고침
            loadGalleryBoard(0);

        } catch (error) {
            console.error('업로드 오류:', error);
            alert('이미지 업로드 중 오류가 발생했습니다.');
        }
    });
}

/**
 * 이미지 미리보기 (첫 이미지 + 뒤에 빈 카드 스택)
 */
function previewImages(input) {
    const preview = document.getElementById('imagePreview');

    if (!input.files || input.files.length === 0) {
        preview.classList.add('hidden');
        return;
    }

    preview.classList.remove('hidden');
    preview.innerHTML = `
        <p class="text-sm font-medium text-slate-700 mb-3">선택한 이미지</p>
        <div id="stackContainer" class="relative" style="width: 300px; height: 220px; margin: 0 auto;"></div>
    `;

    const container = document.getElementById('stackContainer');
    const fileCount = input.files.length;
    const maxVisible = Math.min(fileCount, 5);

    // 빈 카드들을 먼저 생성 (뒤에서부터)
    for (let i = maxVisible - 1; i >= 1; i--) {
        const offset = i * 6;

        const emptyCard = document.createElement('div');
        emptyCard.style.cssText = `
            position: absolute;
            top: ${offset}px;
            left: ${offset}px;
            width: 280px;
            height: 200px;
            background: white;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            z-index: ${i};
        `;

        container.appendChild(emptyCard);
    }

    // 첫 번째 이미지 카드 (맨 앞)
    const firstFile = input.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        const imageCard = document.createElement('div');
        imageCard.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 280px;
            height: 200px;
            background: white;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.15);
            z-index: ${maxVisible};
        `;

        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
        `;

        imageCard.appendChild(img);

        // 개수 배지
        if (fileCount > 1) {
            const badge = document.createElement('div');
            badge.style.cssText = `
                position: absolute;
                top: 12px;
                right: 12px;
                background: rgba(15, 23, 42, 0.9);
                color: white;
                padding: 6px 12px;
                border-radius: 9999px;
                font-size: 12px;
                font-weight: 600;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            `;
            badge.textContent = `${fileCount}장`;
            imageCard.appendChild(badge);
        }

        container.appendChild(imageCard);
    };
    reader.readAsDataURL(firstFile);
}

/**
 * 날짜 포맷팅
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * XSS 방지 HTML 이스케이프
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}