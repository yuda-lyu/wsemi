import assert from 'assert'
import ot from 'dayjs'
import nowstr from '../src/nowstr.mjs'


describe('nowstr', function() {

    //還是有可能剛好遇到時間差1s
    let r = nowstr()
    let d = ot()
    let rr = d.format('YYYY/MM/DD HH:mm:ss')
    it(`should return ${rr} when input ${r}`, function() {
        assert.strict.deepEqual(r, rr)
    })

})
