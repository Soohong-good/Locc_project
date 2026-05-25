import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { recordVisit } from '@/api/visitor'
import useAuthStore from '@/stores/authStore'
import AuthInitializer from '@/components/common/AuthInitializer'
import ScrollToTop from '@/components/common/ScrollToTop'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import PrivateRoute from '@/components/common/PrivateRoute'
import GuestRoute from '@/components/common/GuestRoute'
import OAuth2Callback from '@/components/common/OAuth2Callback'
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/layout/AdminLayout'

// ── 페이지 컴포넌트 — 라우트별 코드 스플리팅 ──────────────────────────
const LoginPage              = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage           = lazy(() => import('@/pages/auth/RegisterPage'))
const RegisterCompletePage   = lazy(() => import('@/pages/auth/RegisterCompletePage'))
const ForgotPasswordPage     = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage      = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const SocialRegisterPage     = lazy(() => import('@/pages/auth/SocialRegisterPage'))
const SocialPendingPage      = lazy(() => import('@/pages/auth/SocialPendingPage'))

const MainPage               = lazy(() => import('@/pages/MainPage'))
const Template               = lazy(() => import('@/pages/Template'))
const SalvationPage          = lazy(() => import('@/pages/SalvationPage'))
const NotFoundPage           = lazy(() => import('@/pages/NotFoundPage'))
const MyPage                 = lazy(() => import('@/pages/MyPage'))

const NoticeListPage         = lazy(() => import('@/pages/notices/NoticeListPage'))
const NoticeWritePage        = lazy(() => import('@/pages/notices/NoticeWritePage'))
const NoticeDetailPage       = lazy(() => import('@/pages/notices/NoticeDetailPage'))

const AboutPage              = lazy(() => import('@/pages/church/AboutPage'))
const ConfessionPage         = lazy(() => import('@/pages/church/ConfessionPage'))
const FirstVisitPage         = lazy(() => import('@/pages/church/FirstVisit'))
const StaffPage              = lazy(() => import('@/pages/church/StaffPage'))
const MissionPage            = lazy(() => import('@/pages/church/MissionPage'))
const ContactPage            = lazy(() => import('@/pages/church/ContactPage'))

const NewYearServicePage     = lazy(() => import('@/pages/worship/NewYearServicePage'))
const SundayMorningPage      = lazy(() => import('@/pages/worship/SundayMorningPage'))
const SundayAfternoonPage    = lazy(() => import('@/pages/worship/SundayAfternoonPage'))
const WeekdayPage            = lazy(() => import('@/pages/worship/WeekdayPage'))
const TrainingMessagePage    = lazy(() => import('@/pages/worship/TrainingMessagePage'))
const WorshipSermonDetailPage = lazy(() => import('@/pages/worship/SermonDetailPage'))
const TrainingIntroPage      = lazy(() => import('@/pages/training/TrainingIntroPage'))

const TrainingListPage       = lazy(() => import('@/pages/training/TrainingListPage'))
const TrainingDetailPage     = lazy(() => import('@/pages/training/TrainingDetailPage'))
const TrainingApplyPage      = lazy(() => import('@/pages/training/TrainingApplyPage'))
const MyApplicationsPage     = lazy(() => import('@/pages/training/MyApplicationsPage'))
const TrainingApplicationsPage = lazy(() => import('@/pages/training/TrainingApplicationsPage'))

const BulletinListPage       = lazy(() => import('@/pages/bulletins/BulletinListPage'))
const BulletinDetailPage     = lazy(() => import('@/pages/bulletins/BulletinDetailPage'))

const DepartmentPage         = lazy(() => import('@/pages/departments/DepartmentPage'))
const GalleryDetailPage      = lazy(() => import('@/pages/departments/GalleryDetailPage'))

const ApplicationListPage    = lazy(() => import('@/pages/applications/ApplicationListPage'))
const ApplicationFormPage    = lazy(() => import('@/pages/applications/ApplicationFormPage'))
const ApplicationDetailPage  = lazy(() => import('@/pages/applications/ApplicationDetailPage'))

