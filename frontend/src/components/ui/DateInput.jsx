import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { ko } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'

registerLocale('ko', ko)

/* ── 공통 스타일 (프로젝트 slate 계열 통일) ─────────────────── */
const PICKER_STYLE = `
  .react-datepicker-wrapper { width: 100%; }
  .react-datepicker-popper { z-index: 9999; }

  .react-datepicker {
    font-family: inherit;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    box-shadow: 0 4px 24px 0 rgba(15,23,42,0.10);
    overflow: hidden;
  }

  /* 헤더 */
  .react-datepicker__header {
    background-color: #0f172a;
    border-bottom: none;
    padding: 12px 0 8px;
    border-radius: 0;
  }
  .react-datepicker__current-month,
  .react-datepicker-time__header {
    color: #fff;
    font-size: 0.9rem;
    font-weight: 500;
    letter-spacing: 0.02em;
  }
  .react-datepicker__day-name {
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 500;
    width: 2.2rem;
    line-height: 2rem;
    margin: 0 1px;
  }

  /* 네비게이션 화살표 */
  .react-datepicker__navigation-icon::before {
    border-color: #94a3b8;
  }
  .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
    border-color: #fff;
  }

  /* 날짜 셀 */
  .react-datepicker__day {
    color: #1e293b;
    width: 2.2rem;
    line-height: 2.2rem;
    border-radius: 6px;
    font-size: 0.85rem;
    margin: 1px;
    transition: background 0.12s, color 0.12s;
  }
  .react-datepicker__day:hover {
    background-color: #f1f5f9;
    border-radius: 6px;
  }
  .react-datepicker__day--selected,
  .react-datepicker__day--keyboard-selected {
    background-color: #0f172a !important;
    color: #fff !important;
    border-radius: 6px;
    font-weight: 600;
  }
  .react-datepicker__day--today {
    font-weight: 700;
    color: #2563eb;
  }
  .react-datepicker__day--today.react-datepicker__day--selected {
    color: #fff !important;
  }
  .react-datepicker__day--outside-month {
    color: #cbd5e1;
  }
  .react-datepicker__day--disabled {
    color: #cbd5e1;
    cursor: not-allowed;
  }
  .react-datepicker__day--disabled:hover {
    background: transparent;
  }

  /* 시간 패널 */
  .react-datepicker__time-container {
    border-left: 1px solid #e2e8f0;
  }
  .react-datepicker__time-list-item {
    font-size: 0.85rem;
    color: #1e293b;
    transition: background 0.1s;
  }
  .react-datepicker__time-list-item:hover {
    background-color: #f1f5f9 !important;
  }
  .react-datepicker__time-list-item--selected {
    background-color: #0f172a !important;
    color: #fff !important;
    font-weight: 600;
  }

  /* 월/연도 드롭다운 */
  .react-datepicker__month-select,
  .react-datepicker__year-select {
    background-color: #1e293b;
    color: #fff;
    border: 1px solid #475569;
    border-radius: 4px;
    font-size: 0.8rem;
    padding: 2px 4px;
  }
`

/* ── 공통 input 렌더러 ─────────────────────────────────────── */
const CustomInput = ({ value, onClick, placeholder, className, readOnly }) => (
  <div className={`relative w-full ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    onClick={readOnly ? undefined : onClick}>
    <input
      readOnly
      value={value}
      placeholder={placeholder || '날짜 선택'}
      className={`w-full pr-10 ${className}`}
      style={{ cursor: readOnly ? 'not-allowed' : 'pointer' }}
    />
    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </span>
  </div>
)

/**
 * DateInput — 날짜 전용 (yyyy-MM-dd)
 *
 * @param {string}   value      - "yyyy-MM-dd" 형식 문자열
 * @param {function} onChange   - (dateStr: string) => void
 * @param {string}   className  - input에 적용할 Tailwind 클래스
 * @param {string}   placeholder
 * @param {boolean}  disabled
 * @param {Date}     minDate
 * @param {Date}     maxDate
 */
export const DateInput = ({
  value, onChange,
  className = 'px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition',
  placeholder,
  disabled = false,
  minDate,
  maxDate,
}) => {
  const selected = value ? new Date(value) : null

  const handleChange = (date) => {
    if (!date) { onChange(''); return }
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    onChange(`${y}-${m}-${d}`)
  }

  return (
    <>
      <style>{PICKER_STYLE}</style>
      <ReactDatePicker
        selected={selected}
        onChange={handleChange}
        locale="ko"
        dateFormat="yyyy년 MM월 dd일"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        customInput={
          <CustomInput
            placeholder={placeholder}
            className={className}
            readOnly={disabled}
          />
        }
      />
    </>
  )
}

/**
 * DateTimeInput — 날짜+시간 (yyyy-MM-dd'T'HH:mm)
 *
 * @param {string}   value     - "yyyy-MM-ddTHH:mm" 형식 문자열
 * @param {function} onChange  - (dateTimeStr: string) => void
 * @param {string}   className
 * @param {string}   placeholder
 * @param {boolean}  disabled
 */
export const DateTimeInput = ({
  value, onChange,
  className = 'px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none transition',
  placeholder,
  disabled = false,
}) => {
  const selected = value ? new Date(value) : null

  const handleChange = (date) => {
    if (!date) { onChange(''); return }
    const y   = date.getFullYear()
    const mo  = String(date.getMonth() + 1).padStart(2, '0')
    const d   = String(date.getDate()).padStart(2, '0')
    const h   = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    onChange(`${y}-${mo}-${d}T${h}:${min}`)
  }

  return (
    <>
      <style>{PICKER_STYLE}</style>
      <ReactDatePicker
        selected={selected}
        onChange={handleChange}
        locale="ko"
        dateFormat="yyyy년 MM월 dd일 HH:mm"
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={30}
        timeCaption="시간"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        disabled={disabled}
        customInput={
          <CustomInput
            placeholder={placeholder || '날짜/시간 선택'}
            className={className}
            readOnly={disabled}
          />
        }
      />
    </>
  )
}

export default DateInput
