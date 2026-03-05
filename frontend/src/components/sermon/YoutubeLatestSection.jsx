/**
 * YouTube 최신 영상 섹션
 * - youtubeVideos 배열이 있을 때 첫 번째 영상 표시
 * - latestSermon: youtubeVideos가 없을 때 fallback으로 표시
 */

const toEmbedUrl = (url) => {
  if (!url) return null
  try {
    const u = new URL(url)
    let videoId = u.searchParams.get('v')
    if (!videoId && (u.hostname === 'youtu.be' || u.hostname === 'www.youtu.be')) {
      videoId = u.pathname.slice(1)
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch {
    return null
  }
}

const YoutubeLatestSection = ({ youtubeVideos = [], latestSermon, title }) => {
  const hasYoutube = youtubeVideos && youtubeVideos.length > 0
  const video = hasYoutube ? youtubeVideos[0] : null

  // YouTube 영상도 없고, latestSermon의 videoUrl도 없으면 섹션 자체 숨김
  const latestEmbedUrl = !hasYoutube ? toEmbedUrl(latestSermon?.videoUrl) : null
  if (!hasYoutube && !latestEmbedUrl) return null

  return (
    <section className="py-16 bg-white px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-sm tracking-[0.2em] text-slate-400 uppercase mb-2">
            {hasYoutube ? 'Latest Video from YouTube' : 'Latest Sermon'}
          </h2>
          <h3 className="text-3xl font-light text-slate-900">
            {hasYoutube ? title : latestSermon?.title}
          </h3>
        </div>

        {/* YouTube 영상 */}
        {hasYoutube && (
          <>
            <div className="aspect-video bg-slate-900 overflow-hidden shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="mt-6">
              <h4 className="text-xl font-medium text-slate-900">{video.title}</h4>
              {video.publishedAt && (
                <p className="text-sm text-slate-600 mt-2">{video.publishedAt}</p>
              )}
            </div>
          </>
        )}

        {/* latestSermon fallback */}
        {!hasYoutube && latestEmbedUrl && (
          <>
            <div className="aspect-video bg-slate-900 overflow-hidden shadow-xl">
              <iframe
                src={latestEmbedUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-slate-600">
              {latestSermon.preacher && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{latestSermon.preacher}</span>
                </div>
              )}
              {latestSermon.sermonDate && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{String(latestSermon.sermonDate).replace(/-/g, '. ')}</span>
                </div>
              )}
              {latestSermon.scripture && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{latestSermon.scripture}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default YoutubeLatestSection
