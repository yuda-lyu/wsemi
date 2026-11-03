import assert from 'assert'
import getCsvStrFromData from '../src/getCsvStrFromData.mjs'
import { NON_ARR } from './tools/diffInputKit.mjs'


describe(`getCsvStrFromData`, function() {
    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
        [5, '\r\n', true, 'false'],
    ]
    let cdata = JSON.stringify(data)
    let ccsv = getCsvStrFromData(data)

    it(`should return ${ccsv} when input ${cdata}`, function() {
        let r = getCsvStrFromData(data)
        assert.strict.deepStrictEqual(r, ccsv)
    })

    //第221項第六項(dspec §11第6項, 使用者2026-11-03): 空陣列為合法資料(內容為空), 不是失敗(原回{ error: 'no data' })
    describe(`empty array is valid data (ws286d)`, function() {
        let BOM = String.fromCodePoint(0xfeff) //U+FEFF, 以碼位表示避免檔內出現不可見字元

        it(`should return a string with only the BOM when input [] (bom is on by default)`, function() {
            let r = getCsvStrFromData([])
            assert.strict.deepStrictEqual(r, BOM)
            assert.strict.deepStrictEqual(r.length, 1)
        })

        it(`should return a string with only the BOM when input [], true`, function() {
            assert.strict.deepStrictEqual(getCsvStrFromData([], true), BOM)
        })

        it(`should return '' when input [], false`, function() {
            let r = getCsvStrFromData([], false)
            assert.strict.deepStrictEqual(r, '')
        })

        it(`should return a string (not an error object) when input []`, function() {
            for (let v of [getCsvStrFromData([]), getCsvStrFromData([], false)]) {
                assert.strict.deepStrictEqual(typeof v, 'string')
            }
        })

        it(`should follow the same bom rule as a non-empty array`, function() {
            assert.strict.deepStrictEqual(getCsvStrFromData([[1]]).startsWith(BOM), true)
            assert.strict.deepStrictEqual(getCsvStrFromData([[1]], false).startsWith(BOM), false)
            assert.strict.deepStrictEqual(getCsvStrFromData([[1]], false), '1\r\n')
        })

        //非陣列維持為失敗(不變)
        for (let [lb, v] of NON_ARR) {
            it(`should return { error: 'no data' } when input ${lb} (unchanged)`, function() {
                assert.strict.deepStrictEqual(getCsvStrFromData(v), { error: 'no data' })
                assert.strict.deepStrictEqual(getCsvStrFromData(v, false), { error: 'no data' })
            })
        }

        //不在本輪: 非空而無效之陣列維持為失敗
        it(`should keep non-empty invalid arrays as { error: 'no data' } (unchanged)`, function() {
            for (let v of [[{}], [null], [''], [[]]]) {
                assert.strict.deepStrictEqual(getCsvStrFromData(v), { error: 'no data' })
            }
        })
    })

})
