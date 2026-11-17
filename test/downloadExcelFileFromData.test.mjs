import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import getDataFromExcelFileU8Arr from '../src/getDataFromExcelFileU8Arr.mjs'
import downloadExcelFileFromData from '../src/downloadExcelFileFromData.mjs'


//本檔測試一律以await呼叫: 對同步實作與async實作皆可通過, 供Excel引擎抽換時作為行為合約
//瀏覽器端下載路徑需於瀏覽器測試, 此處測試Node.js端寫檔路徑
describe(`downloadExcelFileFromData`, function() {

    let fdt = './_test_downloadExcelFileFromData'

    before(function() {
        fsCreateFolder(fdt)
    })

    after(function() {
        fsDeleteFolder(fdt)
    })

    it(`should write an xlsx file in nodejs and roundtrip mat data`, async function() {
        let fp = `${fdt}/temp-mat.xlsx`
        let data = [['x', 'y'], ['a', '123'], ['b', 456]]
        await downloadExcelFileFromData(fp, 'mysheet', data)
        assert.strict.deepStrictEqual(fs.existsSync(fp), true)
        let u8a = fs.readFileSync(fp)
        let r = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })
        assert.strict.deepStrictEqual(r[0].sheetname, 'mysheet')
        assert.strict.deepStrictEqual(r[0].data, [['x', 'y'], ['a', '123'], ['b', '456']])
    })

    it(`should write an xlsx file in nodejs and roundtrip ltdt data`, async function() {
        let fp = `${fdt}/temp-ltdt.xlsx`
        let ltdt = [{ x: 'a', y: '中文' }, { x: 'b', y: 'abc' }]
        await downloadExcelFileFromData(fp, 'data', ltdt)
        let u8a = fs.readFileSync(fp)
        let r = await getDataFromExcelFileU8Arr(u8a, { fmt: 'ltdt' })
        assert.strict.deepStrictEqual(r[0].data, [{ x: 'a', y: '中文' }, { x: 'b', y: 'abc' }])
    })

    it(`should return error object when fileName is invalid`, async function() {
        let r = await downloadExcelFileFromData('', 'data', [['a']])
        assert.strict.deepStrictEqual(typeof r.error === 'string', true)
    })

    it(`should return error object when data is invalid`, async function() {
        let r = await downloadExcelFileFromData(`${fdt}/x.xlsx`, 'data', 'not-valid')
        assert.strict.deepStrictEqual(typeof r.error === 'string', true)
    })

    //ws492e: N-A(主控定): 失敗走{ error }通道(Excel類既有通道, 2026-11-02定維持現行回傳), error為V19固定字串, 不回顯輸入值(V20; 原console.log帶出fileName與整份data); 含NUL之檔名與寫檔失敗原以Node原生錯誤reject而回顯路徑, 改為{ error }
    //  規格: dspec〈輸入參數之檢測機制〉V19、V20、R-FS-INVALID-PATH-01(含NUL之路徑為無效)、W-23(原生錯誤固定詞彙加錯誤碼)
    let quiet = async (fn) => {
        let logs = []
        let raw = console.log
        console.log = (...a) => {
            logs.push(a.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join(' '))
        }
        try {
            return { r: await fn(), logs }
        }
        finally {
            console.log = raw
        }
    }

    for (let [label, v] of [['undefined', undefined], ['null', null], [`''`, ''], ['5', 5], ['true', true], ['{}', {}], ['[]', []]]) {
        it(`should resolve the fixed invalid fileName error and not log the value when fileName is ${label}`, async function() {
            let { r, logs } = await quiet(() => downloadExcelFileFromData(v, 'data', [['a']]))
            assert.strict.deepStrictEqual(r, { error: 'invalid fileName: must be a non-empty string' })
            assert.strict.deepStrictEqual(logs, [])
        })
    }

    it(`should resolve the fixed NUL error for a fileName containing a NUL character, writing nothing`, async function() {
        let fp = `${fdt}/a\u0000b.xlsx`
        let { r, logs } = await quiet(() => downloadExcelFileFromData(fp, 'data', [['a']]))
        assert.strict.deepStrictEqual(r, { error: 'invalid fileName: must not contain a NUL character' })
        assert.strict.deepStrictEqual(logs, [])
        assert.strict.deepStrictEqual(fs.readdirSync(fdt).some((n) => n.startsWith('a')), false)
    })

    for (let [label, v] of [['undefined', undefined], ['null', null], [`'not-valid'`, 'not-valid'], ['5', 5], ['{}', {}]]) {
        it(`should resolve the fixed invalid data error and not log the data when data is ${label}`, async function() {
            let { r, logs } = await quiet(() => downloadExcelFileFromData(`${fdt}/x.xlsx`, 'data', v))
            assert.strict.deepStrictEqual(r, { error: 'invalid data: must be an array' })
            assert.strict.deepStrictEqual(logs, [])
        })
    }

    it(`should check fileName before data and not echo the input values`, async function() {
        let { r } = await quiet(() => downloadExcelFileFromData('', 'data', 'SECRET-data-9f3a'))
        assert.strict.deepStrictEqual(r, { error: 'invalid fileName: must be a non-empty string' })
        let { r: r2, logs } = await quiet(() => downloadExcelFileFromData(`${fdt}/x.xlsx`, 'data', { s: 'SECRET-data-9f3a' }))
        assert.strict.deepStrictEqual(String(r2.error).includes('SECRET'), false)
        assert.strict.deepStrictEqual(logs.some((s) => s.includes('SECRET')), false)
    })

    //spec: 寫檔失敗(如上層資料夾不存在)resolve { error }, 為固定詞彙加錯誤碼, 不含路徑, 不reject
    it(`should resolve an error object with a fixed message and the error code, without the path, when writing fails`, async function() {
        let fp = `${fdt}/no-such-folder-SECRETDIR-9f3a/x.xlsx`
        let { r } = await quiet(() => downloadExcelFileFromData(fp, 'data', [['a']]))
        assert.strict.deepStrictEqual(r, { error: 'operation failed (code ENOENT)' })
        assert.strict.deepStrictEqual(r.error.includes('SECRETDIR'), false)
    })

    //spec: 成功時回傳undefined(既有行為不變)
    it(`should resolve undefined when the file is written`, async function() {
        let fp = `${fdt}/ok.xlsx`
        let r = await downloadExcelFileFromData(fp, 'data', [['a', 'b'], [1, 2]])
        assert.strict.deepStrictEqual(r, undefined)
        assert.strict.deepStrictEqual(fs.existsSync(fp), true)
    })

})
