import assert from 'assert'
import getFileAccept from '../src/getFileAccept.mjs'


describe(`getFileAccept`, function() {

    let o1 = {
        name: 'json',
        group: 'data',
        acp: 'application/json',
        exec: 'textviwer',
    }
    it(`should return ${JSON.stringify(o1)} when no input and get [4]`, function() {
        let r = getFileAccept()[4]
        assert.strict.deepStrictEqual(r, o1)
    })

    let o2 = [{
        name: 'htm',
        group: 'docums',
        acp: 'text/html',
        exec: 'browser'
    },
    {
        name: 'html',
        group: 'docums',
        acp: 'text/html',
        exec: 'browser'
    }]
    it(`should return ${JSON.stringify(o2)} when 'acp' and get ['text/html']`, function() {
        let r = getFileAccept('acp')['text/html']
        assert.strict.deepStrictEqual(r, o2)
    })

})
