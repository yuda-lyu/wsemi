import assert from 'assert'
import getExcelWorksheetFromData from '../src/getExcelWorksheetFromData.mjs'


describe(`getExcelWorksheetFromData`, function() {

    let mat = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]

    // let ws1 = getExcelWorksheetFromData(mat)
    // console.log('ws1', ws1)
    let ws1Out = {
        rows: [
            ['a', '123', 456],
            [null, 'abc123', '', 111.222333],
        ],
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
        rows: [
            ['x', 'y', 'z', 'a'],
            ['a', '123', 456, ''],
            ['null', 'abc123', '', 111.222333],
        ],
    }

    it(`should return ${JSON.stringify(ws2Out)} when input ${JSON.stringify(ltdt)}`, function() {
        let r = getExcelWorksheetFromData(ltdt)
        r = JSON.stringify(r)
        let rr = ws2Out
        rr = JSON.stringify(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

    it(`should return error object when data is not an array (element not supported anymore)`, function() {
        for (let v of [null, undefined, 123, 'abc', {}]) {
            let r = getExcelWorksheetFromData(v)
            assert.strict.deepStrictEqual(r.error, 'data is not an array')
        }
    })

})
