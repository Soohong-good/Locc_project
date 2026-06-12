import { Link } from 'react-router-dom'
import { YoutubeLogo, InstagramLogo } from '@phosphor-icons/react'

export default function TemplFooter() {
  return (
    <footer className="bg-[#FFFFFF] border-t border-[#E5E5E5]" style={{ position: 'relative', zIndex: 1 }}>
      <div className="max-w-[1600px] mx-auto border-x border-[#E5E5E5]">

        <div className="p-8 md:p-16 lg:p-24 border-b border-[#E5E5E5] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
          <div className="flex flex-col gap-8">
            <Link to="/">
              <img
                src="/logo.png"
                alt="그리스도사랑교회"
                className="h-12 w-auto object-contain hover:opacity-80 transition-opacity duration-300"
              />
            </Link>
            <div className="flex flex-wrap gap-8 text-sm font-bold tracking-[0.1em] uppercase text-[#171717]">
              <Link to="/church/contact" className="hover:text-[#737373] transition-colors">문의</Link>
              <span className="text-[#E5E5E5]">/</span>
              <a href="#" className="hover:text-[#737373] transition-colors">이메일 무단수집거부</a>
              <span className="text-[#E5E5E5]">/</span>
              <a href="#" className="hover:text-[#737373] transition-colors">사이트맵</a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.youtube.com/@그리스도사랑교회-k4z"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#171717] hover:border-[#171717] hover:text-white transition-all"
            >
              <YoutubeLogo size={20} weight="fill" />
            </a>
            <a
              href="#"
              className="w-12 h-12 border border-[#E5E5E5] flex items-center justify-center text-[#737373] hover:bg-[#171717] hover:border-[#171717] hover:text-white transition-all"
            >
              <InstagramLogo size={20} weight="fill" />
            </a>
          </div>
        </div>

        <div className="px-8 md:px-16 lg:px-24 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-neutral-50/50">
          <p className="text-xs text-[#737373] font-light tracking-wide">
            © 2026 Christ Love Church. All Rights Reserved.
          </p>
          <p className="text-[10px] text-[#A3A3A3] font-mono uppercase tracking-[0.2em]">Sola Scriptura</p>
        </div>

      </div>
    </footer>
  )
}
