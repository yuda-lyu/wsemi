import fs from 'fs'
import assert from 'assert'
import fsCreateFolder from '../src/fsCreateFolder.mjs'
import fsDeleteFolder from '../src/fsDeleteFolder.mjs'
import getDataFromExcelFileU8Arr from '../src/getDataFromExcelFileU8Arr.mjs'
import downloadExcelFileFromDataDyn from '../src/downloadExcelFileFromDataDyn.mjs'


//Dyn版為相容舊版之保留函數, 內部委派downloadExcelFileFromData, 差異僅在錯誤時reject(非resolve回傳{error})
//瀏覽器端下載路徑需於瀏覽器測試, 此處測試Node.js端寫檔路徑
describe(`downloadExcelFileFromDataDyn`, function() {

    let fdt = './_test_downloadExcelFileFromDataDyn'

    before(function() {
        fsCreateFolder(fdt)
    })

    after(function() {
        fsDeleteFolder(fdt)
    })

    it(`should write an xlsx file in nodejs and roundtrip data`, async function() {
        let fp = `${fdt}/temp.xlsx`
        await downloadExcelFileFromDataDyn(fp, 'data', [['x'], ['1']])
        assert.strict.deepStrictEqual(fs.existsSync(fp), true)
        let u8a = fs.readFileSync(fp)
        let r = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })
        assert.strict.deepStrictEqual(r[0].data, [['x'], ['1']])
    })

    it(`should reject with error message (not resolve {error}) when data is invalid`, async function() {
        let err = null
        try {
            await downloadExcelFileFromDataDyn(`${fdt}/x.xlsx`, 'data', 'not-valid')
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err, 'data is not an array')
    })

})