const AdminDashboardPage         = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminNoticePage            = lazy(() => import('@/pages/admin/AdminNoticePage'))
const AdminNoticeFormPage        = lazy(() => import('@/pages/admin/AdminNoticeFormPage'))
const AdminSermonPage            = lazy(() => import('@/pages/admin/AdminSermonPage'))
const AdminSermonFormPage        = lazy(() => import('@/pages/admin/AdminSermonFormPage'))
const AdminUserPage              = lazy(() => import('@/pages/admin/AdminUserPage'))
const AdminPopupPage             = lazy(() => import('@/pages/admin/AdminPopupPage'))
const AdminPopupFormPage         = lazy(() => import('@/pages/admin/AdminPopupFormPage'))
const AdminYouTubePage           = lazy(() => import('@/pages/admin/AdminYouTubePage'))
const AdminHelpRequestPage       = lazy(() => import('@/pages/admin/AdminHelpRequestPage'))
const AdminBulletinPage          = lazy(() => import('@/pages/admin/AdminBulletinPage'))
const AdminGalleryPage           = lazy(() => import('@/pages/admin/AdminGalleryPage'))
const AdminApplicationPage       = lazy(() => import('@/pages/admin/AdminApplicationPage'))
const AdminApplicationDetailPage = lazy(() => import('@/pages/admin/AdminApplicationDetailPage'))
const AdminApplicationCategoryPage = lazy(() => import('@/pages/admin/AdminApplicationCategoryPage'))

