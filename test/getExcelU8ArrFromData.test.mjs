import assert from 'assert'
import getExcelU8ArrFromData from '../src/getExcelU8ArrFromData.mjs'


describe(`getExcelU8ArrFromData`, function() {
    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]
    let cdata = JSON.stringify(data)
    let u8a = getExcelU8ArrFromData(data)
    let u8aLength = u8a.length

    it(`should return u8a.length=${u8aLength} when input ${cdata}`, function() {
        let u8a = getExcelU8ArrFromData(data)
        let r = u8a.length
        assert.strict.deepStrictEqual(r, u8aLength)
    })

})
