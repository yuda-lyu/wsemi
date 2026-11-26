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
            assert.strict.deepStrictEqual(r.error, 'invalid wb: must be a non-empty object')
        }
    })

    //第559項④(V20): 寫檔器拒絕(分頁名含Excel禁用字元、超過31字元、保留名等)時原回傳寫檔器之Error, 其訊息帶出分頁名稱; 改為固定字串, 細節經opt之診斷出口(預設靜默)
    let badNames = ['a:b-SECRET559', 'SECRET559'.repeat(5), '[x]SECRET559', '\'SECRET559\'', 'History']
    for (let n of badNames) {
        it(`should return the fixed error string without the sheet name when the writer rejects the name (${n.length} chars)`, async function() {
            let wb = getExcelWorkbookFromData(data, n)
            let r = await getExcelU8ArrFromWorkbook(wb)
            assert.strict.deepStrictEqual(r, { error: 'can not convert wb to Excel' })
            assert.strict.deepStrictEqual(JSON.stringify(r).includes('SECRET559'), false)
        })
    }

    it(`should stay silent by default and hand the diagnosis only to opt.funLog (masked detail with opt.logDetail)`, async function() {
        let wb = getExcelWorkbookFromData(data, 'a:b-SECRET559')
        let rec = { log: [], warn: [], error: [] }
        let raw = { log: console.log, warn: console.warn, error: console.error }
        for (let k of Object.keys(rec)) {
            console[k] = (...a) => rec[k].push(a)
        }
        let calls = []
        let r1
        let r2
        let r3
        try {
            r1 = await getExcelU8ArrFromWorkbook(wb) //預設靜默(同原本)
            r2 = await getExcelU8ArrFromWorkbook(wb, { funLog: (label, safe, detail) => calls.push([label, safe, detail]) })
            r3 = await getExcelU8ArrFromWorkbook(wb, { logDetail: true })
        }
        finally {
            for (let k of Object.keys(rec)) {
                console[k] = raw[k]
            }
        }
        assert.strict.deepStrictEqual([r1, r2, r3], [{ error: 'can not convert wb to Excel' }, { error: 'can not convert wb to Excel' }, { error: 'can not convert wb to Excel' }])
        assert.strict.deepStrictEqual(calls.length, 1)
        assert.strict.deepStrictEqual([calls[0][0], calls[0][1]], ['[wsemi getExcelU8ArrFromWorkbook] can not convert wb to Excel', { errType: 'Error' }])
        assert.strict.deepStrictEqual(calls[0][2] instanceof Error, true) //細節為遮罩後之拷貝
        assert.strict.deepStrictEqual(rec.log.length, 1) //只有logDetail為true之一次(r3)
        assert.strict.deepStrictEqual([rec.warn.length, rec.error.length], [0, 0])
    })

})
