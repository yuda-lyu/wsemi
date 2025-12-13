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
    let r1 = `MY FIRST HEADING

My first paragraph.`

    it(`should return '${replace(r1, '\n', '')}' when input '${replace(h1, '\n', '')}'`, async function() {
        let r = await html2str(h1)
        assert.strict.deepStrictEqual(r, r1)
    })

    it(`should return true when input true`, async function() {
        let r = await html2str(true)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input false`, async function() {
        let r = await html2str(false)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input 0`, async function() {
        let r = await html2str(0)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return true when input 1`, async function() {
        let r = await html2str(1)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return true when input '1'`, async function() {
        let r = await html2str('1')
        assert.strict.deepStrictEqual(r, '1')
    })

    it(`should return true when input 'true'`, async function() {
        let r = await html2str('true')
        assert.strict.deepStrictEqual(r, 'true')
    })

    it(`should return true when input 'tRuE'`, async function() {
        let r = await html2str('tRuE')
        assert.strict.deepStrictEqual(r, 'tRuE')
    })

    it(`should return true when input 'TRUE'`, async function() {
        let r = await html2str('TRUE')
        assert.strict.deepStrictEqual(r, 'TRUE')
    })

    it(`should return false when input 'abc'`, async function() {
        let r = await html2str('abc')
        assert.strict.deepStrictEqual(r, 'abc')
    })

    it(`should return false when input ''`, async function() {
        let r = await html2str('')
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input []`, async function() {
        let r = await html2str([])
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input {}`, async function() {
        let r = await html2str({})
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input null`, async function() {
        let r = await html2str(null)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input undefined`, async function() {
        let r = await html2str(undefined)
        assert.strict.deepStrictEqual(r, '')
    })

    it(`should return false when input NaN`, async function() {
        let r = await html2str(NaN)
        assert.strict.deepStrictEqual(r, '')
    })

})
