/**
 * 차량 사용 신청서 — 읽기 전용 / 인쇄용 레이아웃
 * AdminApplicationDetailPage, ApplicationDetailPage 공용
 */

const VEHICLE_CAUTIONS = [
  '차량 사용 시 부득이한 사정이 없는 한 신청서를 7일 이전에 작성하여 사무실에 제출하여 주시기 바랍니다.',
  '운전자는 교통법규 준수를 기본으로 하며 과속, 법규위반 등의 범칙금 발생 시 사안에 따라 본인이 부담하여야 할 경우도 있사오니 주의하여 운행하시기 바랍니다.',
  '목적지 도착 시에는 필히 사무실로 연락하여 주시기 바랍니다.',
  '차량에 이상이 있을 시 담당자에게 미리 연락한 후 조치하시기 바랍니다.',
  '차량 사용 후 반드시 청소 후 반납하시기 바랍니다.',
]

const th = 'border border-gray-400 px-4 py-3 bg-gray-50 text-sm font-medium text-gray-700 whitespace-nowrap'
const td = 'border border-gray-400 px-4 py-3 text-sm text-gray-800'

/** memo JSON 파싱 */
export const parseVehicleMemo = (memo) => {
  if (!memo) return null
  try {
    const obj = JSON.parse(memo)
    if (obj.__type === '차량신청') return obj
  } catch { /* JSON 파싱 실패 시 null 반환 */ }
  return null
}

const VehicleFormPrint = ({ application }) => {
  const v = parseVehicleMemo(application?.memo)

  const applicantName = application?.applicantName ?? ''
  const useDate       = application?.useDate ?? ''
  const startTime     = application?.useStartTime?.slice(0, 5) ?? ''
  const endTime       = application?.useEndTime?.slice(0, 5) ?? ''
  const purpose       = application?.purpose ?? ''
  const headCount     = application?.headCount ?? ''
  const createdAt     = application?.createdAt?.slice(0, 10) ?? ''

  const arrivalDate   = v?.arrivalDate   ?? ''
  const vehicleNumber = v?.vehicleNumber ?? ''
  const destination   = v?.destination   ?? ''
  const driver        = v?.driver        ?? ''
  const escort        = v?.escort        ?? ''
  const notes         = v?.notes         ?? ''

  return (
    <div id="vehicle-print-area" className="bg-white border border-gray-300 shadow-sm font-sans">

      {/* 제목 + 도장 */}
      <div className="border-b border-gray-300 px-8 py-7">
        <div className="flex items-start justify-between gap-4">
          <div className="w-36 flex-shrink-0" />
          <h2 className="text-3xl font-bold tracking-widest text-center flex-1">
            차량 사용 신청서
          </h2>
          <div className="w-36 flex-shrink-0 flex flex-col items-end gap-1.5">
            <span className="text-xs text-gray-500 whitespace-nowrap">※ 반드시 싸인을 할 것</span>
            <div className="border border-gray-400 w-24 h-12 flex items-center justify-center text-sm text-gray-500">
              차량부장
            </div>
          </div>
        </div>
      </div>

      {/* 본문 테이블 */}
      <table className="w-full border-collapse">
        <tbody>

          {/* 사용일시 */}
          <tr>
            <th className={`${th} align-top w-28`}>사용일시</th>
            <td className={td} colSpan={3}>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6">출발</span>
                  <span>{useDate}</span>
                  <span>{startTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6">도착</span>
                  <span>{arrivalDate || useDate}</span>
                  <span>{endTime}</span>
                </div>
              </div>
            </td>
          </tr>

          {/* 사용목적 / 차량번호 */}
          <tr>
            <th className={`${th} w-28`}>사용목적</th>
            <td className={`${td} w-[calc(50%-56px)]`}>{purpose}</td>
            <th className={`${th} w-28`}>차량번호</th>
            <td className={td}>{vehicleNumber}</td>
          </tr>

          {/* 목적지 / 운전자 */}
          <tr>
            <th className={`${th} w-28`}>목 적 지</th>
            <td className={td}>{destination}</td>
            <th className={`${th} w-28`}>운 전 자</th>
            <td className={td}>{driver}</td>
          </tr>

          {/* 인원 / 인솔자 */}
          <tr>
            <th className={`${th} w-28`}>인 &nbsp;&nbsp; 원</th>
            <td className={td}>
              <span>{headCount}명</span>
            </td>
            <th className={`${th} w-28`}>인 솔 자</th>
            <td className={td}>{escort}</td>
          </tr>

          {/* 기타 */}
          <tr>
            <th className={`${th} w-28`}>기 &nbsp;&nbsp;&nbsp;&nbsp; 타</th>
            <td className={td} colSpan={3}>{notes}</td>
          </tr>

          {/* 주의사항 */}
          <tr>
            <th className={`${th} align-top w-28`}>주의사항</th>
            <td className={`${td} text-xs text-gray-600 leading-relaxed`} colSpan={3}>
              <ol className="list-decimal list-inside space-y-1.5">
                {VEHICLE_CAUTIONS.map((t, i) => <li key={i}>{t}</li>)}
              </ol>
            </td>
          </tr>

        </tbody>
      </table>

      {/* 하단 서명란 */}
      <div className="border-t border-gray-300 py-8 text-center space-y-2 text-base text-gray-700">
        <p>신청일시 &nbsp;&nbsp; {createdAt}</p>
        <p>신청자 &nbsp;&nbsp;&nbsp;&nbsp; {applicantName}</p>
        <p className="text-xl font-bold tracking-widest mt-4">그리스도사랑교회</p>
      </div>
    </div>
  )
}

export default VehicleFormPrint
