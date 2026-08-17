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

})
