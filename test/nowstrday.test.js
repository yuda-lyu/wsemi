import assert from 'assert'
import ot from 'dayjs'
import nowstrday from '../src/nowstrday.mjs'


describe('nowstrday', function() {

    //�٬O���i���n�J��ɶ��t1day
    let r = nowstrday()
    let d = ot()
    let rr = d.format('YYYY/MM/DD')
    it(`should return ${rr} when input ${r}`, function() {
        assert.strict.deepEqual(r, rr)
    })

})