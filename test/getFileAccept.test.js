import assert from 'assert'
import getFileAccept from '../src/getFileAccept.mjs'


describe(`getFileAccept`, function() {

    let o1 = {
        name: 'pdf',
        group: 'docums',
        acp: 'application/pdf',
        exec: 'acrobat'
    }
    it(`should return ${JSON.stringify(o1)} when no input`, function() {
        let r = getFileAccept()[2]
        assert.strict.deepEqual(r, o1)
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
    it(`should return ${JSON.stringify(o2)} when 'acp'`, function() {
        let r = getFileAccept('acp')['text/html']
        assert.strict.deepEqual(r, o2)
    })

})
