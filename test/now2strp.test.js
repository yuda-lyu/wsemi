import assert from 'assert'
import ot from 'dayjs'
import now2strp from '../src/now2strp.mjs'


describe('now2strp', function() {

    //還是有可能剛好遇到時間差1s
    let r = now2strp()
    let d = ot()
    let rr = d.format('YYYYMMDDHHmmss')
    it(`should return ${rr} when input ${r}`, function() {
        assert.strict.deepEqual(r, rr)
    })

})
