import get from 'lodash-es/get.js'
import iseint from './iseint.mjs'
import strTruncate from './strTruncate.mjs'


/**
 * 取得execCli結果之失敗摘要字串(嘗試次數與stderr前段)，供附在execCli之error字串後組成可讀的失敗訊息
 *
 * 輸出格式為「，共試 N 次 → stderr前n字」：stderr內連續空白與換行壓成單一空格(單行)後取前n字，超長時由strTruncate補上刪節號「...」(未超長原樣，故讀者可分辨「訊息就這麼短」與「被切掉了」)；僅有嘗試次數時為「，共試 N 次」，僅有stderr時為「 → stderr前n字」；嘗試次數為0亦顯示(如execCli因指令無效未啟動而attempts為0，顯示「，共試 0 次」)；兩者皆無資訊(如result非物件、attempts缺漏且stderr為空)回傳空字串，故可直接以字串串接：`${r.error}${execCliFailDetail(r)}`
 *
 * 本函數永不拋錯，不回顯result之其他欄位(只讀attempts與stderr)，stderr內容原樣取自子進程輸出(execCli已將其截斷)
 *
 * 契約同執行殼原cliFailDetail(attempts有值即顯示、stderr以oneline壓單行並由strTruncate截斷補刪節號)，n以字元(UTF-16碼元)計，故落在代理對(如表情符號)中間時可能切成半個字元
 *
 * Unit Test: {@link https://github.com/yuda-lyu/wsemi/blob/master/test/execCliFailDetail.test.mjs Github}
 * @memberOf wsemi
 * @param {Object} result 輸入execCli回傳之結果物件，讀取其attempts(嘗試次數，非負整數含0才採用)與stderr(字串才採用)，result非物件或不可讀時視為無資訊
 * @param {Number} [n=300] 輸入stderr取前幾字之正整數，以字元計(同strTruncate)，非預期輸入視為未給，改用預設300
 * @returns {String} 回傳失敗摘要字串，無資訊時回傳空字串
 * @example
 * need test in nodejs.
 *
 * async function test() {
 *
 *     let r = await execCli(process.execPath, ['-e', 'console.error("line1\\nline2"); process.exit(1)'], { maxRetries: 1, retryDelayMs: 1 })
 *     console.log(r.ok, r.attempts)
 *     // => false 2
 *
 *     console.log(`${r.error}${execCliFailDetail(r)}`)
 *     // => Exit code 1，共試 2 次 → line1 line2
 *
 *     console.log(execCliFailDetail(r, 3))
 *     // => ，共試 2 次 → lin...
 *
 *     console.log(execCliFailDetail({ attempts: 0 }))
 *     // => ，共試 0 次
 *
 *     console.log(JSON.stringify(execCliFailDetail(null)))
 *     // => ""
 *
 * }
 * test()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
function execCliFailDetail(result, n = 300) {

    //n, 非預期輸入改用預設
    if (!iseint(n, { min: 1 })) {
        n = 300
    }
    else {
        n = Number(n)
    }

    //attempts, stderr, 讀取置於try內: result不可讀(getter拋錯、已撤銷之Proxy)時視為無資訊
    let attempts = null
    let text = ''
    try {
        let a = get(result, 'attempts', null)
        if (iseint(a, { min: 0 })) {
            attempts = Number(a) //0亦顯示(原契約attempts有值即顯示), 非整數視為無
        }
        let s = get(result, 'stderr', '')
        if (typeof s === 'string') {
            text = s.replace(/\s+/g, ' ').trim()
        }
    }
    catch (err) {
        attempts = null
        text = ''
    }

    //截斷委派strTruncate(同原契約oneline), 超長補'...'
    text = strTruncate(text, n)

    //compose
    let r = ''
    if (attempts !== null) {
        r += `，共試 ${attempts} 次`
    }
    if (text !== '') {
        r += ` → ${text}`
    }
    return r
}


export default execCliFailDetail
