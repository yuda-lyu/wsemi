import iseint from './iseint.mjs'


//pad, 數字左補0至指定位數字串
function pad(n, len = 2) {
    return String(n).padStart(len, '0')
}


/**
 * 產生以指定IANA時區錨定之時鐘物件，其現在時間與格式化皆隨指定時區，不隨系統(執行環境)時區
 *
 * now2str系列隨系統時區，排程環境之系統時區可能為UTC+0，使日誌、檔名與「當日」判定差8小時；本函數產生之時鐘以IANA時區字串(如Asia/Taipei)錨定現在時間，不受系統時區影響。時間欄位與UTC偏移取自執行環境內建之Intl.DateTimeFormat(不經系統本地時間解析，故系統時區有夏令時間者，其轉換間隙亦不影響結果)，不修改dayjs等全域物件
 *
 * 回傳物件之方法皆為閉包，不依賴this，可解構取用或當作函數傳遞(如const { iso8 } = clock)；同一函數提供兩組方法名並列(同一函數、同一行為)：iso8/stamp8/date8/day8供管線類消費端，getISO/getNow/getDay/getDate/formatTime/getTimestamp供排程殼類消費端，兩類使用端慣用名稱不同故皆保留
 *
 * 本函數不提供預設時區，timeZone必須給定且為非空原始字串並為執行環境Intl所接受之時區名稱(如IANA名稱，亦含該環境接受之UTC偏移寫法)，否則同步拋出Error(設定錯誤於建立時即現，不留到使用時)；是否接受某名稱取決於執行環境之ICU資料
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/genClockTZ.test.mjs Github}
 * @memberOf wsemi
 * @param {String} timeZone 輸入IANA時區字串，例如'Asia/Taipei'、'UTC'、'America/New_York'，必須給定且為非空原始字串(不收String包裝物件)
 * @returns {Object} 回傳時鐘物件，內含timeZone(輸入時區字串)與下列方法(每次呼叫皆取當下時間)：iso8()與getISO()回傳'YYYY-MM-DDTHH:mm:ssZ'(如'2026-08-18T12:00:00+08:00'，格式同now2str，UTC為'+00:00')；stamp8()與getNow()回傳'YYYYMMDDHHmmss'(如'20260818120000')；date8()回傳'YYYY-MM-DD'；day8()回傳'YYYYMMDD'；getDay(s)回傳s之前8碼(對字串純切片，不重新解析)，s須為以8位數字開頭之原始字串，未給或非預期輸入視為未給，改用stamp8()；getDate(offsetDay)回傳指定時區今日偏移offsetDay日之'YYYY-MM-DD'(-1為昨日，1為明日，日曆日加減不受夏令時間影響)，offsetDay預設0，非整數或使年份超出0000至9999之偏移視為未給，改用0；formatTime(s)回傳'YYYY/MM/DD HH:mm'(如'2026/08/08 21:44')，s為stamp8()格式(至少12位數字開頭之原始字串)，純切片組字，s非預期輸入(含數字型戳記如20260808214408、String包裝物件、不足12位數字)時回傳''，不拋錯(格式化類，同dspec〈輸入參數之檢測機制〉§5.3 C3)；getTimestamp()回傳'YYYY-MM-DD HH:mm:ss'(如'2026-08-08 21:44:08')
 * @example
 * need test in nodejs.
 *
 * let clock = genClockTZ('Asia/Taipei')
 *
 * console.log(clock.timeZone)
 * // => Asia/Taipei
 *
 * console.log(clock.iso8())
 * // => 2026-08-18T12:00:00+08:00
 *
 * console.log(clock.stamp8())
 * // => 20260818120000
 *
 * console.log(clock.date8(), clock.day8())
 * // => 2026-08-18 20260818
 *
 * console.log(clock.getDay('20260818120000'))
 * // => 20260818
 *
 * console.log(clock.getDate(-1), clock.getDate(1))
 * // => 2026-08-17 2026-08-19
 *
 * console.log(clock.formatTime('20260808214408'))
 * // => 2026/08/08 21:44
 *
 * console.log(clock.formatTime(20260808214408))
 * // => '' (數字型戳記非字串, 回傳空字串)
 *
 * console.log(clock.getTimestamp())
 * // => 2026-08-18 12:00:00
 *
 * //同一時刻不同時區
 * console.log(genClockTZ('UTC').iso8())
 * // => 2026-08-18T04:00:00+00:00
 *
 * try {
 *     genClockTZ('')
 * }
 * catch (err) {
 *     console.log(err.message)
 * }
 * // => genClockTZ 需要 IANA 時區字串（如 Asia/Taipei）
 *
 */
