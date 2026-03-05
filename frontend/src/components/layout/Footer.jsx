const Footer = () => (
  <footer className="bg-gray-900 text-gray-300 py-16 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
        <div className="lg:col-span-2">
          <h3
            className="text-2xl text-white mb-3"
            style={{ fontFamily: "'Pretendard', 'Inter', sans-serif", fontWeight: 500, letterSpacing: '-0.03em' }}
          >
            그리스도 사랑교회
          </h3>
          <p
            className="text-sm text-gray-400 mb-6"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 300, letterSpacing: '0.25em' }}
          >
            CHRIST LOVE CHURCH
          </p>
          <p className="text-gray-400 leading-relaxed">
            하나님을 경배하고 이웃을 사랑하는 교회
            <br />
            여러분을 환영합니다.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4">바로가기</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/church/about" className="hover:text-white transition">교회소개</a></li>
            <li><a href="/#worship" className="hover:text-white transition">예배안내</a></li>
            <li><a href="/worship/sermon" className="hover:text-white transition">설교말씀</a></li>
            <li><a href="/ministry" className="hover:text-white transition">부서안내</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-4">연락처</h4>
          <ul className="space-y-2 text-sm">
            <li>대구광역시 동구 안심로55길 59</li>
            <li>Tel: 053-962-8948</li>
            <li>Email: magamedia8948@gmail.com</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8 text-center">
        <p className="text-sm text-gray-500">© 2026 그리스도 사랑교회. All rights reserved.</p>
      </div>
    </div>
  </footer>
)

export default Footer
