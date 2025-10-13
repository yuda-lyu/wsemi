import assert from 'assert'
import getExcelWorksheetFromData from '../src/getExcelWorksheetFromData.mjs'


describe(`getExcelWorksheetFromData`, function() {

    let mat = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]

    // let ws1 = getExcelWorksheetFromData(mat)
    //  console.log('ws1', ws1)
    let ws1Out = {
        'A1': { v: 'a', t: 's' },
        'B1': { v: '123', t: 's' },
        'C1': { v: 456, t: 'n' },
        'B2': { v: 'abc123', t: 's' },
        'C2': { v: '', t: 's' },
        'D2': { v: 111.222333, t: 'n' },
        '!ref': 'A1:D2'
    }

    it(`should return ${JSON.stringify(ws1Out)} when input ${JSON.stringify(mat)}`, function() {
        let r = getExcelWorksheetFromData(mat)
        r = JSON.stringify(r)
        let rr = ws1Out
        rr = JSON.stringify(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

    let ltdt = [
        { x: 'a', y: '123', z: 456 },
        { x: null, y: 'abc123', z: '', a: 111.222333 },
    ]

    // let ws2 = getExcelWorksheetFromData(ltdt)
    // console.log('ws2', ws2)
    let ws2Out = {
        'A1': { v: 'x', t: 's' },
        'B1': { v: 'y', t: 's' },
        'C1': { v: 'z', t: 's' },
        'D1': { v: 'a', t: 's' },
        'A2': { v: 'a', t: 's' },
        'B2': { v: '123', t: 's' },
        'C2': { v: 456, t: 'n' },
        'D2': { v: '', t: 's' },
        'A3': { v: 'null', t: 's' },
        'B3': { v: 'abc123', t: 's' },
        'C3': { v: '', t: 's' },
        'D3': { v: 111.222333, t: 'n' },
        '!ref': 'A1:D3'
    }

    it(`should return ${JSON.stringify(ws2Out)} when input ${JSON.stringify(ltdt)}`, function() {
        let r = getExcelWorksheetFromData(ltdt)
        r = JSON.stringify(r)
        let rr = ws2Out
        rr = JSON.stringify(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

})
