import assert from 'assert'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import judge from '../src/judge.mjs'
import preciseNum from '../src/preciseNum.mjs'
import estimateTicks from '../src/estimateTicks.mjs'
import color from '../src/color.mjs'
import { runChildCase } from './tools/runChildCase.mjs'
import { INVALID, INVALID_BUT_ISNUM, VALID_STR } from './tools/enumInputs.mjs'


let __dirname = dirname(fileURLToPath(import.meta.url))
let spreadRunner = join(__dirname, 'tools', 'colorSpreadRunner.mjs')


let isErr = (msg) => {
    return (err) => {
        assert.strict.deepStrictEqual(err instanceof Error, true)
        assert.strict.deepStrictEqual(err.message, msg)
        return true
    }
}


//排程第221項第一批之第二段: 計算函數(judge、preciseNum、estimateTicks、color)之數字判定由isnum改isenum、整數由isint改iseint, 無效仍throw(訊息不改)
//依據: dspec〈輸入參數之檢測機制〉§3.1、§7.1、§7.2(N2入口檢測: 無效throw)、§11(2026-10-31使用者裁定)
describe(`計算函數改用isenum/iseint(第221項第一批)`, function() {

    describe(`judge`, function() {

        let ops = ['===', '!==', '>=', '<=', '>', '<']

        //對應§7.2: 非有效數字throw, 訊息不改(x1、x2各自指名), 不論op與withPreciseNum
        for (let [lb, v] of INVALID) {
            it(`should throw x1 is not a number when x1 is ${lb}`, function() {
                for (let op of ops) {
                    assert.throws(() => judge(v, op, 1), isErr('x1 is not a number'))
                    assert.throws(() => judge(v, op, 1, { withPreciseNum: false }), isErr('x1 is not a number'))
                }
            })
            it(`should throw x2 is not a number when x2 is ${lb}`, function() {
                for (let op of ops) {
                    assert.throws(() => judge(1, op, v), isErr('x2 is not a number'))
                    assert.throws(() => judge(1, op, v, { withPreciseNum: false }), isErr('x2 is not a number'))
                }
            })
        }

        //對應§7.2: 入口檢測依參數順序由左至右, 兩者皆無效時先報x1
        it(`should report x1 first when both x1 and x2 are invalid`, function() {
            assert.throws(() => judge(Infinity, '===', '0x10'), isErr('x1 is not a number'))
        })

        //對應§3.1與K4: 數字字串(含頭尾空白、科學記號)可比較, withPreciseNum為true/false皆不洩漏[DecimalError]
        for (let [lb, s, n] of VALID_STR) {
            it(`should compare numeric string ${lb} as number ${n}`, function() {
                for (let opt of [{}, { withPreciseNum: true }, { withPreciseNum: false }]) {
                    assert.strict.deepStrictEqual(judge(s, '===', n, opt), true)
                    assert.strict.deepStrictEqual(judge(n, '===', s, opt), true)
                    assert.strict.deepStrictEqual(judge(s, '!==', n, opt), false)
                    assert.strict.deepStrictEqual(judge(s, '>=', n, opt), true)
                    assert.strict.deepStrictEqual(judge(s, '<=', n, opt), true)
                    assert.strict.deepStrictEqual(judge(s, '>', n, opt), false)
                    assert.strict.deepStrictEqual(judge(s, '<', n, opt), false)
                    assert.strict.deepStrictEqual(judge(s, '<', n + 1, opt), true)
                    assert.strict.deepStrictEqual(judge(s, '>', n - 1, opt), true)
                }
            })
        }

        //對應§7.1/R-WRAPPER-01規則4: 包裝物件不解包, 屬無效輸入throw(修前為true)
        it(`should throw when input wrapper objects (isenum does not unwrap)`, function() {
            assert.throws(() => judge(new Number(1.5), '===', 1.5), isErr('x1 is not a number')) // eslint-disable-line no-new-wrappers
            assert.throws(() => judge(1.5, '===', new String('1.5')), isErr('x2 is not a number')) // eslint-disable-line no-new-wrappers
        })

        //對應修前: judge(Infinity,'>',1)為true、judge('0x10','>',1)為true; 現throw
        it(`should no longer treat Infinity and '0x10' as numbers`, function() {
            assert.throws(() => judge(Infinity, '>', 1, { withPreciseNum: false }), isErr('x1 is not a number'))
            assert.throws(() => judge('0x10', '>', 1), isErr('x1 is not a number'))
        })

    })

    describe(`preciseNum`, function() {

        //對應§7.2: 非有效數字throw('v is not a number'), 含returnDigit
        for (let [lb, v] of INVALID) {
            it(`should throw v is not a number when v is ${lb}`, function() {
                assert.throws(() => preciseNum(v), isErr('v is not a number'))
                assert.throws(() => preciseNum(v, { returnDigit: true }), isErr('v is not a number'))
            })
        }

        //對應K4: 數字字串去頭尾空白, 回傳值不含空白且數值同取值(整數路徑回傳去空白後原字串)
        for (let [lb, s, n] of VALID_STR) {
            it(`should return a trimmed string of the value ${n} when v is ${lb}`, function() {
                let r = preciseNum(s)
                assert.strict.deepStrictEqual(typeof r, 'string')
                assert.strict.deepStrictEqual(r, r.trim())
                assert.strict.deepStrictEqual(Number(r), n)
                assert.strict.deepStrictEqual(typeof preciseNum(s, { returnDigit: true }), 'number')
            })
        }

        it(`should return trimmed '30' for padded integer string`, function() {
            assert.strict.deepStrictEqual(preciseNum(' 30 '), '30')
            assert.strict.deepStrictEqual(preciseNum('\t30\n'), '30')
            assert.strict.deepStrictEqual(preciseNum(' 30 ', { returnDigit: true }), 0)
        })

        //對應R-WRAPPER-01規則4: 包裝物件throw(修前放行為'1.5')
        it(`should throw when input wrapper objects`, function() {
            assert.throws(() => preciseNum(new Number(1.5)), isErr('v is not a number')) // eslint-disable-line no-new-wrappers
            assert.throws(() => preciseNum(new String('1.5')), isErr('v is not a number')) // eslint-disable-line no-new-wrappers
            assert.throws(() => preciseNum(Object('1.5')), isErr('v is not a number'))
        })

    })

    describe(`estimateTicks`, function() {

        //對應§7.2: rmin、rmax非有效數字throw(訊息不改), rmin先於rmax
        for (let [lb, v] of INVALID) {
            it(`should throw rmin is not a number when rmin is ${lb}`, function() {
                assert.throws(() => estimateTicks(v, 5), isErr('rmin is not a number'))
            })
            it(`should throw rmax is not a number when rmax is ${lb}`, function() {
                assert.throws(() => estimateTicks(0, v), isErr('rmax is not a number'))
            })
        }

        it(`should report rmin first when both are invalid`, function() {
            assert.throws(() => estimateTicks(Infinity, '0x10'), isErr('rmin is not a number'))
        })

        //對應K4: 數字字串(含頭尾空白、科學記號)同數值結果
        it(`should return same result when rmin and rmax are numeric strings`, function() {
            assert.strict.deepStrictEqual(estimateTicks(' 0 ', ' 10 '), estimateTicks(0, 10))
            assert.strict.deepStrictEqual(estimateTicks('1e0', '1E+1'), estimateTicks(1, 10))
            assert.strict.deepStrictEqual(estimateTicks('+.5', '2.5e0'), estimateTicks(0.5, 2.5))
            assert.strict.deepStrictEqual(estimateTicks(' 5 ', '5'), estimateTicks(5, 5))
            for (let [, s, n] of VALID_STR) {
                assert.strict.deepStrictEqual(estimateTicks(s, n + 100), estimateTicks(n, n + 100))
                assert.strict.deepStrictEqual(estimateTicks(n - 100, s), estimateTicks(n - 100, n))
            }
        })

        //對應修前: rmax='0x10'得tickPositions [0, 8, 16]; 現throw
        it(`should no longer accept '0x10' and wrapper objects`, function() {
            assert.throws(() => estimateTicks(0, '0x10'), isErr('rmax is not a number'))
            assert.throws(() => estimateTicks(0, new Number(30)), isErr('rmax is not a number')) // eslint-disable-line no-new-wrappers
        })

        //對應§11: round之idig改為0~100(digits), rmin等於rmax時刻度間距之小數位數在100以內者結果不變
        it(`should keep the equal-range result when tick decimals do not exceed 100`, function() {
            assert.strict.deepStrictEqual(estimateTicks(123456, 123456), { tickNum: 3, tickInterval: 12345.6, tickPositions: [111110.4, 123456, 135801.6], tickDig: 1 })
            let r = estimateTicks(1e-85, 1e-85)
            assert.strict.deepStrictEqual(r.tickInterval, 1e-86)
            assert.strict.deepStrictEqual(r.tickDig, 86)
        })

    })

    describe(`color`, function() {

        //對應§3.1: 顏色字串與物件欄位中之數值寫法不收十六進位(修前rgba(0x10,...)得rgba(16, ...))
        let badColors = [
            'rgba(0x10,20,30,0.5)',
            'rgba(10,20,30,0x1)',
            'rgb(0x10%, 12%, 8%)',
            'hsla(0x10,50%,50%,0.5)',
            'rgba(Infinity,20,30,0.5)',
            'rgba(1e400,20,30,0.5)',
            { r: '0x10', g: 20, b: 30, a: 0.5 },
            { h: 120, s: '0x1', l: 0.5, a: 1 },
            { r: Infinity, g: 20, b: 30, a: 0.5 },
            { r: '1e400', g: 20, b: 30, a: 0.5 },
        ]
        for (let c of badColors) {
            it(`should throw when color is ${JSON.stringify(c)}`, function() {
                assert.throws(() => color.toRgbaString(c), (err) => {
                    assert.strict.deepStrictEqual(err instanceof Error, true)
                    return true
                })
            })
        }

        //對應K4: 有效數值寫法(含頭尾空白之物件欄位字串)仍可用且同數值
        it(`should still parse valid numeric values`, function() {
            assert.strict.deepStrictEqual(color.toRgbaString('rgba(16,20,30,0.5)'), 'rgba(16, 20, 30, 0.5)')
            assert.strict.deepStrictEqual(color.toRgbaString({ r: ' 10 ', g: 20, b: '30', a: 0.5 }), 'rgba(10, 20, 30, 0.5)')
            assert.strict.deepStrictEqual(color.toRgbaString({ r: '1e1', g: 20, b: 30, a: '5e-1' }), 'rgba(10, 20, 30, 0.5)')
            assert.strict.deepStrictEqual(color.toRgbaString('#fff'), 'rgba(255, 255, 255, 1)')
            assert.strict.deepStrictEqual(color.toRgbaString('rgb(50%, 12%, 8%)'), 'rgba(128, 31, 20, 1)')
        })

        //對應§7.1: 整數個數num由isint改iseint; 無效回'num is not an integer'(訊息不改), 且Infinity類不再使迴圈不結束(修前記憶體耗盡、離開碼134)
        for (let fn of ['spreadHue', 'spreadMonochromatic']) {

            for (let key of ['inf', 'ninf', 'infstr', 'e400', 'hex', 'wrapper']) {
                it(`should throw num is not an integer in a child process when ${fn} num is ${key}`, function() {
                    let { r } = runChildCase(spreadRunner, `${fn}/${key}`, { execArgv: ['--max-old-space-size=64'], timeout: 20000, allowNoResult: true })
                    assert.strict.deepStrictEqual(r, { ok: false, msg: 'num is not an integer' })
                })
            }

            it(`should accept ${fn} num as number or numeric string in a child process`, function() {
                for (let key of ['three', 'threestr']) {
                    let { r } = runChildCase(spreadRunner, `${fn}/${key}`, { execArgv: ['--max-old-space-size=64'], timeout: 20000, allowNoResult: true })
                    assert.strict.deepStrictEqual(r, { ok: true, len: 3 })
                }
            })

            //行程內(無Infinity類輸入): 非整數、非數字仍throw、數字字串同數值
            it(`should keep ${fn} in-process checks (non-integer, non-number) and numeric string equal to number`, function() {
                for (let bad of [0.5, -1.5, 'abc', '', null, undefined, true, NaN, [3], {}, 3n, '1.5']) {
                    assert.throws(() => color[fn]('#336699', bad), isErr('num is not an integer'))
                }
                assert.strict.deepStrictEqual(color[fn]('#336699', ' 4 '), color[fn]('#336699', 4))
                assert.strict.deepStrictEqual(color[fn]('#336699', '4e0'), color[fn]('#336699', 4))
                assert.strict.deepStrictEqual(color[fn]('#336699', 1).length, 1)
                assert.strict.deepStrictEqual(color[fn]('#336699', 0).length, 1)
                assert.strict.deepStrictEqual(color[fn]('#336699', -3).length, 1)
            })

        }

        it(`should treat every isnum-only number as invalid for color num (INVALID_BUT_ISNUM)`, function() {
            for (let [, v] of INVALID_BUT_ISNUM) {
                if (typeof v === 'number' || v === 'Infinity' || v === '-Infinity' || v === '1e400' || v === '-1e400') {
                    continue //Infinity類另於子行程驗(修前會使迴圈不結束)
                }
                assert.throws(() => color.spreadHue('#336699', v), isErr('num is not an integer'))
                assert.throws(() => color.spreadMonochromatic('#336699', v), isErr('num is not an integer'))
            }
        })

    })

})
