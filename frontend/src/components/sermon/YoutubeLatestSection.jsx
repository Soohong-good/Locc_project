import { useState, useEffect } from 'react'

/**
 * YouTube 최신 영상 섹션
 * - 썸네일 클릭 시 모달로 재생 (iframe 지연 로드 → 페이지 성능 개선)
 * - youtubeVideos 배열 있을 때 첫 번째 영상 표시
 * - latestSermon: youtubeVideos 없을 때 fallback
 */

// ── 비디오 ID 추출 ──────────────────────────────────────
const extractVideoId = (url) => {
  if (!url) return null
  try {
    const u = new URL(url)
    if (u.hostname === 'youtu.be' || u.hostname === 'www.youtu.be') return u.pathname.slice(1).split('?')[0]
    return u.searchParams.get('v') || null
  } catch {
    return null
  }
}
// ── 영상 재생 모달 ─────────────────────────────────────
const VideoModal = ({ videoId, title, onClose }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-5xl">
        {/* 닫기 버튼 */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-white/70 font-light truncate pr-4">{title}</p>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded"
            aria-label="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* iframe */}
        <div className="aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  )
}

// ── 재생 가능한 썸네일 카드 ─────────────────────────────
const PlayableThumbnail = ({ videoId, title, onClick }) => (
  <div
    className="group relative cursor-pointer overflow-hidden"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
    aria-label={`${title} 재생`}
  >
    {/* 썸네일 */}
    <div className="aspect-video bg-slate-800 overflow-hidden">
      <img
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          // maxresdefault 없을 시 hqdefault fallback
          e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        }}
      />
    </div>

    {/* 다크 오버레이 */}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

    {/* 재생 버튼 */}
    <div className="absolute inset-0 flex items-center justify-center">
      {/* 기본 상태: 반투명 작은 버튼 */}
      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center
        group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm">
        <svg className="w-7 h-7 text-white group-hover:text-slate-900 transition-colors duration-300 ml-1"
          fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>

    {/* 하단 정보 오버레이 */}
    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent
      translate-y-0 md:translate-y-2 md:group-hover:translate-y-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300">
      <p className="text-xs text-white/70 font-medium">클릭하여 재생</p>
    </div>
  </div>
)

// ── 메인 컴포넌트 ───────────────────────────────────────
const YoutubeLatestSection = ({ youtubeVideos = [], latestSermon, title }) => {
  const [modalVideoId, setModalVideoId] = useState(null)
  const [modalTitle,   setModalTitle]   = useState('')

  const hasYoutube = youtubeVideos && youtubeVideos.length > 0
  const video = hasYoutube ? youtubeVideos[0] : null
  const latestVideoId = !hasYoutube ? extractVideoId(latestSermon?.videoUrl) : null

  // 표시할 영상 없으면 섹션 숨김
  if (!hasYoutube && !latestVideoId) return null

  const openModal = (videoId, videoTitle) => {
    setModalVideoId(videoId)
    setModalTitle(videoTitle)
  }

  return (
    <>
      <section className="py-14 bg-white px-6 border-b border-slate-100">
        <div className="max-w-6xl mx-auto">
          {/* 섹션 헤더 */}
          <div className="mb-7">
            <p className="text-xs font-medium tracking-[0.25em] text-eyebrow uppercase mb-2">
              {hasYoutube ? 'Latest Video from YouTube' : 'Latest Sermon'}
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-slate-900">
              {hasYoutube ? title : latestSermon?.title}
            </h2>
          </div>

          {/* YouTube 영상 */}
          {hasYoutube && (
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              {/* 메인 썸네일 */}
              <div className="lg:col-span-2">
                <PlayableThumbnail
                  videoId={video.videoId}
                  title={video.title}
                  onClick={() => openModal(video.videoId, video.title)}
                />
              </div>
              {/* 영상 정보 */}
              <div className="flex flex-col justify-center py-2">
                <h3 className="text-xl font-light text-slate-900 leading-snug mb-3">{video.title}</h3>
                {video.publishedAt && (
                  <p className="text-sm text-slate-400 mb-6">{video.publishedAt.slice(0,10)}</p>
                )}
                <button
                  onClick={() => openModal(video.videoId, video.title)}
                  className="self-start inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium
                    hover:bg-slate-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  재생하기
                </button>
                {/* 나머지 영상 리스트 */}
                {youtubeVideos.length > 1 && (
                  <div className="mt-6 space-y-3 pt-6 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-400 tracking-wide uppercase mb-3">더보기</p>
                    {youtubeVideos.slice(1, 4).map((v) => (
                      <button
                        key={v.videoId}
                        onClick={() => openModal(v.videoId, v.title)}
                        className="group w-full flex items-center gap-3 text-left p-2 hover:bg-slate-50 transition-colors rounded"
                      >
                        <div className="relative w-16 h-9 flex-shrink-0 overflow-hidden bg-slate-200">
                          <img
                            src={`https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`}
                            alt={v.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 group-hover:text-slate-900 line-clamp-2 transition-colors">
                          {v.title}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* latestSermon fallback */}
          {!hasYoutube && latestVideoId && (
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2">
                <PlayableThumbnail
                  videoId={latestVideoId}
                  title={latestSermon.title}
                  onClick={() => openModal(latestVideoId, latestSermon.title)}
                />
              </div>
              <div className="flex flex-col justify-center py-2 space-y-3">
                <h3 className="text-xl font-light text-slate-900 leading-snug">{latestSermon.title}</h3>
                {latestSermon.scripture && (
                  <p className="text-sm text-slate-500">{latestSermon.scripture}</p>
                )}
                {latestSermon.preacher && (
                  <p className="text-sm text-slate-400">{latestSermon.preacher}</p>
                )}
                {latestSermon.sermonDate && (
                  <p className="text-xs text-slate-400">
                    {String(latestSermon.sermonDate).replace(/-/g, '. ')}
                  </p>
                )}
                <button
                  onClick={() => openModal(latestVideoId, latestSermon.title)}
                  className="self-start mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-medium
                    hover:bg-slate-700 transition-colors duration-200"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  재생하기
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 모달 */}
      {modalVideoId && (
        <VideoModal
          videoId={modalVideoId}
          title={modalTitle}
          onClose={() => { setModalVideoId(null); setModalTitle('') }}
        />
      )}
    </>
  )
}

export default YoutubeLatestSection
