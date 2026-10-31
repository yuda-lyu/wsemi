//optValKit.mjs: 「opt類數值參數非預期之輸入改用預設」(排程第221項第二批)各測試檔共用之表驅動測試建構器
//  依據: dspec〈輸入參數之檢測機制〉K3(opt類參數給了非預期之輸入視為未給、改用預設, 含超出範圍; opt.debug警告)、K4(檢測之值即使用之值)、§7.1
//  同一helper只定義一次; 各測試檔以defineOptParam逐參數宣告, 本檔負責產生: 無效輸入→預設、有效字串→與數值相同、debug警告(固定詞彙、不含值、每行程一次)
import assert from 'assert'
import { INVALID, VALID_STR } from './enumInputs.mjs'
import { resetWarned, capture, stubWarn } from './numOptKit.mjs'


//整數類(iseint)另有之無效: 小數、精度遺失之字串、非安全整數
const INVALID_EINT_EXTRA = [
    ['1.5', 1.5],
    [`'1.5'`, '1.5'],
    [`'1.0000000000000001'`, '1.0000000000000001'],
    [`'9007199254740993'`, '9007199254740993'],
    ['2 ** 53', 2 ** 53],
]


//計時毫秒超出範圍(上限2147483647), 視為未給、改用預設(不夾至上限)
const INVALID_TIMER_OVER = [
    ['2147483648', 2147483648],
    [`'2147483648'`, '2147483648'],
    ['Number.MAX_SAFE_INTEGER', Number.MAX_SAFE_INTEGER],
    ['1e21', 1e21],
    [`'1e21'`, '1e21'],
]


//標籤
function lab(v) {
    if (typeof v === 'symbol' || typeof v === 'bigint') {
        return String(v)
    }
    if (typeof v === 'function') {
        return 'function'
    }
    if (v === undefined) {
        return 'undefined'
    }
    try {
        return JSON.stringify(v)
    }
    catch (err) {
        return 'unserializable'
    }
}


//captureTimers, 於f(同步)執行期間暫換setTimeout/setInterval並記錄(不真的排程), 結束(含拋錯)必還原; 回傳 { r: f之回傳, calls: [{ kind, ms }] }
function captureTimers(f) {
    let calls = []
    let ost = globalThis.setTimeout
    let osi = globalThis.setInterval
    let noop = () => {}
    let fake = () => ({ ref: noop, unref: noop, hasRef: () => false, refresh: noop, [Symbol.toPrimitive]: () => 0 })
    globalThis.setTimeout = (fn, ms) => {
        calls.push({ kind: 'timeout', ms })
        return fake()
    }
    globalThis.setInterval = (fn, ms) => {
        calls.push({ kind: 'interval', ms })
        return fake()
    }
    try {
        let r = f()
        return { r, calls }
    }
    finally {
        globalThis.setTimeout = ost
        globalThis.setInterval = osi
    }
}


/**
 * 宣告一個opt類數值參數之全部案例
 *
 * @param {Object} spec 規則
 * @param {String} spec.fn 函數名(警告訊息用)
 * @param {String} spec.name 參數名(警告訊息用, 如'opt.timeAlive'或'ms')
 * @param {*} spec.def 預設值之可觀察值(probe(undefined)應得此值)
 * @param {Function} spec.probe (v, optExtra) => 可觀察之有效值; v為受測參數之輸入, optExtra為額外合併進opt之物件(如{ debug: true, funLog }), 位置參數且函數無opt者無從合併(此時noDebug為true)
 * @param {Array} spec.valid [[標籤, 輸入, 期望可觀察值]], 有效輸入, 其期望值須為去頭尾空白後Number(…)之值
 * @param {Array} [spec.invalid] 無效輸入[[標籤, 輸入]], 預設為共用矩陣INVALID(30項: Infinity、'0x10'、'1e400'、包裝物件、'-'、'NP'、''、null、布林…), 期望一律為def
 * @param {Array} [spec.extraInvalid] 此參數另有之無效輸入(超出範圍、小數、負數等), 期望一律為def
 * @param {Boolean} [spec.noDebug=false] 為true時略過debug案(位置參數且函數無opt, 無從帶debug)
 * @param {Boolean} [spec.withValidStr=true] 為false時略過共用有效字串VALID_STR案(此時須自備valid)
 */
