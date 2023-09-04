import assert from 'assert'
import html2str from '../src/html2str.mjs'


describe(`html2str`, function() {
    function replace(c, t, r) {
        let o = new RegExp(t, 'g')
        let rr = String(c).replace(o, r)
        return rr
    }

    let h1 = `<!DOCTYPE html>
<html>

<body>
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>
</body>

</html>`
    let r1 = '\n\n\n\n    My First Heading\n    My first paragraph.\n\n\n'

    it(`should return '${replace(r1, '\n', '')}' when input '${replace(h1, '\n', '')}'`, function() {
        let r = html2str(h1)
        assert.strict.deepStrictEqual(r, r1)
    })

    it(`should return true when input true`, function() {
        let r = html2str(true)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input false`, function() {
        let r = html2str(false)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input 0`, function() {
        let r = html2str(0)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return true when input 1`, function() {
        let r = html2str(1)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return true when input '1'`, function() {
        let r = html2str('1')
        assert.strict.deepStrictEqual(r, '1')
    })

    it(`should return true when input 'true'`, function() {
        let r = html2str('true')
        assert.strict.deepStrictEqual(r, 'true')
    })

    it(`should return true when input 'tRuE'`, function() {
        let r = html2str('tRuE')
        assert.strict.deepStrictEqual(r, 'tRuE')
    })

    it(`should return true when input 'TRUE'`, function() {
        let r = html2str('TRUE')
        assert.strict.deepStrictEqual(r, 'TRUE')
    })

    it(`should return false when input 'abc'`, function() {
        let r = html2str('abc')
        assert.strict.deepStrictEqual(r, 'abc')
    })

    it(`should return false when input ''`, function() {
        let r = html2str('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input []`, function() {
        let r = html2str([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input {}`, function() {
        let r = html2str({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input null`, function() {
        let r = html2str(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input undefined`, function() {
        let r = html2str(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input NaN`, function() {
        let r = html2str(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

})
