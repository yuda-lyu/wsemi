import assert from 'assert'
import getDirName from '../src/getDirName.mjs'


describe(`getDirName`, function() {
    let cin = []
    let cout = []
    let i = -1
    let j

    i++
    cin[i] = 'C:\\temp\\myfile.html'
    cout[i] = 'C:\\temp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 0
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\myfile.txt.html'
    cout[i] = 'C:\\temp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 1
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\myfile'
    cout[i] = 'C:\\temp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 2
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\\\temp\\\\myfile.txt.html'
    cout[i] = 'C:\\temp\\temp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 3
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\'
    cout[i] = 'C:\\'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 4
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp'
    cout[i] = 'C:\\'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 5
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\'
    cout[i] = 'C:\\'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 6
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:'
    cout[i] = 'C:\\'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 7
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile.html'
    cout[i] = '/tmp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 8
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile.txt.html'
    cout[i] = '/tmp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 9
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile'
    cout[i] = '/tmp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 10
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '//tmp////tmp//myfile.txt.html'
    cout[i] = '/tmp/tmp'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 11
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/'
    cout[i] = '/'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 12
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp'
    cout[i] = '/'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 13
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/'
    cout[i] = '/'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 14
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux.html'
    cout[i] = '/foo/bar/baz/asdf'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 15
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux.txt.html'
    cout[i] = '/foo/bar/baz/asdf'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 16
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux'
    cout[i] = '/foo/bar/baz/asdf'
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 17
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'abc'
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 18
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '12'
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 19
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 12
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 20
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = ''
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 21
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '[]'
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 22
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '{}'
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 23
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = null
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 24
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = undefined
    cout[i] = ''
    it(`should return ${cout[i]} when '${cin[i]}'`, function() {
        j = 25
        let r = getDirName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

})
