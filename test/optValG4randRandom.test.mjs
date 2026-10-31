import assert from 'assert'
import path from 'path'
import { fileURLToPath } from 'url'
import randomRange from '../src/randomRange.mjs'
import randomsRange from '../src/randomsRange.mjs'
import randomIntsRange from '../src/randomIntsRange.mjs'
import pseudoRandomRange from '../src/pseudoRandomRange.mjs'
import pseudoRandomsRange from '../src/pseudoRandomsRange.mjs'
import pseudoRandomIntRange from '../src/pseudoRandomIntRange.mjs'
import pseudoRandomIntsRange from '../src/pseudoRandomIntsRange.mjs'
import { INVALID, VALID_STR } from './tools/enumInputs.mjs'
import { defineOptParam, INVALID_EINT_EXTRA } from './tools/optValKit.mjs'
import { runChildCase } from './tools/runChildCase.mjs'


//隨機系7函數(第一級發布A; 完整為10函數)之vstart、vend、n(皆為opt類位置參數: JSDoc [參數=預設]或程式碼有回退, 函數無opt物件故不帶debug, noDebug)
//  vstart、vend: 實數系(randomRange、randomsRange、pseudoRandomRange、pseudoRandomsRange)為有效數字(isenum, 無範圍限制), 整數系為有效整數(iseint, use: 'safe')
//  n: 有效整數且為個數1~4294967295(iseint, use: 'count', min: 1)
//  非預期之輸入(含超出範圍、Infinity、'0x10'、包裝物件等)視為未給、改用預設(vstart 0、vend 1或100、n 1), 不報錯; vstart > vend 之throw維持
//  可觀察值: 隨機值本身不可預期, 故以「vstart > vend 之錯誤訊息 vstart[x] > vend[y]」取出實際採用之邊界(以極小vend取vstart、以極大vstart取vend), n以回傳陣列長度
let runner = path.join(path.dirname(fileURLToPath(import.meta.url)), 'tools', 'optValG4randHugeNRunner.mjs')


const REAL = { neg: -Number.MAX_VALUE, pos: Number.MAX_VALUE }
const INT = { neg: -Number.MAX_SAFE_INTEGER, pos: Number.MAX_SAFE_INTEGER }

//第一級發布A只納入下列7個(randomIntRange有下游站點、randomIntsNdpRange與pseudoRandomIntsNdpRange有Infinity邊界, 皆不在本輪, 其測試不在此; 下方ndp分支為保留之資料驅動分支, 本輪無ndp成員)
const FNS = [
    { name: 'randomRange', fn: randomRange, kind: 'real', arr: false, ndp: false },
    { name: 'randomsRange', fn: randomsRange, kind: 'real', arr: true, ndp: false },
    { name: 'randomIntsRange', fn: randomIntsRange, kind: 'int', arr: true, ndp: false },
    { name: 'pseudoRandomRange', fn: pseudoRandomRange, kind: 'real', arr: false, ndp: false },
    { name: 'pseudoRandomsRange', fn: pseudoRandomsRange, kind: 'real', arr: true, ndp: false },
    { name: 'pseudoRandomIntRange', fn: pseudoRandomIntRange, kind: 'int', arr: false, ndp: false },
    { name: 'pseudoRandomIntsRange', fn: pseudoRandomIntsRange, kind: 'int', arr: true, ndp: false },
]


//bounds, 呼叫f並解析其 vstart > vend 之錯誤訊息, 回傳 [vstart, vend] (實際採用之值); 未拋錯回傳'NOTHROW', 其他錯誤回傳'ERR:訊息'
function bounds(f) {
    try {
        f()
        return 'NOTHROW'
    }
    catch (err) {
        let m = /^vstart\[(.*)\] > vend\[(.*)\]$/.exec(err.message)
        return m ? [Number(m[1]), Number(m[2])] : `ERR:${err.message}`
    }
}


