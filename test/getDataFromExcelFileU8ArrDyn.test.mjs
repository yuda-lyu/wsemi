import assert from 'assert'
import getExcelU8ArrFromData from '../src/getExcelU8ArrFromData.mjs'
import getDataFromExcelFileU8ArrDyn from '../src/getDataFromExcelFileU8ArrDyn.mjs'


//Dyn版為相容舊版之保留函數, 內部委派getDataFromExcelFileU8Arr, 差異僅在錯誤時reject(非resolve回傳{error})
describe(`getDataFromExcelFileU8ArrDyn`, function() {

    it(`should resolve data array like getDataFromExcelFileU8Arr`, async function() {
        let u8a = await getExcelU8ArrFromData([['x', 'y'], ['a', '123']], 'mysheet')
        let r = await getDataFromExcelFileU8ArrDyn(u8a, { fmt: 'array' })
        assert.strict.deepStrictEqual(r[0].sheetname, 'mysheet')
        assert.strict.deepStrictEqual(r[0].data, [['x', 'y'], ['a', '123']])
    })

    it(`should ignore legacy pathItems argument`, async function() {
        let u8a = await getExcelU8ArrFromData([['a']])
        let r = await getDataFromExcelFileU8ArrDyn(u8a, { fmt: 'array' }, ['https://legacy-cdn/xlsx.js'])
        assert.strict.deepStrictEqual(r[0].data, [['a']])
    })

    it(`should reject with error message (not resolve {error}) when u8a is invalid`, async function() {
        let err = null
        try {
            await getDataFromExcelFileU8ArrDyn(new Uint8Array([1, 2, 3]), { fmt: 'array' })
        }
        catch (e) {
            err = e
        }
        assert.strict.deepStrictEqual(err, 'can not read data from u8a')
    })

})
