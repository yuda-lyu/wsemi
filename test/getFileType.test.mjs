import assert from 'assert'
import getFileType from '../src/getFileType.mjs'


describe(`getFileType`, function() {

    let o1 = {
        name: 'html',
        group: 'docums',
        acp: 'text/html',
        exec: 'browser',
    }
    it(`should return ${JSON.stringify(o1)} when 'html'`, function() {
        let r = getFileType('html')
        assert.strict.deepStrictEqual(r, o1)
    })

    let o2 = {
        name: 'zip',
        group: 'compress',
        acp: 'application/zip',
        exec: 'compressor'
    }
    it(`should return ${JSON.stringify(o2)} when 'zip'`, function() {
        let r = getFileType('zip')
        assert.strict.deepStrictEqual(r, o2)
    })

})
