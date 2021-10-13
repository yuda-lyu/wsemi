import assert from 'assert'
import getExcelWorkbookFromData from '../src/getExcelWorkbookFromData.mjs'


describe(`getExcelWorkbookFromData`, function() {
    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]
    let cdata = JSON.stringify(data)
    let wb1 = getExcelWorkbookFromData(data)
    let wb1name = wb1.SheetNames[0]
    let wb2 = getExcelWorkbookFromData(data, 'tester')
    let wb2name = wb2.SheetNames[0]

    it(`should return sheet.name=${wb1name} when input ${cdata}`, function() {
        let wb = getExcelWorkbookFromData(data)
        let r = wb.SheetNames[0]
        assert.strict.deepStrictEqual(r, wb1name)
    })

    it(`should return sheet.name=${wb2name} when input ${cdata}, 'tester'`, function() {
        let wb = getExcelWorkbookFromData(data, 'tester')
        let r = wb.SheetNames[0]
        assert.strict.deepStrictEqual(r, wb2name)
    })

})