//超大值(Number > 1e5): 若被當作有效個數會近乎無限迴圈, 於程序內無法逾時中止, 故由子行程案例驗證, 程序內矩陣不含
function huge(v) {
    if (typeof v === 'symbol') {
        return false
    }
    try {
        return Number(v) > 1e5
    }
    catch (err) {
        return false
    }
}


let EINT_STR = VALID_STR.filter(([, , n]) => Number.isInteger(n))


for (let { name, fn, kind, arr, ndp } of FNS) {

    let K = kind === 'real' ? REAL : INT
    let defEnd = kind === 'real' ? 1 : 100

    //idx, pseudoRandomIntsNdpRange既有行為: 回傳0~(vend-vstart)之索引(不含vstart偏移), 非本批範圍
    let idx = name === 'pseudoRandomIntsNdpRange'

    //vstart: 以極小vend取出實際採用之vstart
    let validStart = kind === 'real'
        ? [...VALID_STR, ['0', 0, 0], ['-5', -5, -5], ['1.5', 1.5, 1.5], ['1e300', 1e300, 1e300], ['Number.MAX_VALUE', Number.MAX_VALUE, Number.MAX_VALUE]]
        : [...EINT_STR, ['0', 0, 0], ['-5', -5, -5], [`'-5'`, '-5', -5], ['MAX_SAFE', Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]]

    //vend: 以極大vstart取出實際採用之vend (最大值本身不拋錯故不列)
    let validEnd = kind === 'real'
        ? [...VALID_STR, ['0', 0, 0], ['-5', -5, -5], ['1.5', 1.5, 1.5], ['-Number.MAX_VALUE', -Number.MAX_VALUE, -Number.MAX_VALUE]]
        : [...EINT_STR, ['0', 0, 0], ['-5', -5, -5], [`'-5'`, '-5', -5], ['-MAX_SAFE', -Number.MAX_SAFE_INTEGER, -Number.MAX_SAFE_INTEGER]]

    //整數系另有之無效: 小數、精度遺失之字串、非安全整數、超大
    let extraInt = [...INVALID_EINT_EXTRA, ['1e21', 1e21], [`'1e21'`, '1e21'], ['-(2 ** 53)', -(2 ** 53)]]

    describe(`optVal ${name}`, function() {

        defineOptParam({
            fn: name,
            name: 'vstart',
            def: 0,
            probe: (v) => {
                let r = bounds(() => fn(v, K.neg))
                return Array.isArray(r) ? r[0] : r
            },
            valid: validStart,
            extraInvalid: kind === 'real' ? [] : extraInt,
            noDebug: true,
        })

        //Ndp系之超大vend若被當作有效值會建立巨大範圍而卡死, 程序內矩陣不含超大者, 改由子行程案例驗證
        let invalidEnd = ndp ? INVALID.filter(([, v]) => !huge(v)) : INVALID
        let extraEnd = kind === 'real' ? [] : (ndp ? extraInt.filter(([, v]) => !huge(v)) : extraInt)
        defineOptParam({
            fn: name,
            name: 'vend',
            def: defEnd,
            probe: (v) => {
                let r = bounds(() => fn(K.pos, v))
                return Array.isArray(r) ? r[1] : r
            },
            valid: validEnd,
            invalid: invalidEnd,
            extraInvalid: extraEnd,
            noDebug: true,
        })

        if (arr) {
            //n: 個數1~4294967295; 實際採用之n以回傳陣列長度觀察(Ndp系長度為min(n, 101)), 非Ndp系之有效n取小值(迴圈)
            let validN = [
                ...EINT_STR,
                ['1', 1, 1],
                ['3', 3, 3],
                [`' 7 '`, ' 7 ', 7],
            ]
            if (ndp) {
                validN.push(['100', 100, 100], ['101 (all)', 101, 101], ['102 (more than all)', 102, 101], ['4294967295 (upper bound)', 4294967295, 101], [`'4294967295'`, '4294967295', 101])
            }
            let extraN = [
                ['0', 0],
                [`'0'`, '0'],
                ['-1', -1],
                [`'-1'`, '-1'],
                ['4294967296', 4294967296],
                [`'4294967296'`, '4294967296'],
                ...extraInt,
            ]
            defineOptParam({
                fn: name,
                name: 'n',
                def: 1,
                probe: (v) => (kind === 'real' ? fn(0, 1, v) : fn(0, 100, v)).length,
                valid: validN,
                invalid: ndp ? INVALID : INVALID.filter(([, v]) => !huge(v)),
                extraInvalid: ndp ? extraN : extraN.filter(([, v]) => !huge(v)),
                noDebug: true,
            })
        }

        if (arr && !ndp) {
            it('should treat a huge or out-of-range n as not given (n=1) without looping (child process)', function() {
                // K3: n超出個數範圍(含Infinity、超過4294967295、非安全整數)視為未給而用預設1; 現況Infinity會近乎無限迴圈(子行程逾時即為失敗)
                let { r } = runChildCase(runner, name, { exitMode: 'n', timeout: 20000 })
                assert.strict.deepStrictEqual(r.lens, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
            })
        }

        if (ndp) {
            it('should treat a huge n as not given (n=1), a huge vend as not given (vend=100) without hanging (child process)', function() {
                // K3: n超過4294967295或非有效整數視為未給; vend超出安全整數範圍視為未給而用預設100(現況會建立巨大範圍)
                let a = runChildCase(runner, name, { exitMode: 'n', timeout: 20000 })
                assert.strict.deepStrictEqual(a.r.lens, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
                let b = runChildCase(runner, name, { exitMode: 'vend', timeout: 20000 })
                let want = `vstart[${Number.MAX_SAFE_INTEGER}] > vend[100]`
                assert.strict.deepStrictEqual(b.r.msgs, [want, want, want, want, want, want, want])
            })
        }

        it('should still throw when vstart > vend, using the effective values', function() {
            // K3: vstart > vend 之throw維持; 訊息為實際採用之值(非預期之輸入已換為預設)
            let big = kind === 'real' ? 5.5 : 150
            assert.throws(() => fn(5, 3), /^Error: vstart\[5\] > vend\[3\]$/)
            assert.throws(() => fn('abc', -1), /^Error: vstart\[0\] > vend\[-1\]$/)
            assert.throws(() => fn(big, 'abc'), new RegExp(`^Error: vstart\\[${big}\\] > vend\\[${defEnd}\\]$`))
            assert.throws(() => fn(' 6 ', ' 2 '), /^Error: vstart\[6\] > vend\[2\]$/)
        })

        it('should accept vstart equal to vend', function() {
            // vstart等於vend不拋錯: 實數系值域[vstart,vend)寬度0故回傳vstart, 整數系回傳vstart
            //  (pseudoRandomIntsNdpRange既有行為為回傳0~(vend-vstart)之索引而不含vstart偏移, 非本批範圍, 見result.md〈發現〉)
            let r = fn(3, 3)
            let v = arr ? r[0] : r
            assert.strict.deepStrictEqual(v, idx ? 0 : 3)
        })

        it('should fall back to the defaults for unexpected bounds and give values in the default range', function() {
            // 非預期之vstart、vend改用預設: 實數系[0,1)、整數系[0,100]之整數
            for (let i = 0; i < 100; i++) {
                let r = fn('abc', Infinity)
                let vs = arr ? r : [r]
                for (let x of vs) {
                    if (kind === 'real') {
                        assert.ok(x >= 0 && x < 1, String(x))
                    }
                    else {
                        assert.ok(Number.isInteger(x) && x >= 0 && x <= 100, String(x))
                    }
                }
            }
        })

        it('should use numeric strings (trimmed) for the bounds', function() {
            // K4: 數字字串去頭尾空白後取值; 實數系[2,3)、整數系[2,4] (pseudoRandomIntsNdpRange為索引0~2)
            for (let i = 0; i < 100; i++) {
                let r = kind === 'real' ? fn(' 2 ', '3') : fn(' 2 ', '4')
                let vs = arr ? r : [r]
                for (let x of vs) {
                    if (kind === 'real') {
                        assert.ok(x >= 2 && x < 3, String(x))
                    }
                    else {
                        assert.ok(Number.isInteger(x) && x >= (idx ? 0 : 2) && x <= (idx ? 2 : 4), String(x))
                    }
                }
            }
        })

        if (arr) {
            it('should return n values for a valid n (numeric string too) and 1 value otherwise', function() {
                // K4: n去頭尾空白後取值; 非預期之n(0、小數、'abc')用預設1
                let args = kind === 'real' ? [0, 1] : [0, 100]
                assert.strict.deepStrictEqual(fn(...args, ' 5 ').length, 5)
                assert.strict.deepStrictEqual(fn(...args, 5).length, 5)
                for (let n of [0, -1, 1.5, '1.5', 'abc', '0x10', null, undefined, NaN]) {
                    assert.strict.deepStrictEqual(fn(...args, n).length, 1, String(n))
                }
            })
        }

        if (ndp) {
            it('should give distinct values within the range and at most (vend - vstart + 1) values', function() {
                // Ndp: 不重複; 最長為vend-vstart+1個(n較大時回傳全部); pseudoRandomIntsNdpRange既有行為為0~(vend-vstart)之索引
                let lo = idx ? 0 : 5
                let r = fn(5, 9, 100)
                assert.strict.deepStrictEqual([...r].sort((a, b) => a - b), [lo, lo + 1, lo + 2, lo + 3, lo + 4])
                let s = fn('5', ' 9 ', '3')
                assert.strict.deepStrictEqual(s.length, 3)
                assert.strict.deepStrictEqual(new Set(s).size, 3)
                assert.ok(s.every((x) => x >= lo && x <= lo + 4))
            })
        }

    })

}


describe('optVal pseudoRandom* with a fixed seed (deterministic)', function() {

    // seed不在清單內(維持原樣); 以固定seed使結果可重現, 驗非預期之vstart、vend、n與其預設等價
    it('pseudoRandomRange: unexpected vstart/vend equal the defaults 0/1, numeric strings equal numbers', function() {
        assert.strict.deepStrictEqual(pseudoRandomRange('abc', Infinity, 123), pseudoRandomRange(0, 1, 123))
        assert.strict.deepStrictEqual(pseudoRandomRange(' 2 ', '5', 123), pseudoRandomRange(2, 5, 123))
        assert.strict.deepStrictEqual(pseudoRandomRange(null, null, 123), 0.6964691872708499)
    })

    it('pseudoRandomsRange: unexpected vstart/vend/n equal the defaults 0/1/1', function() {
        assert.strict.deepStrictEqual(pseudoRandomsRange('abc', Infinity, 0, 123), pseudoRandomsRange(0, 1, 1, 123))
        assert.strict.deepStrictEqual(pseudoRandomsRange(' 2 ', '5', ' 3 ', 123), pseudoRandomsRange(2, 5, 3, 123))
    })

    it('pseudoRandomIntRange: unexpected vstart/vend equal the defaults 0/100, integer strings equal numbers', function() {
        assert.strict.deepStrictEqual(pseudoRandomIntRange(1.5, '0x10', 123), pseudoRandomIntRange(0, 100, 123))
        assert.strict.deepStrictEqual(pseudoRandomIntRange(' 20 ', '50', 123), pseudoRandomIntRange(20, 50, 123))
        assert.strict.deepStrictEqual(pseudoRandomIntRange(null, null, 123), 70)
    })

    it('pseudoRandomIntsRange: unexpected vstart/vend/n equal the defaults 0/100/1', function() {
        assert.strict.deepStrictEqual(pseudoRandomIntsRange(1.5, Infinity, 1.5, 123), pseudoRandomIntsRange(0, 100, 1, 123))
        assert.strict.deepStrictEqual(pseudoRandomIntsRange(' 20 ', '50', ' 4 ', 123), pseudoRandomIntsRange(20, 50, 4, 123))
    })

})
