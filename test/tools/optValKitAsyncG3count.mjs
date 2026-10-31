//optValKitAsyncG3count.mjs: optValKit.mjs之defineOptParam的非同步版(probe為async), 供本組(g3count)觀察值須等非同步流程才得知之參數用
//  (cacheBd之nTrigger須等輪詢、雜湊函數之chunkSize須等串流/Blob切片); 案例結構與defineOptParam相同(未給→預設; 共用無效輸入矩陣→預設; 有效值→期望值; debug警告固定詞彙/不含值/每行程一次/funLog與console.warn/非布林debug不警告/funLog拋錯被吞)
//  依據: dspec〈輸入參數之檢測機制〉K3、K4、§7.1; 不改共用件optValKit.mjs, 另置本檔
import assert from 'assert'
import { INVALID, VALID_STR } from './enumInputs.mjs'
import { resetWarned, capture } from './numOptKit.mjs'
import { lab } from './optValKit.mjs'


//stubWarnAsync, 於async函數f執行期間暫換console.warn並記錄, 結束(含拋錯)必還原; 回傳 { r: f之回傳, warns: [訊息] }
async function stubWarnAsync(f) {
    let warns = []
    let ow = console.warn
    console.warn = (...args) => {
        warns.push(args[0])
    }
    try {
        let r = await f()
        return { r, warns }
    }
    finally {
        console.warn = ow
    }
}


/**
 * 宣告一個opt類數值參數之全部案例(probe為async)
 *
 * @param {Object} spec 同optValKit.defineOptParam, 另: title為describe之標題(預設`${fn} ${name}`)
 */
function defineOptParamAsync(spec) {
    let { fn, name, def, probe } = spec
    let invalid = [...(spec.invalid || INVALID), ...(spec.extraInvalid || [])]
    let valid = [...(spec.valid || [])]
    let noDebug = spec.noDebug === true
    let title = spec.title || `${fn} ${name}`

    describe(`opt param (async) ${title}`, function() {

        it(`should use default when not given (undefined, null)`, async function() {
            // K3: undefined與null視為未給
            assert.strict.deepStrictEqual(await probe(undefined), def)
            assert.strict.deepStrictEqual(await probe(null), def)
        })

        for (let [label, v] of invalid) {
            it(`should use default for unexpected input ${label}`, async function() {
                // K3(2026-10-31使用者裁定): opt類參數遇非預期之輸入(含超出範圍)視為未給、改用預設, 不報錯
                let r
                try {
                    r = await probe(v)
                }
                catch (err) {
                    assert.fail(`must not throw: ${err && err.message}`)
                }
                assert.strict.deepStrictEqual(r, def)
            })
        }

        for (let [label, v, exp] of valid) {
            it(`should use the value for valid input ${label}`, async function() {
                // K4: 檢測之值即使用之值
                assert.strict.deepStrictEqual(await probe(v), exp)
            })
        }

        if (spec.withValidStr !== false && valid.length === 0) {
            for (let [label, v, n] of VALID_STR) {
                it(`should treat valid numeric string ${label} like the number`, async function() {
                    assert.strict.deepStrictEqual(await probe(v), await probe(n))
                })
            }
        }

        if (!noDebug) {

            let SECRET = 'SECRET-VALUE-123'

            it(`debug true should warn once with fixed wording and without the value`, async function() {
                // K3 opt.debug: 固定詞彙、不含傳入之值、每個行程一次、funLog接管
                resetWarned()
                let { funLog, logs } = capture()
                let r = await probe(SECRET, { debug: true, funLog })
                assert.strict.deepStrictEqual(r, def)
                assert.strict.deepStrictEqual(logs.length, 1)
                let m = logs[0].msg
                assert.ok(m.startsWith(`[wsemi ${fn}] invalid ${name}: must be `), m)
                assert.ok(m.includes(', using default '), m)
                assert.ok(!m.includes(SECRET), m)
                assert.strict.deepStrictEqual(logs[0].info, { fn, reason: 'invalid', key: name })

                //同一函數同一參數每個行程只警告一次
                await probe(SECRET, { debug: true, funLog })
                await probe(Infinity, { debug: true, funLog })
                assert.strict.deepStrictEqual(logs.length, 1)

                //重設去重表後再警告
                resetWarned()
                await probe(SECRET, { debug: true, funLog })
                assert.strict.deepStrictEqual(logs.length, 2)
                resetWarned()
            })

            it(`debug true should not warn for valid or not-given input`, async function() {
                resetWarned()
                let { funLog, logs } = capture()
                await probe(undefined, { debug: true, funLog })
                await probe(null, { debug: true, funLog })
                for (let [, v] of valid) {
                    await probe(v, { debug: true, funLog })
                }
                assert.strict.deepStrictEqual(logs.length, 0)
                resetWarned()
            })

            it(`debug not true (absent, false, non-boolean) should not warn`, async function() {
                for (let dbg of [undefined, false, 'true', 1, null, {}]) {
                    resetWarned()
                    let { funLog, logs } = capture()
                    let { warns } = await stubWarnAsync(() => probe(SECRET, { debug: dbg, funLog }))
                    assert.strict.deepStrictEqual(logs.length, 0, `debug=${lab(dbg)}`)
                    assert.strict.deepStrictEqual(warns.length, 0, `debug=${lab(dbg)}`)
                }
                resetWarned()
            })

            it(`debug true without funLog should use console.warn, and a throwing funLog should be swallowed`, async function() {
                resetWarned()
                let { r, warns } = await stubWarnAsync(() => probe(SECRET, { debug: true }))
                assert.strict.deepStrictEqual(r, def)
                assert.strict.deepStrictEqual(warns.length, 1)
                assert.ok(!warns[0].includes(SECRET))
                resetWarned()
                let r2
                try {
                    let funLogThrow = () => {
                        throw new Error('x')
                    }
                    r2 = await probe(SECRET, { debug: true, funLog: funLogThrow })
                }
                catch (err) {
                    assert.fail(`funLog throw must be swallowed: ${err && err.message}`)
                }
                assert.strict.deepStrictEqual(r2, def)
                resetWarned()
            })

        }

    })
}


//INVALID_WARN: 共用無效輸入中「會警告者」(undefined與null視為未給, 不警告)
const INVALID_WARN = INVALID.filter(([, v]) => v !== undefined && v !== null)


/**
 * 宣告「每個非預期之輸入皆警告恰一次」案(debug為true時): 與defineOptParam並用, 補足其只以單一字串輸入驗警告之不足,
 * 使「接受範圍判定放寬」(如負數、超出範圍、小數被收下而結果恰與預設相同)亦能被偵測
 *
 * @param {Object} spec { fn, name, probe(v, optExtra), list: [[標籤, 輸入]], title? }; probe可為同步或async
 */
function defineWarnEach(spec) {
    let { fn, name, probe, list } = spec
    let title = spec.title || `${fn} ${name}`
    it(`debug true should warn exactly once for each unexpected input (${title}, ${list.length} inputs)`, async function() {
        // K3 opt.debug: 非預期之輸入(含超出範圍)皆警告; 固定詞彙, 不含值
        for (let [label, v] of list) {
            resetWarned()
            let { funLog, logs } = capture()
            await probe(v, { debug: true, funLog })
            assert.strict.deepStrictEqual(logs.length, 1, `warn count for ${label}`)
            assert.strict.deepStrictEqual(logs[0].info, { fn, reason: 'invalid', key: name }, `warn info for ${label}`)
        }
        resetWarned()
    })
}


export { stubWarnAsync, defineOptParamAsync, defineWarnEach, INVALID_WARN }
