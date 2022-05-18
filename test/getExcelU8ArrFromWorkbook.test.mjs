import assert from 'assert'
import getExcelWorkbookFromData from '../src/getExcelWorkbookFromData.mjs'
import getExcelU8ArrFromWorkbook from '../src/getExcelU8ArrFromWorkbook.mjs'


describe(`getExcelU8ArrFromWorkbook`, function() {

    let data = [
        ['a', '123', 456],
        [null, 'abc123', '', 111.222333],
    ]

    let wb = getExcelWorkbookFromData(data)
    let u8a = getExcelU8ArrFromWorkbook(wb)
    // console.log(u8a)
    // => Uint8Array(15997) [
    //    80,  75,   3,   4,  20,   0,   0,   0,   0,   0,   0,   0,
    //    0,   0, 164,   1, 132, 184, 181,   2,   0,   0, 181,   2,
    //    0,   0,  26,   0,   0,   0, 120, 108,  47,  95, 114, 101,
    //  108, 115,  47, 119, 111, 114, 107,  98, 111, 111, 107,  46,
    //  120, 109, 108,  46, 114, 101, 108, 115,  60,  63, 120, 109,
    //  108,  32, 118, 101, 114, 115, 105, 111, 110,  61,  34,  49,
    //   46,  48,  34,  32, 101, 110,  99, 111, 100, 105, 110, 103,
    //   61,  34,  85,  84,  70,  45,  56,  34,  32, 115, 116,  97,
    //  110, 100,  97, 108,
    //  ... 15897 more items
    // ]
    let u8aLength = u8a.length

    it(`should return u8a.length=${u8aLength} when input ${JSON.stringify(wb)}`, function() {
        let u8a = getExcelU8ArrFromWorkbook(wb)
        let r = u8a.length
        let rr = u8aLength
        assert.strict.deepStrictEqual(r, rr)
    })

})
