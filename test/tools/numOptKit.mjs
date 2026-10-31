//isenum、iseint之opt測試共用輔助(非預期之輸入視為未給、debug警告), 同一helper只定義一次
import assert from 'assert'
import parseNumOpt from '../../src/_numOpt.mjs'


//resetWarned, 重設行程內已警告之表(去重表)
function resetWarned() {
    parseNumOpt.resetWarned()
}


//capture, 建立警告紀錄器: funLog收(msg, info), logs為依序之 { msg, info }
function capture() {
    let logs = []
    let funLog = (msg, info) => {
        logs.push({ msg, info })
    }
    return { funLog, logs }
}


//stubWarn, 於f執行期間暫換console.warn並記錄, 結束(含拋錯)必還原; 回傳 { r: f之回傳, warns: [訊息] }
function stubWarn(f, impl = null) {
    let warns = []
    let ow = console.warn
    console.warn = (...args) => {
        warns.push(args[0])
        if (impl) {
            impl(...args)
        }
    }
    try {
        let r = f()
        return { r, warns }
    }
    finally {
        console.warn = ow
    }
}


//sameAs, 斷言fn(v, opt)與fn(v, eff)對每個探測值結果相同, 且不拋錯(opt之非預期輸入視為未給)
function sameAs(fn, opt, eff, probes, label = '') {
    for (let v of probes) {
        let a
        let b
        assert.doesNotThrow(() => {
            a = fn(v, opt)
        }, `${label} opt must not throw for v=${typeof v === 'symbol' || typeof v === 'bigint' ? String(v) : JSON.stringify(v)}`)
        b = fn(v, eff)
        assert.strict.deepStrictEqual(typeof a, 'boolean')
        assert.strict.deepStrictEqual(a, b, `${label} v=${typeof v === 'bigint' ? String(v) : JSON.stringify(v)}`)
    }
}


export { resetWarned, capture, stubWarn, sameAs }