function genClockTZ(timeZone) {

    //check, 必須參數: 同步拋錯(工廠), 須為非空原始字串且為Intl接受之時區名稱(不回顯輸入值), 驗證用之值即使用之值
    let dtf = null
    if (typeof timeZone === 'string' && timeZone !== '') {
        try {
            dtf = new Intl.DateTimeFormat('en-US', {
                timeZone,
                hourCycle: 'h23',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
        }
        catch (err) {
            dtf = null
        }
    }
    if (dtf === null) {
        throw new Error('genClockTZ 需要 IANA 時區字串（如 Asia/Taipei）')
    }

    //now, 現在時間於指定時區之各欄位與UTC偏移(分鐘): 欄位取自Intl, 偏移為「該時區牆鐘時間視為UTC」與實際時刻之差, 皆不經系統本地時間
    let now = () => {
        let ms = Date.now()
        let o = {}
        dtf.formatToParts(ms).forEach((v) => {
            o[v.type] = v.value
        })
        let y = Number(o.year)
        let mo = Number(o.month)
        let d = Number(o.day)
        let h = Number(o.hour)
        let mi = Number(o.minute)
        let s = Number(o.second)
        let off = Math.round((Date.UTC(y, mo - 1, d, h, mi, s) - Math.floor(ms / 1000) * 1000) / 60000)
        return { y, mo, d, h, mi, s, off }
    }

    let iso8 = () => {
        let t = now()
        let a = Math.abs(t.off)
        return `${pad(t.y, 4)}-${pad(t.mo)}-${pad(t.d)}T${pad(t.h)}:${pad(t.mi)}:${pad(t.s)}${t.off < 0 ? '-' : '+'}${pad(Math.floor(a / 60))}:${pad(a % 60)}`
    }

    let stamp8 = () => {
        let t = now()
        return `${pad(t.y, 4)}${pad(t.mo)}${pad(t.d)}${pad(t.h)}${pad(t.mi)}${pad(t.s)}`
    }

    let date8 = () => {
        let t = now()
        return `${pad(t.y, 4)}-${pad(t.mo)}-${pad(t.d)}`
    }

    let day8 = () => {
        let t = now()
        return `${pad(t.y, 4)}${pad(t.mo)}${pad(t.d)}`
    }

    let getDay = (s) => {
        //s須為以8位數字開頭之原始字串, 非預期輸入視為未給, 改用目前stamp8()
        if (typeof s !== 'string' || !/^\d{8}/.test(s)) {
            s = stamp8()
        }
        return s.slice(0, 8)
    }

    let getDate = (offsetDay) => {
        let n = 0
        if (iseint(offsetDay)) {
            n = Number(offsetDay)
        }
        let t = now()
        let r = new Date(Date.UTC(t.y, t.mo - 1, t.d + n)) //以日曆日加減(UTC日期運算), 不受夏令時間影響
        let y = r.getUTCFullYear()
        if (Number.isNaN(y) || y < 0 || y > 9999) {
            r = new Date(Date.UTC(t.y, t.mo - 1, t.d)) //偏移使年份超出0000至9999, 視為未給, 改用0
        }
        return `${pad(r.getUTCFullYear(), 4)}-${pad(r.getUTCMonth() + 1)}-${pad(r.getUTCDate())}`
    }

    let formatTime = (s) => {
        //s非「至少12位數字開頭之原始字串」(含數字型戳記)回傳'', 不拋錯(格式化類, dspec §5.3 C3; 使用者2026-11-14, 第430項第二批)
        if (typeof s !== 'string' || !/^\d{12}/.test(s)) {
            return ''
        }
        return `${s.slice(0, 4)}/${s.slice(4, 6)}/${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}`
    }

    let getTimestamp = () => {
        let t = now()
        return `${pad(t.y, 4)}-${pad(t.mo)}-${pad(t.d)} ${pad(t.h)}:${pad(t.mi)}:${pad(t.s)}`
    }

    return {
        timeZone,
        iso8,
        getISO: iso8,
        stamp8,
        getNow: stamp8,
        date8,
        day8,
        getDay,
        getDate,
        formatTime,
        getTimestamp,
    }
}


export default genClockTZ
