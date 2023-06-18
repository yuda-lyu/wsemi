import assert from 'assert'
import createExcelWorkbook from '../src/createExcelWorkbook.mjs'


describe(`createExcelWorkbook`, function() {

    //  let wb = createExcelWorkbook()
    //  console.log(wb)
    let wb = { SheetNames: [], Sheets: {} }

    it(`should return ${JSON.stringify(wb)} when input undefined`, function() {
        let r = createExcelWorkbook()
        r = JSON.stringify(r)
        let rr = wb
        rr = JSON.stringify(rr)
        assert.strict.deepStrictEqual(r, rr)
    })

})
