import assert from 'assert'
import getExcelU8ArrFromData from '../src/getExcelU8ArrFromData.mjs'
import getDataFromExcelFileU8Arr from '../src/getDataFromExcelFileU8Arr.mjs'


//本檔測試一律以await呼叫: 對同步實作與async實作皆可通過, 供Excel引擎抽換時作為行為合約
describe(`getExcelU8ArrFromData`, function() {

    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]

    it(`should return an u8a(Uint8Array) with valid xlsx(zip) magic number`, async function() {
        let u8a = await getExcelU8ArrFromData(data)
        assert.strict.deepStrictEqual(u8a instanceof Uint8Array, true)
        //xlsx為zip容器, 開頭必為'PK'(0x50,0x4B)
        assert.strict.deepStrictEqual([u8a[0], u8a[1]], [0x50, 0x4B])
    })

    it(`should roundtrip mat data with fmt='array' (string kept, number kept, blank filled with '')`, async function() {
        let u8a = await getExcelU8ArrFromData(data, 'data')
        let r1 = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })
        assert.strict.deepStrictEqual(r1[0].sheetname, 'data')
        assert.strict.deepStrictEqual(r1[0].data, [['a', '123', '456', ''], ['', 'abc123', '', '111.222333']])
        let r2 = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array', valueToString: false })
        //valueToString=false時數字保持數字, 字串'123'保持字串(不可被自動轉數字)
        assert.strict.deepStrictEqual(r2[0].data, [['a', '123', 456, ''], ['', 'abc123', '', 111.222333]])
    })

    it(`should roundtrip ltdt data with fmt='ltdt' and custom sheetName`, async function() {
        let ltdt = [{ x: 'a', y: '123', z: 456 }, { x: 'b', y: 'abc', z: 789 }]
        let u8a = await getExcelU8ArrFromData(ltdt, 'mysheet')
        let r = await getDataFromExcelFileU8Arr(u8a, { fmt: 'ltdt' })
        assert.strict.deepStrictEqual(r[0].sheetname, 'mysheet')
        assert.strict.deepStrictEqual(r[0].data, [{ x: 'a', y: '123', z: '456' }, { x: 'b', y: 'abc', z: '789' }])
    })

    it(`should roundtrip chinese content, chinese sheetName, long-integer string and special chars`, async function() {
        let mat = [['名稱', '編號', '備註'], ['測試中文', '90071992547409934567', 'a"b,c']]
        let u8a = await getExcelU8ArrFromData(mat, '中文分頁')
        let r = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })
        assert.strict.deepStrictEqual(r[0].sheetname, '中文分頁')
        //長整數字串須原樣返回, 不可失去精度或被科學記號化
        assert.strict.deepStrictEqual(r[0].data, [['名稱', '編號', '備註'], ['測試中文', '90071992547409934567', 'a"b,c']])
    })

    it(`should roundtrip boolean cells`, async function() {
        let mat = [['k', 'v'], ['t', true], ['f', false]]
        let u8a = await getExcelU8ArrFromData(mat)
        let r1 = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })
        assert.strict.deepStrictEqual(r1[0].data, [['k', 'v'], ['t', 'true'], ['f', 'false']])
        let r2 = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array', valueToString: false })
        assert.strict.deepStrictEqual(r2[0].data, [['k', 'v'], ['t', true], ['f', false]])
    })

    it(`should roundtrip with fmt='csv'`, async function() {
        let u8a = await getExcelU8ArrFromData([['x', 'y'], ['1', '中文']])
        let r = await getDataFromExcelFileU8Arr(u8a, { fmt: 'csv' })
        assert.strict.deepStrictEqual(r[0].data, `"x","y"\r\n"1","中文"\r\n`)
    })

    it(`should return error object when data is not an effective array`, async function() {
        for (let v of ['str', 123, null, undefined, {}, []]) {
            let r = await getExcelU8ArrFromData(v)
            assert.strict.deepStrictEqual(r.error, 'no data')
        }
    })

    it(`should fallback sheetName to 'data' when sheetName is invalid`, async function() {
        let u8a = await getExcelU8ArrFromData([['a']], 123)
        let r = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })
        assert.strict.deepStrictEqual(r[0].sheetname, 'data')
    })

})
