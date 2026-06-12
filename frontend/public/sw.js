/**
 * 자폭(self-destroying) 서비스 워커
 *
 * 배경: 기존 PWA(vite-plugin-pwa) 제거 후, 과거에 사이트를 방문(또는 앱 설치)한
 * 사용자 브라우저에 옛 Service Worker가 남아 옛 자산(index.html·JS)을 캐시 서빙하는 문제 발생.
 * → 같은 경로(/sw.js)에 이 자폭 SW를 두면, 옛 SW가 업데이트를 확인할 때 이 버전으로 교체되어
 *    스스로 캐시를 비우고 등록을 해제한 뒤 열려 있는 탭을 새로고침한다.
 *    사용자는 사이트에 접속만 하면 자동으로 정리된다.
 */
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1) 모든 캐시 삭제
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
      // 2) 이 서비스 워커 등록 해제
      await self.registration.unregister()
      // 3) 제어 중인 모든 탭을 새로고침 → 최신 자산 로드
      const clients = await self.clients.matchAll({ type: 'window' })
      clients.forEach((client) => client.navigate(client.url))
    })()
  )
})
