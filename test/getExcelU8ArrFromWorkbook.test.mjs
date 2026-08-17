import assert from 'assert'
import createExcelWorkbook from '../src/createExcelWorkbook.mjs'
import addExcelWorksheetFromData from '../src/addExcelWorksheetFromData.mjs'
import getExcelWorkbookFromData from '../src/getExcelWorkbookFromData.mjs'
import getExcelU8ArrFromWorkbook from '../src/getExcelU8ArrFromWorkbook.mjs'
import getDataFromExcelFileU8Arr from '../src/getDataFromExcelFileU8Arr.mjs'


//本檔測試一律以await呼叫: 對同步實作與async實作皆可通過, 供Excel引擎抽換時作為行為合約
describe(`getExcelU8ArrFromWorkbook`, function() {

    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]

    it(`should return an u8a(Uint8Array) with valid xlsx(zip) magic number`, async function() {
        let wb = getExcelWorkbookFromData(data)
        let u8a = await getExcelU8ArrFromWorkbook(wb)
        assert.strict.deepStrictEqual(u8a instanceof Uint8Array, true)
        //xlsx為zip容器, 開頭必為'PK'(0x50,0x4B)
        assert.strict.deepStrictEqual([u8a[0], u8a[1]], [0x50, 0x4B])
    })

    it(`should roundtrip a workbook built from getExcelWorkbookFromData`, async function() {
        let wb = getExcelWorkbookFromData(data, 'tester')
        let u8a = await getExcelU8ArrFromWorkbook(wb)
        let r = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })
        assert.strict.deepStrictEqual(r[0].sheetname, 'tester')
        assert.strict.deepStrictEqual(r[0].data, [['a', '123', '456', ''], ['', 'abc123', '', '111.222333']])
    })

    it(`should roundtrip a multi-sheet workbook built from addExcelWorksheetFromData`, async function() {
        let wb = createExcelWorkbook()
        addExcelWorksheetFromData(wb, [['a1']], 's1')
        addExcelWorksheetFromData(wb, [['b1'], ['b2']], 's2')
        let u8a = await getExcelU8ArrFromWorkbook(wb)
        let r = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })
        assert.strict.deepStrictEqual(r.length, 2)
        assert.strict.deepStrictEqual(r[0].sheetname, 's1')
        assert.strict.deepStrictEqual(r[0].data, [['a1']])
        assert.strict.deepStrictEqual(r[1].sheetname, 's2')
        assert.strict.deepStrictEqual(r[1].data, [['b1'], ['b2']])
    })

    it(`should return error object when wb is not an effective workbook`, async function() {
        for (let v of [null, undefined, 123, 'abc', {}]) {
            let r = await getExcelU8ArrFromWorkbook(v)
            assert.strict.deepStrictEqual(typeof r.error === 'string', true)
        }
    })

})
