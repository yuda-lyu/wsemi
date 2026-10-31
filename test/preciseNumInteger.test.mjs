import assert from 'assert'
import preciseNum from '../src/preciseNum.mjs'
import judge from '../src/judge.mjs'


//排程第221項第二批 E: preciseNum整數路徑修正(dspec §11 第16項, 使用者2026-10-31: 「preciseNum 的整數判斷缺陷, 依你的a,b」)
//  以原文(字串)或數值本身判整數(decimal.js isInteger), 整數保留全部位數並正規化, 非整數取12位有效數字
//  A 真修正: 轉換後為整數之近整數字串('0.99999999999999999999'、'1.0000000000000001')得'1', judge(…, '===', 1)由false變true
//  B 只正規化輸出字串: '+5.'→'5'、'007'→'7'、'1e1'→'10'、'12.000'→'12'、'-0'→'0'、1e21→'1000000000000000000000'
//  C 不變: '123456789012345'、'9007199254740993'原樣, 非整數同現行
//  對照腳本與期望值: 主控任務夾 preciseNumFix.mjs 之輸出表
describe(`preciseNum 整數路徑(第221項第二批 第16項)`, function() {

    //[輸入, 期望字串, 期望小數位數]
    let ROWS = [
        //A
        ['0.99999999999999999999', '1', 0],
        ['1.0000000000000001', '1', 0],
        ['0.9999999999999', '1', 0],
        ['1.0000000000004', '1', 0],
        ['-0.99999999999999999999', '-1', 0],
        //B
        ['+5.', '5', 0],
        ['007', '7', 0],
        ['1e1', '10', 0],
        ['1.5e1', '15', 0],
        ['1.5e3', '1500', 0],
        ['12.000', '12', 0],
        [' 12 ', '12', 0],
        ['-0', '0', 0],
        [-0, '0', 0],
        ['-0.000', '0', 0],
        ['0.0', '0', 0],
        ['1e21', '1000000000000000000000', 0],
        [1e21, '1000000000000000000000', 0],
        [-1e21, '-1000000000000000000000', 0],
        [123456789012345680, '123456789012345680', 0],
        //C
        ['9007199254740993', '9007199254740993', 0],
        [9007199254740993, '9007199254740992', 0], // eslint-disable-line no-loss-of-precision -- 數字字面值解析時已失精度, 無從還原
        ['123456789012345', '123456789012345', 0],
        ['-123456789012345678901234567890', '-123456789012345678901234567890', 0],
        ['123456789012345.6', '123456789012000', 0],
        ['2.50', '2.5', 1],
        [0.1 + 0.2, '0.3', 1],
        [1e-11, '0.00000000001', 11],
        ['1.23e-7', '0.000000123', 9],
        ['-1.5', '-1.5', 1],
        [5, '5', 0],
        [0, '0', 0],
    ]

    for (let [v, s, d] of ROWS) {
        let lb = typeof v === 'string' ? `'${v}'` : Object.is(v, -0) ? '-0' : String(v)
        it(`should return '${s}' with ${d} decimal places when input ${lb}`, function() {
            assert.strict.deepStrictEqual(preciseNum(v), s)
            assert.strict.deepStrictEqual(preciseNum(v, { returnDigit: true }), d)
            //輸出為字串, 不含指數記號
            assert.strict.deepStrictEqual(typeof preciseNum(v), 'string')
            assert.strict.deepStrictEqual(/e/i.test(preciseNum(v)), false)
        })
    }

    //A: judge由false變true(第13位起才不同視為相等, 與JSDoc一致)
    it(`should make judge treat '0.99999999999999999999' and '1.0000000000000001' as equal to 1`, function() {
        assert.strict.deepStrictEqual(judge('0.99999999999999999999', '===', 1), true)
        assert.strict.deepStrictEqual(judge('1.0000000000000001', '===', 1), true)
        assert.strict.deepStrictEqual(judge(1, '===', '0.99999999999999999999'), true)
        assert.strict.deepStrictEqual(judge('0.99999999999999999999', '>', 1), false)
        assert.strict.deepStrictEqual(judge('1.0000000000000001', '<', 1), false)
        assert.strict.deepStrictEqual(judge('1.0000000000000001', '!==', 1), false)
    })

    //B: judge結果不變
    it(`should keep judge results for normalized integer strings`, function() {
        assert.strict.deepStrictEqual(judge('+5.', '===', 5), true)
        assert.strict.deepStrictEqual(judge('007', '===', 7), true)
        assert.strict.deepStrictEqual(judge('1e1', '===', 10), true)
        assert.strict.deepStrictEqual(judge('12.000', '===', 12), true)
        assert.strict.deepStrictEqual(judge('-0', '===', 0), true)
        assert.strict.deepStrictEqual(judge(1e21, '===', '1000000000000000000000'), true)
    })

    //C: 整數保留全部位數, 相差1的大整數仍可區分(不經12位有效數字)
    it(`should keep every digit of integers so that adjacent big integers differ`, function() {
        assert.strict.deepStrictEqual(judge('123456789012345', '===', '123456789012346'), false)
        assert.strict.deepStrictEqual(judge('123456789012345', '<', '123456789012346'), true)
        assert.strict.deepStrictEqual(judge('9007199254740993', '===', '9007199254740992'), false)
    })

    //非整數仍取12位有效數字(第13位起才不同者視為相等)
    it(`should still round non-integers to 12 significant digits`, function() {
        assert.strict.deepStrictEqual(judge(1 + 1e-12, '===', 1), true)
        assert.strict.deepStrictEqual(judge(1 + 1e-11, '===', 1), false)
        assert.strict.deepStrictEqual(preciseNum('0.1234567890123456789'), '0.123456789012')
    })

    //無效輸入仍throw(第一批), 不受整數路徑改動影響
    it(`should still throw for non valid numbers`, function() {
        for (let v of [Infinity, '0x10', '1e400', '-', '', null, undefined, true, new Number(1)]) { // eslint-disable-line no-new-wrappers
            assert.throws(() => preciseNum(v), { message: 'v is not a number' })
        }
    })

})