function defineOptParam(spec) {
    let { fn, name, def, probe } = spec
    let invalid = [...(spec.invalid || INVALID), ...(spec.extraInvalid || [])]
    let valid = [...(spec.valid || [])]
    let noDebug = spec.noDebug === true

    describe(`opt param ${fn} ${name}`, function() {

        it(`should use default when not given (undefined, null)`, function() {
            // K3: undefined與null視為未給
            assert.strict.deepStrictEqual(probe(undefined), def)
            assert.strict.deepStrictEqual(probe(null), def)
        })

        for (let [label, v] of invalid) {
            it(`should use default for unexpected input ${label}`, function() {
                // K3(2026-10-31使用者裁定): opt類參數遇非預期之輸入(含超出範圍)視為未給、改用預設, 不報錯
                let r
                assert.doesNotThrow(() => {
                    r = probe(v)
                })
                assert.strict.deepStrictEqual(r, def)
            })
        }

        for (let [label, v, exp] of valid) {
            it(`should use the value for valid input ${label}`, function() {
                // K4: 檢測之值即使用之值
                assert.strict.deepStrictEqual(probe(v), exp)
            })
        }

        if (spec.withValidStr !== false && valid.length === 0) {
            for (let [label, v, n] of VALID_STR) {
                // 此類僅在呼叫端沒有自備valid且未關閉時使用: 數字字串與數值同(K4); 整數類不適用者請關閉withValidStr自備
                it(`should treat valid numeric string ${label} like the number`, function() {
                    assert.strict.deepStrictEqual(probe(v), probe(n))
                })
            }
        }

        if (!noDebug) {

            let SECRET = 'SECRET-VALUE-123'

            it(`debug true should warn once with fixed wording and without the value`, function() {
                // K3 opt.debug: 固定詞彙、不含傳入之值、每個行程一次、funLog接管
                resetWarned()
                let { funLog, logs } = capture()
                let r = probe(SECRET, { debug: true, funLog })
                assert.strict.deepStrictEqual(r, def)
                assert.strict.deepStrictEqual(logs.length, 1)
                let m = logs[0].msg
                assert.ok(m.startsWith(`[wsemi ${fn}] invalid ${name}: must be `), m)
                assert.ok(m.includes(', using default '), m)
                assert.ok(!m.includes(SECRET), m)
                assert.strict.deepStrictEqual(logs[0].info, { fn, reason: 'invalid', key: name })

                //同一函數同一參數每個行程只警告一次
                probe(SECRET, { debug: true, funLog })
                probe(Infinity, { debug: true, funLog })
                assert.strict.deepStrictEqual(logs.length, 1)

                //重設去重表後再警告
                resetWarned()
                probe(SECRET, { debug: true, funLog })
                assert.strict.deepStrictEqual(logs.length, 2)
                resetWarned()
            })

            it(`debug true should not warn for valid or not-given input`, function() {
                resetWarned()
                let { funLog, logs } = capture()
                probe(undefined, { debug: true, funLog })
                probe(null, { debug: true, funLog })
                for (let [, v] of valid) {
                    probe(v, { debug: true, funLog })
                }
                assert.strict.deepStrictEqual(logs.length, 0)
                resetWarned()
            })

            it(`debug not true (absent, false, non-boolean) should not warn`, function() {
                for (let dbg of [undefined, false, 'true', 1, null, {}]) {
                    resetWarned()
                    let { funLog, logs } = capture()
                    let { warns } = stubWarn(() => probe(SECRET, { debug: dbg, funLog }))
                    assert.strict.deepStrictEqual(logs.length, 0, `debug=${lab(dbg)}`)
                    assert.strict.deepStrictEqual(warns.length, 0, `debug=${lab(dbg)}`)
                }
                resetWarned()
            })

            it(`debug true without funLog should use console.warn, and a throwing funLog should be swallowed`, function() {
                resetWarned()
                let { r, warns } = stubWarn(() => probe(SECRET, { debug: true }))
                assert.strict.deepStrictEqual(r, def)
                assert.strict.deepStrictEqual(warns.length, 1)
                assert.ok(!warns[0].includes(SECRET))
                resetWarned()
                let r2
                assert.doesNotThrow(() => {
                    r2 = probe(SECRET, {
                        debug: true,
                        funLog: () => {
                            throw new Error('x')
                        }
                    })
                })
                assert.strict.deepStrictEqual(r2, def)
                resetWarned()
            })

        }

    })
}


export { INVALID_EINT_EXTRA, INVALID_TIMER_OVER, lab, captureTimers, defineOptParam }
