import assert from 'assert'
import cloneDeep from 'lodash-es/cloneDeep'
import createExcelWorkbook from '../src/createExcelWorkbook.mjs'
import addExcelWorksheetFromData from '../src/addExcelWorksheetFromData.mjs'


describe(`addExcelWorksheetFromData`, function() {

    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]

    let wb = createExcelWorkbook()
    // console.log(wb)
    // => Workbook { SheetNames: [], Sheets: {} }

    let wbIn = cloneDeep(wb)

    let wbOut = {
        'SheetNames': [
            'tester'
        ],
        'Sheets': {
            'tester': {
                'A1': {
                    'v': 'a',
                    't': 's'
                },
                'B1': {
                    'v': '123',
                    't': 's'
                },
                'C1': {
                    'v': 456,
                    't': 'n'
                },
                'B2': {
                    'v': 'abc123',
                    't': 's'
                },
                'C2': {
                    'v': '',
                    't': 's'
                },
                'D2': {
                    'v': 111.222333,
                    't': 'n'
                },
                '!ref': 'A1:D2'
            }
        }
    }

    it(`should return ${JSON.stringify(wbOut)} when input ${JSON.stringify(wbIn)}, ${JSON.stringify(data)}, 'tester'`, function() {
        let r = addExcelWorksheetFromData(wb, data, 'tester')
        r = JSON.stringify(r)
        let rr = wbOut
        rr = JSON.stringify(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

})
