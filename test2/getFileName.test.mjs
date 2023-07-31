import assert from 'assert'
import getFileName from '../src/getFileName.mjs'


describe(`getFileName`, function() {
    let cin = []
    let cout = []
    let i = -1
    let j

    i++
    cin[i] = 'C:\\temp\\myfile.html'
    cout[i] = 'myfile.html'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\myfile.txt.html'
    cout[i] = 'myfile.txt.html'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\myfile'
    cout[i] = 'myfile'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\\\temp\\\\myfile.txt.html'
    cout[i] = 'myfile.txt.html'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\'
    cout[i] = 'temp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp'
    cout[i] = 'temp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\'
    cout[i] = 'C:\\'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:'
    cout[i] = 'C:\\'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile.html'
    cout[i] = 'myfile.html'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile.txt.html'
    cout[i] = 'myfile.txt.html'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile'
    cout[i] = 'myfile'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '//tmp////tmp//myfile.txt.html'
    cout[i] = 'myfile.txt.html'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/'
    cout[i] = '/tmp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp'
    cout[i] = '/tmp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/'
    cout[i] = '/'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux.html'
    cout[i] = 'quux.html'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux.txt.html'
    cout[i] = 'quux.txt.html'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux'
    cout[i] = 'quux'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'abc'
    cout[i] = 'abc'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '12'
    cout[i] = '12'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 12
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = ''
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '[]'
    cout[i] = '[]'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '{}'
    cout[i] = '{}'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = null
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = undefined
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

})
