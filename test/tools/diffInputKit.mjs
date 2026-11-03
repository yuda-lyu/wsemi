import assert from 'assert'


//ws286c: 差異比對子類(strDiff, strDiffToHtml, arrDiff, matDiff, ltdtDiff)必須參數測試共用: 無效值表, 訊息斷言(固定字串且不帶值), console攔截


//訊息不得帶出之標記, 測試把它放進無效值內, 斷言訊息不含
export const LEAK = 'LEAK-MARK-7391'


//非字串之值([label, value]), 供strDiff與strDiffToHtml之strOld與strNew
export const NON_STR = [
    ['undefined', undefined],
    ['null', null],
    ['0', 0],
    ['123', 123],
    ['-1.5', -1.5],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['true', true],
    ['false', false],
    ['[]', []],
    [`['abc']`, ['abc']],
    ['{}', {}],
    ['{ a: 1 }', { a: 1 }],
    ['() => 1', () => 1],
    ['Symbol()', Symbol('x')],
    ['1n', 1n],
    ['new Date(0)', new Date(0)],
    ['/x/', /x/],
    ['new Map()', new Map()],
    ['new Set()', new Set()],
    ['Buffer.from(\'abc\')', Buffer.from('abc')],
]


//非陣列之值([label, value]), 供arrDiff, matDiff與ltdtDiff之舊新參數; 含字串與''(字串不是陣列)與類陣列
export const NON_ARR = [
    ['undefined', undefined],
    ['null', null],
    ['0', 0],
    ['123', 123],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['true', true],
    ['false', false],
    [`'abc'`, 'abc'],
    [`''`, ''],
    ['{}', {}],
    ['{ a: 1 }', { a: 1 }],
    ['{ length: 0 }', { length: 0 }],
    [`{ 0: 'a', length: 1 }`, { 0: 'a', length: 1 }],
    ['() => []', () => []],
    ['Symbol()', Symbol('x')],
    ['1n', 1n],
    ['new Date(0)', new Date(0)],
    ['new Map()', new Map()],
    ['new Set()', new Set()],
    ['new Uint8Array(2)', new Uint8Array(2)],
]


//不是物件之陣列元素([label, value]), 供ltdtDiff之元素檢測
export const NON_OBJ_ELEM = [
    ['undefined', undefined],
    ['null', null],
    ['0', 0],
    ['1', 1],
    ['123', 123],
    ['NaN', NaN],
    [`'abc'`, 'abc'],
    [`''`, ''],
    ['true', true],
    ['false', false],
    ['[]', []],
    ['[1]', [1]],
    ['[{ a: 1 }]', [{ a: 1 }]],
    ['() => 1', () => 1],
    ['Symbol()', Symbol('x')],
    ['1n', 1n],
    ['new Date(0)', new Date(0)],
    ['/x/', /x/],
    ['new Map()', new Map()],
    ['new Set()', new Set()],
]


/**
 * 攔截console輸出(log, info, warn, error, debug)並回傳呼叫總次數, 結束後必還原
 *
 * @param {Function} fn 同步函數
 * @returns {Number} console被呼叫之總次數
 */
export function countConsole(fn) {
    let names = ['log', 'info', 'warn', 'error', 'debug']
    let orig = {}
    let n = 0
    for (let name of names) {
        orig[name] = console[name]
        console[name] = () => {
            n++
        }
    }
    try {
        fn()
    }
    finally {
        for (let name of names) {
            console[name] = orig[name]
        }
    }
    return n
}


/**
 * 斷言fn同步throw Error且訊息恰為msg, 且throw前後console皆未被呼叫(不輸出輸入資料)
 *
 * @param {Function} fn 同步函數
 * @param {String} msg 預期訊息
 * @returns {Error} 回傳被拋出之Error
 */
export function throwsMsg(fn, msg) {
    let err = null
    let n = countConsole(() => {
        try {
            fn()
        }
        catch (e) {
            err = e
        }
    })
    assert.ok(err instanceof Error, `should throw an Error, expected: ${msg}`)
    assert.strict.deepStrictEqual(err.message, msg)
    assert.strict.deepStrictEqual(n, 0, 'should not write anything to console')
    return err
}


/**
 * 斷言fn同步throw Error, 訊息恰為msg且不含LEAK標記
 *
 * @param {Function} fn 同步函數
 * @param {String} msg 預期訊息
 */
export function throwsMsgNoLeak(fn, msg) {
    let err = throwsMsg(fn, msg)
    assert.ok(!err.message.includes(LEAK), err.message)
}
