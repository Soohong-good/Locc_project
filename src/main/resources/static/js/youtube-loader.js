/**
 * YouTube 최신 영상 로더
 * 채널 ID를 기반으로 최신 영상을 비동기로 불러와 표시합니다
 */

/**
 * 채널의 최신 영상 정보를 가져옵니다
 * @param {string} channelId - YouTube 채널 ID
 * @returns {Promise<{videoId: string, title: string, channelId: string}>}
 */
async function fetchLatestVideo(channelId) {
    if (!channelId) {
        console.warn('Channel ID is empty');
        return null;
    }

    try {
        const response = await fetch(`/api/youtube/latest-video/${channelId}`);
        
        if (!response.ok) {
            console.warn(`Failed to fetch video for channel ${channelId}: ${response.status}`);
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching latest video:', error);
        return null;
    }
}

/**
 * 최신 영상을 iframe으로 렌더링합니다
 * @param {string} containerId - iframe을 삽입할 컨테이너 ID
 * @param {string} channelId - YouTube 채널 ID
 */
async function loadLatestVideo(containerId, channelId) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Container not found: ${containerId}`);
        return;
    }

    // 로딩 상태 표시
    container.innerHTML = `
        <div class="bg-white border border-slate-200 p-12 text-center">
            <p class="text-slate-500">영상을 불러오는 중...</p>
        </div>
    `;

    const videoData = await fetchLatestVideo(channelId);

    if (!videoData) {
        // 영상이 없을 때
        container.innerHTML = `
            <div class="bg-white border border-slate-200 p-12 text-center">
                <p class="text-slate-500">등록된 영상이 없습니다.</p>
            </div>
        `;
        return;
    }

    // 영상 렌더링
    container.innerHTML = `
        <div class="bg-white border border-slate-200 overflow-hidden">
            <div class="aspect-video">
                <iframe
                    src="https://www.youtube.com/embed/${videoData.videoId}"
                    class="w-full h-full"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            </div>
            <div class="p-6">
                <h3 class="text-xl font-light text-slate-900">${escapeHtml(videoData.title)}</h3>
            </div>
        </div>
    `;
}

/**
 * HTML 특수문자 이스케이프
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 전역으로 노출
window.YouTubeLoader = {
    fetchLatestVideo,
    loadLatestVideo
};
