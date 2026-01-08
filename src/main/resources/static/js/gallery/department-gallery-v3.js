/**
 * 부서 갤러리 - 인스타그램 스타일 (title 기준 + 무한 스크롤)
 */
let deptGalleryState = {
    galleryGroups: [],
    currentGroup: null,
    currentImageIndex: 0,
    isInitialized: false,
    currentPage: 0,
    hasMore: true,
    isLoading: false
};

function initDepartmentGallery() {
    if (deptGalleryState.isInitialized) return;
    deptGalleryState.isInitialized = true;
    
    console.log('initDepartmentGallery 시작');
    
    // 먼저 데이터 로드 → 완료 후 무한 스크롤 설정
    loadGalleryGroups().then(() => {
        setupInfiniteScroll();
        console.log('무한 스크롤 설정 완료');
    });
    
    setupDeptModals();
    setupDeptUploadForm();
}

function resetDeptGallery() {
    deptGalleryState.galleryGroups = [];
    deptGalleryState.isInitialized = false;
    deptGalleryState.currentPage = 0;
    deptGalleryState.hasMore = true;
    deptGalleryState.isLoading = false;
    document.getElementById('deptGalleryGrid').innerHTML = '';
}

/**
 * 무한 스크롤 설정
 */
function setupInfiniteScroll() {
    const gallerySection = document.getElementById('gallerySection');
    console.log('setupInfiniteScroll 호출됨');
    console.log('gallerySection:', gallerySection);
    
    if (!gallerySection) {
        console.error('gallerySection을 찾을 수 없습니다!');
        return;
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            console.log('IntersectionObserver 감지:', {
                isIntersecting: entry.isIntersecting,
                hasMore: deptGalleryState.hasMore,
                isLoading: deptGalleryState.isLoading
            });
            
            if (entry.isIntersecting && deptGalleryState.hasMore && !deptGalleryState.isLoading) {
                console.log('추가 로딩 시작!');
                loadMoreGalleryGroups();
            }
        });
    }, {
        rootMargin: '200px'
    });
    
    observer.observe(gallerySection);
    console.log('IntersectionObserver 설정 완료');
}

/**
 * 갤러리 그룹 목록 로드 (초기)
 */
async function loadGalleryGroups() {
    const grid = document.getElementById('deptGalleryGrid');
    
    try {
        // 로딩 UI 표시
        grid.innerHTML = `
            <div class="col-span-full flex items-center justify-center py-12">
                <div class="text-center">
                    <div class="inline-block w-12 h-12 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mb-4"></div>
                    <p class="text-slate-600">갤러리를 불러오는 중...</p>
                </div>
            </div>
        `;
        
        deptGalleryState.isLoading = true;
        const response = await fetch(`/api/departments/${departmentCode}/gallery/groups?page=0&size=12`);
        const data = await response.json();
        
        console.log('초기 로드 완료:', data);
        console.log('데이터 개수:', data.content.length);
        console.log('마지막 페이지?:', data.last);
        console.log('전체 페이지:', data.totalPages);
        console.log('전체 개수:', data.totalElements);
        
        deptGalleryState.galleryGroups = data.content;
        deptGalleryState.currentPage = 0;
        deptGalleryState.hasMore = !data.last;
        deptGalleryState.isLoading = false;  // 로딩 완료를 먼저 설정
        
        document.getElementById('deptEmptyGallery').classList.add('hidden');
        
        if (data.content.length === 0) {
            grid.innerHTML = '';
            document.getElementById('deptEmptyGallery').classList.remove('hidden');
        } else {
            renderGalleryGroups(data.content);
        }
        
        console.log('상태:', {
            currentPage: deptGalleryState.currentPage,
            hasMore: deptGalleryState.hasMore,
            isLoading: deptGalleryState.isLoading
        });
    } catch (error) {
        console.error('갤러리 그룹 로드 실패:', error);
        deptGalleryState.isLoading = false;
        grid.innerHTML = '';
    }
}

