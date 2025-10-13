import assert from 'assert'
import getFileTrueName from '../src/getFileTrueName.mjs'


describe(`getFileTrueName`, function() {
    let cin = []
    let cout = []
    let i = -1
    let j

    i++
    cin[i] = 'C:\\temp\\myfile.html'
    cout[i] = 'myfile'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\myfile.txt.html'
    cout[i] = 'myfile.txt'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 1
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\myfile'
    cout[i] = 'myfile'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 2
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\\\temp\\\\myfile.txt.html'
    cout[i] = 'myfile.txt'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 3
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\'
    cout[i] = 'temp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 4
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp'
    cout[i] = 'temp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 5
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\'
    cout[i] = 'C:\\'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 6
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:'
    cout[i] = 'C:\\'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 7
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile.html'
    cout[i] = 'myfile'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 8
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile.txt.html'
    cout[i] = 'myfile.txt'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 9
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile'
    cout[i] = 'myfile'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 10
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '//tmp////tmp//myfile.txt.html'
    cout[i] = 'myfile.txt'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 11
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/'
    cout[i] = 'tmp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 12
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp'
    cout[i] = 'tmp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 13
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/'
    cout[i] = '/'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 14
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux.html'
    cout[i] = 'quux'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 15
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux.txt.html'
    cout[i] = 'quux.txt'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 16
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux'
    cout[i] = 'quux'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 17
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'abc'
    cout[i] = 'abc'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 18
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '12'
    cout[i] = '12'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 19
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 12
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 20
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = ''
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 21
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '[]'
    cout[i] = '[]'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 22
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '{}'
    cout[i] = '{}'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 23
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = null
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 24
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = undefined
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 25
        let r = getFileTrueName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

})
