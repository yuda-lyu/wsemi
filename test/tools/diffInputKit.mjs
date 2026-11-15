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


/**
 * ws430c(裁定表〈七〉「回傳之 diff 改以元素陣列表示(格式改變);dfs 之格式不變」): 把修前之diff期望值(以字串表示之各段)轉為新格式(各段value為元素陣列),
 * 段之切分(count、added、removed)不變, 供arrDiff/matDiff/ltdtDiff之既有期望值沿用(只適用值內不含換行、'⟋'、'∶'之資料, 即修前可正確表示者)
 *
 * 一維(mode 'array'): value '-0.5\n123\n' → ['-0.5', '123']
 * 矩陣(mode 'matrix'): value '0∶1⟋1∶a⟋\n0∶2⟋\n' → [['1', 'a'], ['2']](每行為一列, 以'⟋'分格, 去掉各格之「欄位指標∶」)
 *
 * @param {Array} diffOld 輸入修前之diff期望值
 * @param {String} mode 輸入'array'或'matrix'
 * @returns {Array} 回傳新格式之diff期望值
 */
export function oldDiffToNew(diffOld, mode) {
    return diffOld.map((c) => {
        let lines = c.value.split('\n')
        lines.pop() //每行以'\n'結尾
        let value
        if (mode === 'matrix') {
            value = lines.map((l) => {
                let cs = l.split('⟋')
                cs.pop() //每格以'⟋'結尾
                return cs.map((s) => s.slice(s.indexOf('∶') + 1))
            })
        }
        else {
            value = lines
        }
        assert.strict.deepStrictEqual(value.length, c.count) //修前之count即段內元素數
        return { count: c.count, added: c.added, removed: c.removed, value }
    })
}
