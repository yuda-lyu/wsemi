import assert from 'assert'
import cloneDeep from 'lodash-es/cloneDeep.js'
import createExcelWorkbook from '../src/createExcelWorkbook.mjs'
import addExcelWorksheetFromData from '../src/addExcelWorksheetFromData.mjs'


describe(`addExcelWorksheetFromData`, function() {

    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]

    let wb = createExcelWorkbook()
    // console.log(wb)
    // => { sheets: [] }

    let wbIn = cloneDeep(wb)

    let wbOut = {
        sheets: [
            {
                rows: [
                    ['a', '123', 456],
                    [null, 'abc123', '', 111.222333],
                ],
                name: 'tester',
            },
        ],
    }

    it(`should return ${JSON.stringify(wbOut)} when input ${JSON.stringify(wbIn)}, ${JSON.stringify(data)}, 'tester'`, function() {
        let r = addExcelWorksheetFromData(wb, data, 'tester')
        r = JSON.stringify(r)
        let rr = wbOut
        rr = JSON.stringify(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should append multi sheets in order`, function() {
        let wb2 = createExcelWorkbook()
        addExcelWorksheetFromData(wb2, [['a1']], 's1')
        addExcelWorksheetFromData(wb2, [['b1']], 's2')
        assert.strict.deepStrictEqual(wb2.sheets.length, 2)
        assert.strict.deepStrictEqual(wb2.sheets[0].name, 's1')
        assert.strict.deepStrictEqual(wb2.sheets[1].name, 's2')
    })

    it(`should return error object when wb is invalid`, function() {
        assert.strict.deepStrictEqual(addExcelWorksheetFromData(null, data).error, 'wb is not an effective object')
        assert.strict.deepStrictEqual(addExcelWorksheetFromData({ a: 1 }, data).error, 'wb.sheets is not an array')
    })

    it(`should return error object when data is invalid`, function() {
        let wb3 = createExcelWorkbook()
        let r = addExcelWorksheetFromData(wb3, 'not-array', 's1')
        assert.strict.deepStrictEqual(r.error, 'data is not an array')
        assert.strict.deepStrictEqual(wb3.sheets.length, 0)
    })

})
