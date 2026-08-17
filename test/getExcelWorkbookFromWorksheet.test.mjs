import assert from 'assert'
import getExcelWorksheetFromData from '../src/getExcelWorksheetFromData.mjs'
import getExcelWorkbookFromWorksheet from '../src/getExcelWorkbookFromWorksheet.mjs'


describe(`getExcelWorkbookFromWorksheet`, function() {

    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]
    let cdata = JSON.stringify(data)
    let ws = getExcelWorksheetFromData(data)

    it(`should return sheet.name='data' when input ${cdata}`, function() {
        let wb = getExcelWorkbookFromWorksheet(ws)
        let r = wb.sheets[0].name
        assert.strict.deepStrictEqual(r, 'data')
        assert.strict.deepStrictEqual(wb.sheets[0].rows, data)
    })

    it(`should return sheet.name='tester' when input ${cdata}, 'tester'`, function() {
        let wb = getExcelWorkbookFromWorksheet(ws, 'tester')
        let r = wb.sheets[0].name
        assert.strict.deepStrictEqual(r, 'tester')
    })

    it(`should return error object when sheet is invalid`, function() {
        assert.strict.deepStrictEqual(getExcelWorkbookFromWorksheet(null).error, 'sheet is not an object')
        assert.strict.deepStrictEqual(getExcelWorkbookFromWorksheet({}).error, 'sheet.rows is not an array')
    })

})
