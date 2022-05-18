import assert from 'assert'
import getExcelWorksheetFromData from '../src/getExcelWorksheetFromData.mjs'


describe(`getExcelWorksheetFromData`, function() {

    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]

    // let ws = getExcelWorksheetFromData(data)
    //  console.log(ws)
    let wsOut = {
        'A1': { v: 'a', t: 's' },
        'B1': { v: '123', t: 's' },
        'C1': { v: 456, t: 'n' },
        'B2': { v: 'abc123', t: 's' },
        'C2': { v: '', t: 's' },
        'D2': { v: 111.222333, t: 'n' },
        '!ref': 'A1:D2'
    }

    it(`should return ${JSON.stringify(wsOut)} when input ${JSON.stringify(data)}`, function() {
        let r = getExcelWorksheetFromData(data)
        r = JSON.stringify(r)
        let rr = wsOut
        rr = JSON.stringify(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

})