/**
 * 더 많은 갤러리 그룹 로드 (무한 스크롤)
 */
async function loadMoreGalleryGroups() {
    console.log('loadMoreGalleryGroups 호출됨', {
        isLoading: deptGalleryState.isLoading,
        hasMore: deptGalleryState.hasMore,
        currentPage: deptGalleryState.currentPage
    });
    
    if (deptGalleryState.isLoading || !deptGalleryState.hasMore) {
        console.log('로딩 중단:', deptGalleryState.isLoading ? '이미 로딩중' : '더 이상 없음');
        return;
    }
    
    try {
        deptGalleryState.isLoading = true;
        const nextPage = deptGalleryState.currentPage + 1;
        
        console.log(`페이지 ${nextPage} 로딩 시작...`);
        
        const response = await fetch(`/api/departments/${departmentCode}/gallery/groups?page=${nextPage}&size=12`);
        const data = await response.json();
        
        console.log('서버 응답:', data);
        
        deptGalleryState.isLoading = false;
        deptGalleryState.currentPage = nextPage;
        deptGalleryState.hasMore = !data.last;
        
        if (data.content.length > 0) {
            deptGalleryState.galleryGroups = [...deptGalleryState.galleryGroups, ...data.content];
            appendGalleryGroups(data.content);
            console.log(`${data.content.length}개 그룹 추가됨`);
        } else {
            console.log('추가 데이터 없음');
        }
    } catch (error) {
        console.error('추가 갤러리 그룹 로드 실패:', error);
        deptGalleryState.isLoading = false;
    }
}

/**
 * 갤러리 그룹 카드 렌더링 (인스타그램 스타일)
 */
function renderGalleryGroups(galleryGroups) {
    const grid = document.getElementById('deptGalleryGrid');
    grid.innerHTML = '';
    
    galleryGroups.forEach(group => {
        appendGalleryGroupCard(group);
    });
}

/**
 * 추가 갤러리 그룹 append (무한 스크롤용)
 */
function appendGalleryGroups(galleryGroups) {
    galleryGroups.forEach(group => {
        appendGalleryGroupCard(group);
    });
}

/**
 * 갤러리 그룹 카드 생성 및 추가
 */
function appendGalleryGroupCard(group) {
    const grid = document.getElementById('deptGalleryGrid');
    
    const card = document.createElement('div');
    card.className = 'relative aspect-square overflow-hidden bg-slate-100 cursor-pointer group rounded-lg';
    card.onclick = () => openGroupLightbox(group.title);
    
    const coverSrc = group.coverImage.thumbnailFilename 
        ? `/uploads/${group.coverImage.thumbnailFilename}` 
        : `/uploads/${group.coverImage.storedFilename}`;
    
    card.innerHTML = `
        <img src="${coverSrc}" 
             alt="${group.title}" 
             loading="lazy"
             class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">
        
        <!-- 이미지 카운트 배지 -->
        <div class="absolute top-3 right-3 bg-black/70 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span>${group.imageCount}</span>
        </div>
        
        <!-- 호버 오버레이 -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-end p-4">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <p class="font-semibold text-lg mb-1">${group.title}</p>
                <p class="text-sm text-slate-200">${group.imageCount}개의 사진</p>
            </div>
        </div>
    `;
    
    grid.appendChild(card);
}

/**
 * 그룹 라이트박스 열기 (title 기준)
 */
async function openGroupLightbox(title) {
    try {
        const response = await fetch(`/api/departments/${departmentCode}/gallery/titles/${encodeURIComponent(title)}/images`);
        const images = await response.json();
        
        deptGalleryState.currentGroup = {
            name: title,
            images: images
        };
        deptGalleryState.currentImageIndex = 0;
        
        showLightboxImage(0);
        document.getElementById('deptLightboxModal').classList.remove('hidden');
    } catch (error) {
        console.error('그룹 이미지 로드 실패:', error);
    }
}

/**
 * 라이트박스 이미지 표시
 */
