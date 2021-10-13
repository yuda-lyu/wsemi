import assert from 'assert'
import getCsvStrFromData from '../src/getCsvStrFromData.mjs'


describe(`getCsvStrFromData`, function() {
    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
        [5, '\r\n', true, 'false'],
    ]
    let cdata = JSON.stringify(data)
    let ccsv = getCsvStrFromData(data)

    it(`should return ${ccsv} when input ${cdata}`, function() {
        let r = getCsvStrFromData(data)
        assert.strict.deepStrictEqual(r, ccsv)
    })

})
