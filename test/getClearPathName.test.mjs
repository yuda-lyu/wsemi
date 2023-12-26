import assert from 'assert'
import getClearPathName from '../src/getClearPathName.mjs'


describe(`getClearPathName`, function() {
    let cin = []
    let cout = []
    let i = -1
    let j

    i++
    cin[i] = 'C:\\temp\\myfile.html'
    cout[i] = { path: 'C:\\temp\\myfile.html', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 0
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\myfile.txt.html'
    cout[i] = { path: 'C:\\temp\\myfile.txt.html', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 1
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\myfile'
    cout[i] = { path: 'C:\\temp\\myfile', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 2
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\\\temp\\\\myfile.txt.html'
    cout[i] = { path: 'C:\\temp\\temp\\myfile.txt.html', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 3
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp\\'
    cout[i] = { path: 'C:\\temp', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 4
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\temp'
    cout[i] = { path: 'C:\\temp', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 5
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:\\'
    cout[i] = { path: 'C:\\', isRoot: true }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 6
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'C:'
    cout[i] = { path: 'C:\\', isRoot: true }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 7
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile.html'
    cout[i] = { path: '/tmp/myfile.html', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 8
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile.txt.html'
    cout[i] = { path: '/tmp/myfile.txt.html', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 9
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/myfile'
    cout[i] = { path: '/tmp/myfile', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 10
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '//tmp////tmp//myfile.txt.html'
    cout[i] = { path: '/tmp/tmp/myfile.txt.html', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 11
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp/'
    cout[i] = { path: '/tmp', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 12
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/tmp'
    cout[i] = { path: '/tmp', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 13
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/'
    cout[i] = { path: '/', isRoot: true }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 14
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux.html'
    cout[i] = { path: '/foo/bar/baz/asdf/quux.html', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 15
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux.txt.html'
    cout[i] = { path: '/foo/bar/baz/asdf/quux.txt.html', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 16
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '/foo/bar/baz/asdf/quux'
    cout[i] = { path: '/foo/bar/baz/asdf/quux', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 17
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 'abc'
    cout[i] = { path: 'abc', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 18
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '12'
    cout[i] = { path: '12', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 19
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = 12
    cout[i] = { path: '', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 20
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = ''
    cout[i] = { path: '', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 21
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '[]'
    cout[i] = { path: '[]', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 22
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = '{}'
    cout[i] = { path: '{}', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 23
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = null
    cout[i] = { path: '', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 24
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

    i++
    cin[i] = undefined
    cout[i] = { path: '', isRoot: false }
    it(`should return ${JSON.stringify(cout[i])} when '${cin[i]}'`, function() {
        j = 25
        let r = getClearPathName(cin[j])
        assert.strict.deepStrictEqual(r, cout[j])
    })

})
