import assert from 'assert'
import xlsx from 'xlsx'
import getExcelWorkbookFromWorksheet from '../src/getExcelWorkbookFromWorksheet.mjs'


describe(`getExcelWorkbookFromWorksheet`, function() {

    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]
    let cdata = JSON.stringify(data)
    let ws = xlsx.utils.aoa_to_sheet(data)
    let wb1 = getExcelWorkbookFromWorksheet(ws)
    let wb1name = wb1.SheetNames[0]
    let wb2 = getExcelWorkbookFromWorksheet(ws, 'tester')
    let wb2name = wb2.SheetNames[0]

    it(`should return sheet.name=${wb1name} when input ${cdata}`, function() {
        let wb = getExcelWorkbookFromWorksheet(data)
        let r = wb.SheetNames[0]
        assert.strict.deepStrictEqual(r, wb1name)
    })

    it(`should return sheet.name=${wb2name} when input ${cdata}, 'tester'`, function() {
        let wb = getExcelWorkbookFromWorksheet(data, 'tester')
        let r = wb.SheetNames[0]
        assert.strict.deepStrictEqual(r, wb2name)
    })

})
