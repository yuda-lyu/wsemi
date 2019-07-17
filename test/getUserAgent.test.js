import assert from 'assert'
import getUserAgent from '../src/getUserAgent.mjs'


describe(`getUserAgent`, function() {

    let ua = 'Mozilla/5.0 (compatible; Konqueror/4.1; OpenBSD) KHTML/4.1.4 (like Gecko)'

    it(`should return true when input '${ua}'`, function() {
        let r = getUserAgent(ua)
        let rr = {
            browsername: 'Konqueror',
            browserversion: '4.1',
            cpuarchitecture: '',
            devicetype: '',
            engineinfor: 'KHTML4.1.4',
            platform: 'OpenBSDundefined'
        }
        assert.strict.deepEqual(r, rr)
    })

})
