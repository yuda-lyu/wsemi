import dayjs from 'dayjs'


//本檔為內部使用, 不由index匯出


//RE_YEAR_00, 年份0000~0099之無時區日期字串(月、日、時、分、秒、毫秒皆為固定寬度之標準寫法, 僅取到月、日或毫秒者皆可)
let RE_YEAR_00 = /^(00\d\d)-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?)?)?$/


/**
 * dayjs之薄包裝(內部使用), 修正年份0000~0099之無時區日期字串被對映為1900~1999
 *
 * 緣由: dayjs解析無時區之日期字串時(其內建正則分支)以new Date(y, m, d, h, mi, s, ms)建立日期, 依JS規則年份0~99被對映為1900~1999, 如dayjs('0050-03-04')得1950-03-04、dayjs('0000-01')得1900-01;
 * 致ismonth、isday、istime等判斷因format結果與輸入字串不同而不收年份0000~0099, 其後之轉換與計算(time2day、addMonth等)若放行則結果差1900年
 *
 * 做法: 年份0000~0099之標準寫法無時區字串, 以Date.setFullYear/setHours建立Date(不經兩位數年份對映, 月、日、時等超出範圍者與new Date同樣進位, 故不合法之字串format後仍與輸入不同)再交dayjs;
 * 其餘輸入(其他年份、含時區之字串、非字串、無參數等)與其餘參數原樣交dayjs, 行為與直接呼叫dayjs相同
 *
 * @param {*} v 輸入任意資料, 同dayjs
 * @param {...*} args 輸入其餘參數, 同dayjs
 * @returns {Object} 回傳dayjs物件
 */
function ot(v, ...args) {

    //dayjs不可用(UMD未載入dayjs全域): 與各模組原『isfun(ot)』守門(now2str、timemsTZ2past等)相同之錯誤, 其守門已因本包裝恆為函數而失效, 故由此拋出
    if (typeof dayjs !== 'function') {
        throw new Error('invalid dayjs')
    }

    if (typeof v === 'string') {
        let m = RE_YEAR_00.exec(v)
        if (m !== null) {
            let d = new Date(2000, 0, 1, 0, 0, 0, 0)
            d.setFullYear(Number(m[1]), Number(m[2]) - 1, m[3] === undefined ? 1 : Number(m[3]))
            d.setHours(m[4] === undefined ? 0 : Number(m[4]), m[5] === undefined ? 0 : Number(m[5]), m[6] === undefined ? 0 : Number(m[6]), m[7] === undefined ? 0 : Number(m[7]))
            return dayjs(d)
        }
    }
    return dayjs(v, ...args)
}


export default ot
