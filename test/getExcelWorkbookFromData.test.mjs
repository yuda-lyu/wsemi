import assert from 'assert'
import getExcelWorkbookFromData from '../src/getExcelWorkbookFromData.mjs'


describe(`getExcelWorkbookFromData`, function() {
    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]
    let cdata = JSON.stringify(data)

    it(`should return sheet.name='data' when input ${cdata}`, function() {
        let wb = getExcelWorkbookFromData(data)
        let r = wb.sheets[0].name
        assert.strict.deepStrictEqual(r, 'data')
        assert.strict.deepStrictEqual(wb.sheets[0].rows, data)
    })

    it(`should return sheet.name='tester' when input ${cdata}, 'tester'`, function() {
        let wb = getExcelWorkbookFromData(data, 'tester')
        let r = wb.sheets[0].name
        assert.strict.deepStrictEqual(r, 'tester')
    })

    it(`should return error object when data is not an array (element not supported anymore)`, function() {
        for (let v of [null, undefined, 123, 'abc', {}]) {
            let r = getExcelWorkbookFromData(v)
            assert.strict.deepStrictEqual(r.error, 'data is not an array')
        }
    })

})
