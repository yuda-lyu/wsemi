import tz from './_tz.mjs'


//本檔為內部使用, 不由index匯出


//daysInMonth, 格里曆某年某月(1~12)之天數(以UTC日期運算, 不經本機時間)
let daysInMonth = (y, mo) => {
    let dt = new Date(0)
    dt.setUTCFullYear(y, mo, 0) //次月第0日即本月最後一日(mo為12時進位至次年1月); setUTCFullYear不將年份0~99對映為1900~1999
    return dt.getUTCDate()
}


/**
 * 兩個日期(標準寫法'YYYY-MM-DD')之日曆差(內部使用, 排程第675項之同機制盤點): 天數、周數、月數、年數(皆為整數, later不早於earlier)
 *
 * 緣由: timemsTZ2past、timemsTZ2expire原以dayjs於本機時間建立兩日之午夜物件再diff, 於本機時區之午夜不存在之日(如Africa/Cairo、America/Sao_Paulo之夏令於00:00起跳之日,
 * 該日之午夜被推移為01:00)天數少算1天(如'N天前'少1); 改以日期欄位於UTC日曆運算, 不經本機時間, 故不受夏令影響
 *
 * 語意同dayjs之diff(earlier對later之差取絕對值向下取整): days為日曆日差; weeks為days除7之整數部分; months為earlier加整數個月(日超出該月天數時取月底)不超過later之最大整數;
 * years為months除12之整數部分(對標dayjs之monthDiff, 於UTC時區以窮舉比對相同)
 *
 * @param {String} later 輸入較晚之日期字串'YYYY-MM-DD'
 * @param {String} earlier 輸入較早之日期字串'YYYY-MM-DD'
 * @returns {Object} 回傳{ days, weeks, months, years }; 任一日期非標準寫法(如年份超出0000~9999)或later早於earlier時回傳null(呼叫端退回dayjs之計算)
 */
function calDayDiff(later, earlier) {
    let a = tz.parseWallUnit(later, 'days')
    let b = tz.parseWallUnit(earlier, 'days')
    if (a === null || b === null || a.ms < b.ms) {
        return null
    }
    let days = (a.ms - b.ms) / 86400000
    let months = (a.y - b.y) * 12 + (a.mo - b.mo)
    let anchorDay = Math.min(b.d, daysInMonth(a.y, a.mo)) //earlier加months個月後之日(超出該月天數者取月底)
    if (a.d < anchorDay) {
        months -= 1
    }
    return { days, weeks: Math.floor(days / 7), months, years: Math.floor(months / 12) }
}


export default calDayDiff