function showLightboxImage(index) {
    const group = deptGalleryState.currentGroup;
    if (!group || !group.images || group.images.length === 0) return;
    
    deptGalleryState.currentImageIndex = index;
    const image = group.images[index];
    
    document.getElementById('lightboxImage').src = `/uploads/${image.storedFilename}`;
    document.getElementById('lightboxTitle').textContent = image.title;
    document.getElementById('lightboxDescription').textContent = image.description || '';
    document.getElementById('lightboxDate').textContent = new Date(image.createdAt).toLocaleDateString('ko-KR');
    document.getElementById('lightboxCounter').textContent = `${index + 1} / ${group.images.length}`;
    
    // 이전/다음 버튼 활성화 상태
    document.getElementById('lightboxPrevBtn').disabled = (index === 0);
    document.getElementById('lightboxNextBtn').disabled = (index === group.images.length - 1);
}

/**
 * 이전 이미지
 */
function showPreviousImage() {
    if (deptGalleryState.currentImageIndex > 0) {
        showLightboxImage(deptGalleryState.currentImageIndex - 1);
    }
}

/**
 * 다음 이미지
 */
function showNextImage() {
    const group = deptGalleryState.currentGroup;
    if (group && deptGalleryState.currentImageIndex < group.images.length - 1) {
        showLightboxImage(deptGalleryState.currentImageIndex + 1);
    }
}

/**
 * 모달 설정
 */
function setupDeptModals() {
    // 라이트박스 닫기
    document.getElementById('closeLightbox')?.addEventListener('click', () => {
        document.getElementById('deptLightboxModal').classList.add('hidden');
    });
    
    // 이전/다음 버튼
    document.getElementById('lightboxPrevBtn')?.addEventListener('click', showPreviousImage);
    document.getElementById('lightboxNextBtn')?.addEventListener('click', showNextImage);
    
    // 키보드 네비게이션
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('deptLightboxModal');
        if (!modal.classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') showPreviousImage();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'Escape') modal.classList.add('hidden');
        }
    });
    
    // 업로드 모달
    document.getElementById('galleryUploadBtn')?.addEventListener('click', () => {
        document.getElementById('deptUploadModal').classList.remove('hidden');
    });
    
    document.getElementById('deptCancelUpload')?.addEventListener('click', () => {
        document.getElementById('deptUploadModal').classList.add('hidden');
        document.getElementById('deptUploadForm').reset();
    });
}

/**
 * 이미지 미리보기
 */
function previewImages(input) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    if (input.files.length > 0) {
        preview.classList.remove('hidden');
        
        Array.from(input.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'relative aspect-square overflow-hidden rounded-lg border border-slate-200';
                div.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        });
    } else {
        preview.classList.add('hidden');
    }
}

/**
 * 업로드 폼 설정
 */
function setupDeptUploadForm() {
    const form = document.getElementById('deptUploadForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        const title = form.querySelector('input[name="title"]').value;
        formData.append('title', title);
        
        const desc = form.querySelector('textarea[name="description"]')?.value;
        if (desc) formData.append('description', desc);
        
        const fileInput = form.querySelector('input[type="file"]');
        if (!fileInput || !fileInput.files.length) {
            alert('이미지를 선택하세요');
            return;
        }
        
        Array.from(fileInput.files).forEach(file => formData.append('imageFiles', file));
        
        try {
            const response = await fetch(`/api/departments/${departmentCode}/gallery`, {
                method: 'POST', 
                body: formData
            });
            
            if (response.ok) {
                // 모달 닫기
                document.getElementById('deptUploadModal').classList.add('hidden');
                
                // 폼 리셋
                form.reset();
                document.getElementById('imagePreview').innerHTML = '';
                document.getElementById('imagePreview').classList.add('hidden');
                
                // 갤러리 새로고침 (상태 초기화 없이)
                loadGalleryGroups();
                
                alert('업로드 완료!');
            } else {
                alert('업로드 실패');
            }
        } catch (error) {
            console.error('업로드 에러:', error);
            alert('업로드 중 오류가 발생했습니다');
        }
    });
}
