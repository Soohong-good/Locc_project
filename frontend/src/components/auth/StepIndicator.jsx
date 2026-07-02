// 회원가입(일반/소셜) 공용 단계 표시기
const StepIndicator = ({ current, steps }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {steps.map((label, i) => {
      const stepNum = i + 1
      const active  = stepNum === current
      const done    = stepNum < current
      return (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 ${active ? 'text-slate-900' : done ? 'text-slate-500' : 'text-slate-300'}`}>
            <span className={`w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-xs font-medium border ${
              active ? 'border-slate-900 bg-slate-900 text-white' : done ? 'border-slate-400 text-slate-500' : 'border-slate-200 text-slate-300'
            }`}>
              {done ? '✓' : stepNum}
            </span>
            <span className="text-xs font-medium hidden sm:inline whitespace-nowrap">{label}</span>
          </div>
          {stepNum < steps.length && <span className="w-6 h-px bg-slate-200 shrink-0" />}
        </div>
      )
    })}
  </div>
)

export default StepIndicator
