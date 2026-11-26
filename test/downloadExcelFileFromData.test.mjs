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

    //排程第610項⑤(twsm1): 寫成Excel位元組失敗(寫檔器拒絕, 如分頁名含Excel禁用字元)時, 原自行console.log錯誤本體(含堆疊與分頁名), 使用端關不掉;
    //  改經getDiag(opt)之出口(R-DIAG-01): 預設只console.log固定詞彙label與安全摘要, opt.logDetail為true才輸出遮罩後之細節, opt.funLog為函數時只交給它; 回傳值({ error })不變
    let captureAll = async (fn) => {
        let rec = { log: [], warn: [], error: [] }
        let raw = { log: console.log, warn: console.warn, error: console.error }
        for (let k of Object.keys(rec)) {
            console[k] = (...a) => rec[k].push(a)
        }
        try {
            return { r: await fn(), rec }
        }
        finally {
            for (let k of Object.keys(rec)) {
                console[k] = raw[k]
            }
        }
    }
    let LABEL = '[wsemi downloadExcelFileFromData] can not convert workbook to Excel'

    it(`should log only the fixed label and the safe summary (no error body, stack or sheet name) by default when the writer fails`, async function() {
        let { r, rec } = await captureAll(() => downloadExcelFileFromData(`${fdt}/w1.xlsx`, 'SHEETSECRET/9f3a', [['a']]))
        assert.strict.deepStrictEqual(r, { error: 'can not convert data to Excel' }) //第559項④: 回傳值為固定字串(原回傳寫檔器之Error, 其訊息帶出分頁名稱'SHEETSECRET/9f3a')
        assert.strict.deepStrictEqual(JSON.stringify(r).includes('SHEETSECRET'), false)
        assert.strict.deepStrictEqual(rec.log, [[LABEL, { errType: 'Error' }]])
        assert.strict.deepStrictEqual([rec.warn.length, rec.error.length], [0, 0])
        assert.strict.deepStrictEqual(fs.existsSync(`${fdt}/w1.xlsx`), false)
    })

    it(`should hand the diagnosis only to opt.funLog (nothing on console) so the caller can silence or redirect it`, async function() {
        let calls = []
        let { rec } = await captureAll(() => downloadExcelFileFromData(`${fdt}/w2.xlsx`, 'a/b', [['a']], { funLog: (label, safe, detail) => calls.push([label, safe, detail]) }))
        assert.strict.deepStrictEqual([rec.log.length, rec.warn.length, rec.error.length], [0, 0, 0])
        assert.strict.deepStrictEqual(calls.length, 1)
        assert.strict.deepStrictEqual([calls[0][0], calls[0][1]], [LABEL, { errType: 'Error' }])
        assert.strict.deepStrictEqual(calls[0][2] instanceof Error, true) //細節為遮罩後之拷貝(非原物件)
        let silent = await captureAll(() => downloadExcelFileFromData(`${fdt}/w3.xlsx`, 'a/b', [['a']], { funLog: () => {} }))
        assert.strict.deepStrictEqual([silent.rec.log.length, silent.rec.warn.length, silent.rec.error.length], [0, 0, 0])
    })

    it(`should log the masked detail with opt.logDetail true, and treat non-true logDetail and non-function funLog as not given`, async function() {
        let { rec } = await captureAll(() => downloadExcelFileFromData(`${fdt}/w4.xlsx`, 'a/b', [['a']], { logDetail: true }))
        assert.strict.deepStrictEqual(rec.log.length, 1)
        assert.strict.deepStrictEqual(rec.log[0][0], LABEL)
        assert.strict.deepStrictEqual(rec.log[0][1] instanceof Error && rec.log[0][1].message.includes('a/b'), true)
        for (let o of [{ logDetail: 'true' }, { funLog: 'x' }, null, 5]) {
            let x = await captureAll(() => downloadExcelFileFromData(`${fdt}/w5.xlsx`, 'a/b', [['a']], o))
            assert.strict.deepStrictEqual(x.rec.log, [[LABEL, { errType: 'Error' }]], JSON.stringify(o))
        }
    })

})