const AppRoutes = () => {
  const { isInitialized } = useAuthStore()

  if (!isInitialized) return <LoadingSpinner fullScreen />

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        {/* OAuth2 콜백 — 레이아웃 없음 (토큰 처리 후 즉시 리다이렉트) */}
        <Route path="/oauth2/callback" element={<OAuth2Callback />} />

        {/* 메인 홈 — 레이아웃 없음 (자체 헤더/푸터 내장) */}
        <Route index element={<MainPage />} />

        {/* 구 메인 (비활성 — 삭제 전 보관) */}
        {/* <Route path="/main-legacy" element={<Layout><MainPage /></Layout>} /> */}

        {/* 구 메인 직접 접근용 (보관) */}
        <Route path="/template" element={<Template />} />

        {/* 공통 레이아웃 (Header + Footer) */}
        <Route element={<Layout />}>
          <Route path="/salvation" element={<SalvationPage />} />

          {/* 교회 페이지 */}
          <Route path="/church/about"       element={<AboutPage />} />
          <Route path="/church/confession"  element={<ConfessionPage />} />
          <Route path="/church/staff"       element={<StaffPage />} />
          <Route path="/church/first-visit" element={<FirstVisitPage />} />
          <Route path="/church/mission"     element={<MissionPage />} />
          <Route path="/church/contact"     element={<ContactPage />} />

          {/* 예배 페이지 */}
          <Route path="/worship/newyear"                 element={<NewYearServicePage />} />
          <Route path="/worship/sermon/sunday-morning"   element={<SundayMorningPage />} />
          <Route path="/worship/sermon/sunday-afternoon" element={<SundayAfternoonPage />} />
          <Route path="/worship/sermon/weekday"          element={<WeekdayPage />} />
          <Route path="/worship/sermon/training-message" element={<TrainingMessagePage />} />
          <Route path="/worship/sermon/:id"              element={<WorshipSermonDetailPage />} />
          <Route path="/worship/training-intro"          element={<TrainingIntroPage />} />

          {/* 훈련신청 — 로그인 필수 */}
          <Route path="/training"                    element={<PrivateRoute><TrainingListPage /></PrivateRoute>} />
          <Route path="/training/my"                 element={<PrivateRoute><MyApplicationsPage /></PrivateRoute>} />
          <Route path="/training/:id"                element={<PrivateRoute><TrainingDetailPage /></PrivateRoute>} />
          <Route path="/training/:id/apply"          element={<PrivateRoute><TrainingApplyPage /></PrivateRoute>} />
          <Route path="/training/:id/applications"   element={<PrivateRoute adminOnly><TrainingApplicationsPage /></PrivateRoute>} />

          {/* 인증 페이지 — 로그인 상태에서는 홈으로 리다이렉트 */}
          <Route path="/login"             element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register"          element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/register/complete" element={<GuestRoute><RegisterCompletePage /></GuestRoute>} />
          <Route path="/forgot-password"   element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/reset-password"    element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
          <Route path="/social/register"   element={<GuestRoute><SocialRegisterPage /></GuestRoute>} />
          <Route path="/social/pending"    element={<GuestRoute><SocialPendingPage /></GuestRoute>} />

          {/* 주보 — 로그인 필수 */}
          <Route path="/bulletin"     element={<PrivateRoute><BulletinListPage /></PrivateRoute>} />
          <Route path="/bulletin/:id" element={<PrivateRoute><BulletinDetailPage /></PrivateRoute>} />

          {/* 부서 — 공개 */}
          <Route path="/department/:code"                  element={<DepartmentPage />} />
          <Route path="/department/:code/gallery/:imageId" element={<GalleryDetailPage />} />

          {/* 공지사항 */}
          <Route path="/notices"         element={<NoticeListPage />} />
          <Route path="/notices/new"     element={<PrivateRoute><NoticeWritePage /></PrivateRoute>} />
          <Route path="/notices/:id"     element={<NoticeDetailPage />} />

          {/* 시설·차량 신청 — 로그인 필수 */}
          <Route path="/applications"      element={<PrivateRoute><ApplicationListPage /></PrivateRoute>} />
          <Route path="/applications/new"  element={<PrivateRoute><ApplicationFormPage /></PrivateRoute>} />
          <Route path="/applications/:id"  element={<PrivateRoute><ApplicationDetailPage /></PrivateRoute>} />

          <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
        </Route>

        {/* 관리자 전용 (AdminLayout) */}
        <Route
          path="/admin"
          element={<PrivateRoute adminOnly><AdminLayout /></PrivateRoute>}
        >
          <Route index                   element={<AdminDashboardPage />} />
          <Route path="notices"          element={<AdminNoticePage />} />
          <Route path="notices/new"      element={<AdminNoticeFormPage />} />
          <Route path="notices/:id/edit" element={<AdminNoticeFormPage />} />
          <Route path="sermons"          element={<AdminSermonPage />} />
          <Route path="sermons/new"      element={<AdminSermonFormPage />} />
          <Route path="sermons/:id/edit" element={<AdminSermonFormPage />} />
          <Route path="users"            element={<AdminUserPage />} />
          <Route path="popups"           element={<AdminPopupPage />} />
          <Route path="popups/new"       element={<AdminPopupFormPage />} />
          <Route path="popups/:id/edit"  element={<AdminPopupFormPage />} />
          <Route path="youtube"          element={<AdminYouTubePage />} />
          <Route path="help-requests"    element={<AdminHelpRequestPage />} />
          <Route path="bulletins"        element={<AdminBulletinPage />} />
          <Route path="gallery"          element={<AdminGalleryPage />} />
          <Route path="applications"             element={<AdminApplicationPage />} />
          <Route path="applications/:id"         element={<AdminApplicationDetailPage />} />
          <Route path="applications/categories"  element={<AdminApplicationCategoryPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

const App = () => {
  useEffect(() => {
    recordVisit().catch(() => {}) // 실패해도 UI에 영향 없도록 무시
  }, [])

  return (
    <ErrorBoundary>
      <Toaster position="top-center" richColors />
      <AuthInitializer />
      <ScrollToTop />
      <AppRoutes />
    </ErrorBoundary>
  )
}

export default App
